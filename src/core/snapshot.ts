import {
  applyTransformsToPoint,
  identity,
  invert,
  multiply,
  type Mat,
} from './matrix';
import { ZERO_VECTOR } from './geometry';
import {
  getIsHitTestSuccessful,
  type HitTestDescriptor,
} from './hitTestDescriptor';
import type { Vector2d } from './types';

export const DEFAULT_DRAG_DISTANCE = 3;

export const SnapshotNodeType = {
  Stage: 'Stage',
  Layer: 'Layer',
  Group: 'Group',
  Shape: 'Shape',
} as const;
export type SnapshotNodeType =
  (typeof SnapshotNodeType)[keyof typeof SnapshotNodeType];

export interface SnapshotNode {
  id: number;
  parentId: number;
  type: SnapshotNodeType;
  paintIndex: number;
  baseMatrix: Mat;
  visible: boolean;
  listening: boolean;
  draggable: boolean;
  gestureEnabled: boolean;
  dragDistance: number;
  hitTestDescriptor: HitTestDescriptor | null;
}

export interface Snapshot {
  nodes: Record<number, SnapshotNode>;
  children: Record<number, number[]>;
  rootId: number;
}

export const EMPTY_SNAPSHOT: Snapshot = { nodes: {}, children: {}, rootId: -1 };

export type OffsetLookup = (id: number) => Vector2d;

function getLocalMatrix(node: SnapshotNode, offset: Vector2d): Mat {
  'worklet';
  if (offset.x === 0 && offset.y === 0) return node.baseMatrix;
  return multiply([1, 0, 0, 1, offset.x, offset.y], node.baseMatrix);
}

export function getAbsoluteMatrixFromSnapshot(
  snapshot: Snapshot,
  getOffset: OffsetLookup,
  id: number
): Mat {
  'worklet';
  const snapshotNodesChain: number[] = [];
  let cur = id;
  while (cur !== -1 && snapshot.nodes[cur]) {
    snapshotNodesChain.push(cur);
    cur = snapshot.nodes[cur]!.parentId;
  }
  let m: Mat = identity();
  for (let i = snapshotNodesChain.length - 1; i >= 0; i--) {
    const snapshotNode = snapshot.nodes[snapshotNodesChain[i]!]!;
    m = multiply(m, getLocalMatrix(snapshotNode, getOffset(snapshotNode.id)));
  }
  return m;
}

export function getAbsolutePositionFromSnapshot(
  snapshot: Snapshot,
  getOffset: OffsetLookup,
  id: number
): Vector2d {
  'worklet';
  return applyTransformsToPoint(
    getAbsoluteMatrixFromSnapshot(snapshot, getOffset, id),
    ZERO_VECTOR
  );
}

export function getAncestorChainFromSnapshot(
  snapshot: Snapshot,
  id: number
): number[] {
  'worklet';
  const out: number[] = [];
  let cur = id;
  while (cur !== -1 && snapshot.nodes[cur]) {
    out.push(cur);
    cur = snapshot.nodes[cur]!.parentId;
  }
  return out;
}

export function findDragTarget(snapshot: Snapshot, id: number): number {
  'worklet';
  let cur = id;
  while (cur !== -1 && snapshot.nodes[cur]) {
    if (snapshot.nodes[cur]!.draggable) return cur;
    cur = snapshot.nodes[cur]!.parentId;
  }
  return -1;
}

export function getHitNodeIdFromSnapshot(
  snapshot: Snapshot,
  getOffset: OffsetLookup,
  id: number,
  px: number,
  py: number
): number {
  'worklet';
  const node = snapshot.nodes[id];
  if (!node) return -1;
  if (!node.visible || !node.listening) return -1;

  const children = snapshot.children[id];
  if (children) {
    for (let i = children.length - 1; i >= 0; i--) {
      const hitNodeId = getHitNodeIdFromSnapshot(
        snapshot,
        getOffset,
        children[i]!,
        px,
        py
      );
      if (hitNodeId !== -1) return hitNodeId;
    }
  }

  if (
    node.type === SnapshotNodeType.Shape &&
    (node.gestureEnabled || node.draggable) &&
    node.hitTestDescriptor
  ) {
    const inv = invert(getAbsoluteMatrixFromSnapshot(snapshot, getOffset, id));
    if (!inv) return -1;
    const lp = applyTransformsToPoint(inv, { x: px, y: py });
    if (
      getIsHitTestSuccessful(
        node.hitTestDescriptor.shape,
        node.hitTestDescriptor.params,
        node.hitTestDescriptor.points,
        lp.x,
        lp.y
      )
    ) {
      return id;
    }
  }
  return -1;
}
