import type { NodeConfig, NodeHandle, Vector2d } from './types';
import { buildAffineMatrixFromConfig, type Mat } from './matrix';
import { resolveTransform, type ResolvedTransform } from './transform';
import {
  getSelfRect as getSelfRectFromDescriptor,
  getClientRect as getClientRectFromMatrix,
  unionRect,
  type Rect,
} from './bounds';
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
  type TransformLookup,
  type Snapshot,
  type SnapshotNode,
} from './snapshot';
import type { SharedValue } from 'react-native-reanimated';
import { ZERO_VECTOR, UNIT_VECTOR } from './geometry';

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
  private idToScaleMap = new Map<number, SharedValue<Vector2d>>();
  private idToRotationMap = new Map<number, SharedValue<number>>();
  private idToResolvedTransformMap = new Map<
    number,
    SharedValue<ResolvedTransform>
  >();
  private nextId = 1;

  private snapshot: Snapshot = EMPTY_SNAPSHOT;
  private isSnapshotStale = true;
  private rootId = -1;

  private listeners = new Set<() => void>();
  private flushScheduled = false;
  idToTransformMapVersion = 0;

  private getTransform: TransformLookup = (id) => ({
    offset: this.idToDragOffsetMap.get(id)?.value ?? ZERO_VECTOR,
    scale: this.idToScaleMap.get(id)?.value ?? UNIT_VECTOR,
    rotation: this.idToRotationMap.get(id)?.value ?? 0,
  });

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
    this.idToTransformMapVersion++;
    this.invalidateSnapshot();
  }

  unregisterDragOffset(id: number): void {
    if (this.idToDragOffsetMap.delete(id)) {
      this.idToTransformMapVersion++;
      this.invalidateSnapshot();
    }
  }

  registerScale(id: number, ref: SharedValue<Vector2d>): void {
    this.idToScaleMap.set(id, ref);
    this.idToTransformMapVersion++;
    this.invalidateSnapshot();
  }

  unregisterScale(id: number): void {
    if (this.idToScaleMap.delete(id)) {
      this.idToTransformMapVersion++;
      this.invalidateSnapshot();
    }
  }

  registerRotation(id: number, ref: SharedValue<number>): void {
    this.idToRotationMap.set(id, ref);
    this.idToTransformMapVersion++;
    this.invalidateSnapshot();
  }

  unregisterRotation(id: number): void {
    if (this.idToRotationMap.delete(id)) {
      this.idToTransformMapVersion++;
      this.invalidateSnapshot();
    }
  }

  registerResolvedTransform(
    id: number,
    ref: SharedValue<ResolvedTransform>
  ): void {
    this.idToResolvedTransformMap.set(id, ref);
    this.invalidateSnapshot();
  }

  unregisterResolvedTransform(id: number): void {
    if (this.idToResolvedTransformMap.delete(id)) {
      this.invalidateSnapshot();
    }
  }

  getIdToDragOffsetMap(): Record<number, SharedValue<Vector2d>> {
    const byId: Record<number, SharedValue<Vector2d>> = {};
    for (const [id, ref] of this.idToDragOffsetMap) byId[id] = ref;
    return byId;
  }

  getIdToScaleMap(): Record<number, SharedValue<Vector2d>> {
    const byId: Record<number, SharedValue<Vector2d>> = {};
    for (const [id, ref] of this.idToScaleMap) byId[id] = ref;
    return byId;
  }

  getIdToRotationMap(): Record<number, SharedValue<number>> {
    const byId: Record<number, SharedValue<number>> = {};
    for (const [id, ref] of this.idToRotationMap) byId[id] = ref;
    return byId;
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
      transform: resolveTransform(cfg),
      baseMatrix: node.getBaseMatrix(),
      visible: cfg.visible !== false,
      listening: cfg.listening !== false,
      draggable: cfg.draggable === true,
      gestureEnabled: cfg.gestureEnabled === true,
      multiTouchEnabled: cfg.multiTouchEnabled !== false,
      dragDistance: cfg.dragDistance ?? DEFAULT_DRAG_DISTANCE,
      hitTestDescriptor: node.getHitTestDescriptor?.() ?? null,
      hitTargetId: cfg.hitTargetId ?? -1,
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
      this.getTransform,
      id
    );
  }

  getAbsolutePosition(id: number): Vector2d {
    return getAbsolutePositionFromSnapshot(
      this.getSnapshot(),
      this.getTransform,
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
      getScaleX: () => {
        const cfg = getConfig();
        return (
          (cfg.scaleX ?? cfg.scale?.x ?? 1) *
          (this.idToScaleMap.get(id)?.value.x ?? 1)
        );
      },
      getScaleY: () => {
        const cfg = getConfig();
        return (
          (cfg.scaleY ?? cfg.scale?.y ?? 1) *
          (this.idToScaleMap.get(id)?.value.y ?? 1)
        );
      },
      getRotation: () =>
        (getConfig().rotation ?? 0) +
        (this.idToRotationMap.get(id)?.value ?? 0),
      getAbsolutePosition: () => this.getAbsolutePosition(id),
    };
  }

  getHitNodeId(point: Vector2d, rootId: number): number | null {
    const hitNodeId = getHitNodeIdFromSnapshot(
      this.getSnapshot(),
      this.getTransform,
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

  findBySelector(selector: string): number | null {
    if (!selector) return null;
    const byName = selector[0] === '.';
    const key = selector[0] === '#' || byName ? selector.slice(1) : selector;
    for (const node of this.nodes.values()) {
      const cfg = node.getConfig();
      if (byName ? cfg.name === key : cfg.id === key) return node.id;
    }
    return null;
  }

  getLocalMatrix(id: number): Mat | null {
    const node = this.nodes.get(id);
    if (!node) return null;
    return node.getBaseMatrix();
  }

  getSelfRect(id: number, ignoreStroke = false): Rect | null {
    const node = this.nodes.get(id);
    if (!node) return null;
    const descriptor = node.getHitTestDescriptor?.() ?? null;
    if (descriptor) {
      return getSelfRectFromDescriptor(
        descriptor,
        node.getConfig(),
        ignoreStroke
      );
    }
    let union: Rect | null = null;
    for (const childId of this.sortedChildIds(id)) {
      const childRect = this.getSelfRect(childId, ignoreStroke);
      const childNode = this.nodes.get(childId);
      if (!childRect || !childNode) continue;
      const childBox = getClientRectFromMatrix(
        childRect,
        childNode.getBaseMatrix()
      );
      union = union ? unionRect(union, childBox) : childBox;
    }
    return union;
  }

  getDragOffset(id: number): SharedValue<Vector2d> | undefined {
    return this.idToDragOffsetMap.get(id);
  }

  getScale(id: number): SharedValue<Vector2d> | undefined {
    return this.idToScaleMap.get(id);
  }

  getRotation(id: number): SharedValue<number> | undefined {
    return this.idToRotationMap.get(id);
  }

  getResolvedTransform(id: number): SharedValue<ResolvedTransform> | undefined {
    return this.idToResolvedTransformMap.get(id);
  }

  getClientRect(id: number, ignoreStroke = false): Rect | null {
    const rect = this.getSelfRect(id, ignoreStroke);
    if (!rect) return null;
    return getClientRectFromMatrix(rect, this.getAbsoluteMatrix(id));
  }
}
