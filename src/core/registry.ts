import type { NodeConfig, NodeHandle, Vector2d } from './types';
import {
  applyTransformsToPoint,
  identity,
  invert,
  multiply,
  type Mat,
} from './matrix';

export type NodeType = 'stage' | 'layer' | 'group' | 'shape';

export interface RegisterNodeSpec {
  id?: number;
  parentId: number | null;
  type: NodeType;
  paintIndex?: number;
  getConfig: () => NodeConfig;
  getLocalMatrix: () => Mat;
  hitTest?: (localPoint: Vector2d) => boolean;
}

interface Node {
  id: number;
  parentId: number | null;
  type: NodeType;
  paintIndex: number;
  getConfig: () => NodeConfig;
  getLocalMatrix: () => Mat;
  hitTest?: (localPoint: Vector2d) => boolean;
}

interface ChildList {
  ids: number[];
  unsorted: boolean;
}

export class NodeRegistry {
  private nodes = new Map<number, Node>();
  private children = new Map<number, ChildList>();
  private dragHandlersMap = new Map<number, (x: number, y: number) => void>();
  private nextId = 1;

  allocateId(): number {
    return this.nextId++;
  }

  register(spec: RegisterNodeSpec): number {
    const id = spec.id ?? this.allocateId();
    const node: Node = {
      id,
      parentId: spec.parentId,
      type: spec.type,
      paintIndex: spec.paintIndex ?? 0,
      getConfig: spec.getConfig,
      getLocalMatrix: spec.getLocalMatrix,
      hitTest: spec.hitTest,
    };
    this.nodes.set(id, node);
    if (spec.parentId != null) {
      const list = this.getChildListOf(spec.parentId, true);
      list.ids.push(id);
      list.unsorted = true;
    }
    return id;
  }

  unregister(id: number): void {
    const node = this.nodes.get(id);
    if (!node) return;
    if (node.parentId != null) {
      const list = this.getChildListOf(node.parentId);
      if (list) {
        const i = list.ids.indexOf(id);
        if (i >= 0) list.ids.splice(i, 1);
      }
    }
    this.nodes.delete(id);
  }

  setChildIndex(childId: number, index: number): void {
    const node = this.nodes.get(childId);
    if (!node || node.parentId == null) return;
    if (node.paintIndex !== index) {
      node.paintIndex = index;
      const list = this.getChildListOf(node.parentId);
      if (list) list.unsorted = true;
    }
  }

  has(id: number): boolean {
    return this.nodes.has(id);
  }

  private getChildListOf(parentId: number, createIfMissing: true): ChildList;
  private getChildListOf(
    parentId: number,
    createIfMissing?: false
  ): ChildList | undefined;
  private getChildListOf(
    parentId: number,
    createIfMissing = false
  ): ChildList | undefined {
    let list = this.children.get(parentId);
    if (!list && createIfMissing) {
      list = { ids: [], unsorted: false };
      this.children.set(parentId, list);
    }
    return list;
  }

  private childIds(parentId: number): number[] {
    const list = this.getChildListOf(parentId);
    if (!list) return [];
    if (list.unsorted) {
      list.ids.sort(
        (a, b) =>
          (this.nodes.get(a)?.paintIndex ?? 0) -
          (this.nodes.get(b)?.paintIndex ?? 0)
      );
      list.unsorted = false;
    }
    return list.ids;
  }

  getAbsoluteMatrix(id: number): Mat {
    const chain: Node[] = [];
    let cur = this.nodes.get(id);
    while (cur) {
      chain.push(cur);
      cur = cur.parentId != null ? this.nodes.get(cur.parentId) : undefined;
    }
    let m = identity();
    for (let i = chain.length - 1; i >= 0; i--) {
      m = multiply(m, chain[i]!.getLocalMatrix());
    }
    return m;
  }

  getAbsolutePosition(id: number): Vector2d {
    return applyTransformsToPoint(this.getAbsoluteMatrix(id), { x: 0, y: 0 });
  }

  getAncestorChain(id: number): number[] {
    const out: number[] = [];
    let cur = this.nodes.get(id);
    while (cur) {
      out.push(cur.id);
      cur = cur.parentId != null ? this.nodes.get(cur.parentId) : undefined;
    }
    return out;
  }

  getHandle(id: number): NodeHandle {
    const node = this.nodes.get(id);
    const getConfig: () => NodeConfig = node ? node.getConfig : () => ({});
    return {
      id,
      get attrId() {
        return getConfig().id;
      },
      get name() {
        return getConfig().name;
      },
      getConfig,
      getAbsolutePosition: () => this.getAbsolutePosition(id),
    };
  }

  hitTest(point: Vector2d, rootId: number): number | null {
    return this.hitNode(rootId, point);
  }

  private hitNode(id: number, point: Vector2d): number | null {
    const node = this.nodes.get(id);
    if (!node) return null;
    const cfg = node.getConfig();
    if (cfg.visible === false || cfg.listening === false) {
      return null;
    }
    const children = this.childIds(id);
    for (let i = children.length - 1; i >= 0; i--) {
      const hit = this.hitNode(children[i]!, point);
      if (hit != null) return hit;
    }
    if (node.type === 'shape' && (cfg.gestureEnabled || cfg.draggable)) {
      if (!node.hitTest) return null;
      const inv = invert(this.getAbsoluteMatrix(id));
      if (!inv) return null;
      if (node.hitTest(applyTransformsToPoint(inv, point))) {
        return id;
      }
    }
    return null;
  }

  getDragTarget(id: number): number | null {
    let cur = this.nodes.get(id);
    while (cur) {
      if (cur.getConfig().draggable === true) return cur.id;
      cur = cur.parentId != null ? this.nodes.get(cur.parentId) : undefined;
    }
    return null;
  }

  getConfig(id: number): NodeConfig | undefined {
    return this.nodes.get(id)?.getConfig();
  }

  getParentId(id: number): number | null {
    return this.nodes.get(id)?.parentId ?? null;
  }

  registerDragHandler(id: number, fn: (x: number, y: number) => void): void {
    this.dragHandlersMap.set(id, fn);
  }

  unregisterDragHandler(id: number): void {
    this.dragHandlersMap.delete(id);
  }

  onDrag(id: number, x: number, y: number): void {
    this.dragHandlersMap.get(id)?.(x, y);
  }
}
