import type { NodeConfig, NodeHandle, Vector2d } from './types';
import { buildAffineMatrixFromConfig, type Mat } from './matrix';
import type { HitTestDescriptor } from './hitTestDescriptor';
import {
  DEFAULT_DRAG_DISTANCE,
  EMPTY_SNAPSHOT,
  SnapshotNodeType,
  getAbsoluteMatrixFromSnapshot,
  getAbsolutePositionFromSnapshot,
  getAncestorChainFromSnapshot,
  findDragTarget,
  getHitNodeIdFromSnapshot,
  type OffsetLookup,
  type Snapshot,
  type SnapshotNode,
} from './snapshot';
import type { SharedValue } from 'react-native-reanimated';
import { ZERO_VECTOR } from './geometry';

export type NodeType = 'stage' | 'layer' | 'group' | 'shape';

export interface RegisterNodeSpec {
  id?: number;
  parentId: number | null;
  type: NodeType;
  paintIndex?: number;
  getConfig: () => NodeConfig;
  getBaseMatrix?: () => Mat;
  getHitTestDescriptor?: () => HitTestDescriptor | null;
}

interface Node {
  id: number;
  parentId: number | null;
  type: NodeType;
  paintIndex: number;
  getConfig: () => NodeConfig;
  getBaseMatrix: () => Mat;
  getHitTestDescriptor?: () => HitTestDescriptor | null;
}

interface ChildList {
  ids: number[];
  unsorted: boolean;
}

function getSnapshotNodeType(type: NodeType): SnapshotNodeType {
  switch (type) {
    case 'stage':
      return SnapshotNodeType.Stage;
    case 'layer':
      return SnapshotNodeType.Layer;
    case 'group':
      return SnapshotNodeType.Group;
    default:
      return SnapshotNodeType.Shape;
  }
}

export class NodeRegistry {
  private nodes = new Map<number, Node>();
  private children = new Map<number, ChildList>();
  private idToDragOffsetMap = new Map<number, SharedValue<Vector2d>>();
  private nextId = 1;

  private snapshot: Snapshot = EMPTY_SNAPSHOT;
  private isSnapshotStale = true;
  private rootId = -1;

  private listeners = new Set<() => void>();
  private flushScheduled = false;
  idToDragOffsetMapVersion = 0;

  private offsetLookup: OffsetLookup = (id) =>
    this.idToDragOffsetMap.get(id)?.value ?? ZERO_VECTOR;

  allocateId(): number {
    return this.nextId++;
  }

  register(spec: RegisterNodeSpec): number {
    const id = spec.id ?? this.allocateId();
    const getConfig = spec.getConfig;
    const node: Node = {
      id,
      parentId: spec.parentId,
      type: spec.type,
      paintIndex: spec.paintIndex ?? 0,
      getConfig,
      getBaseMatrix:
        spec.getBaseMatrix ?? (() => buildAffineMatrixFromConfig(getConfig())),
      getHitTestDescriptor: spec.getHitTestDescriptor,
    };
    this.nodes.set(id, node);
    if (spec.parentId != null) {
      const list = this.getChildListOf(spec.parentId, true);
      list.ids.push(id);
      list.unsorted = true;
    } else {
      this.rootId = id;
    }
    this.invalidateSnapshot();
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
    this.invalidateSnapshot();
  }

  setChildIndex(childId: number, index: number): void {
    const node = this.nodes.get(childId);
    if (!node || node.parentId == null) return;
    if (node.paintIndex !== index) {
      node.paintIndex = index;
      const list = this.getChildListOf(node.parentId);
      if (list) list.unsorted = true;
      this.invalidateSnapshot();
    }
  }

  has(id: number): boolean {
    return this.nodes.has(id);
  }

  registerDragOffset(id: number, ref: SharedValue<Vector2d>): void {
    this.idToDragOffsetMap.set(id, ref);
    this.idToDragOffsetMapVersion++;
    this.invalidateSnapshot();
  }

  unregisterDragOffset(id: number): void {
    if (this.idToDragOffsetMap.delete(id)) {
      this.idToDragOffsetMapVersion++;
      this.invalidateSnapshot();
    }
  }

  getIdToDragOffsetMap(): Record<number, SharedValue<Vector2d>> {
    const offsetsById: Record<number, SharedValue<Vector2d>> = {};
    for (const [id, ref] of this.idToDragOffsetMap) offsetsById[id] = ref;
    return offsetsById;
  }

  subscribeToChanges(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  invalidateSnapshot(): void {
    this.isSnapshotStale = true;
    if (this.flushScheduled || this.listeners.size === 0) return;
    this.flushScheduled = true;
    queueMicrotask(() => {
      this.flushScheduled = false;
      for (const listener of this.listeners) listener();
    });
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

  private sortedChildIds(parentId: number): number[] {
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

  private buildSnapshotNode(node: Node): SnapshotNode {
    const cfg = node.getConfig();
    return {
      id: node.id,
      parentId: node.parentId ?? -1,
      type: getSnapshotNodeType(node.type),
      paintIndex: node.paintIndex,
      baseMatrix: node.getBaseMatrix(),
      visible: cfg.visible !== false,
      listening: cfg.listening !== false,
      draggable: cfg.draggable === true,
      gestureEnabled: cfg.gestureEnabled === true,
      dragDistance: cfg.dragDistance ?? DEFAULT_DRAG_DISTANCE,
      hitTestDescriptor: node.getHitTestDescriptor?.() ?? null,
    };
  }

  getSnapshot(): Snapshot {
    if (!this.isSnapshotStale) return this.snapshot;
    const nodes: Record<number, SnapshotNode> = {};
    const children: Record<number, number[]> = {};
    for (const node of this.nodes.values()) {
      nodes[node.id] = this.buildSnapshotNode(node);
      const sorted = this.sortedChildIds(node.id);
      if (sorted.length > 0) children[node.id] = sorted.slice();
    }
    this.snapshot = { nodes, children, rootId: this.rootId };
    this.isSnapshotStale = false;
    return this.snapshot;
  }

  getAbsoluteMatrix(id: number): Mat {
    return getAbsoluteMatrixFromSnapshot(
      this.getSnapshot(),
      this.offsetLookup,
      id
    );
  }

  getAbsolutePosition(id: number): Vector2d {
    return getAbsolutePositionFromSnapshot(
      this.getSnapshot(),
      this.offsetLookup,
      id
    );
  }

  getAncestorChain(id: number): number[] {
    return getAncestorChainFromSnapshot(this.getSnapshot(), id);
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
      getX: () =>
        (getConfig().x ?? 0) + (this.idToDragOffsetMap.get(id)?.value.x ?? 0),
      getY: () =>
        (getConfig().y ?? 0) + (this.idToDragOffsetMap.get(id)?.value.y ?? 0),
      getAbsolutePosition: () => this.getAbsolutePosition(id),
    };
  }

  getHitNodeId(point: Vector2d, rootId: number): number | null {
    const hitNodeId = getHitNodeIdFromSnapshot(
      this.getSnapshot(),
      this.offsetLookup,
      rootId,
      point.x,
      point.y
    );
    return hitNodeId === -1 ? null : hitNodeId;
  }

  getDragTargetId(id: number): number | null {
    const target = findDragTarget(this.getSnapshot(), id);
    return target === -1 ? null : target;
  }

  getConfig(id: number): NodeConfig | undefined {
    return this.nodes.get(id)?.getConfig();
  }

  getParentId(id: number): number | null {
    return this.nodes.get(id)?.parentId ?? null;
  }
}
