import {
  applyTransformsToPoint,
  composeMatrix,
  identity,
  invert,
  multiply,
  type Mat,
} from './matrix';
import { type ResolvedTransform, DEG_TO_RAD } from './transform';
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
  transform: ResolvedTransform;
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

export interface Transform {
  offset: Vector2d;
  scale: Vector2d;
  rotation: number;
}

export type TransformLookup = (id: number) => Transform;

function getLocalMatrix(node: SnapshotNode, transform: Transform): Mat {
  'worklet';
  const off = transform.offset;
  const sc = transform.scale;
  if (
    off.x === 0 &&
    off.y === 0 &&
    sc.x === 1 &&
    sc.y === 1 &&
    transform.rotation === 0
  ) {
    return node.baseMatrix;
  }
  const t = node.transform;
  return composeMatrix({
    x: t.x + off.x,
    y: t.y + off.y,
    rotation: t.rotation + transform.rotation * DEG_TO_RAD,
    scaleX: t.scaleX * sc.x,
    scaleY: t.scaleY * sc.y,
    skewX: t.skewX,
    skewY: t.skewY,
    offsetX: t.offsetX,
    offsetY: t.offsetY,
  });
}

export function getAbsoluteMatrixFromSnapshot(
  snapshot: Snapshot,
  getTransform: TransformLookup,
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
    m = multiply(
      m,
      getLocalMatrix(snapshotNode, getTransform(snapshotNode.id))
    );
  }
  return m;
}

export function getAbsolutePositionFromSnapshot(
  snapshot: Snapshot,
  getTransform: TransformLookup,
  id: number
): Vector2d {
  'worklet';
  return applyTransformsToPoint(
    getAbsoluteMatrixFromSnapshot(snapshot, getTransform, id),
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
  getTransform: TransformLookup,
  id: number,
  px: number,
  py: number,
  extraPad: number = 0
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
        getTransform,
        children[i]!,
        px,
        py,
        extraPad
      );
      if (hitNodeId !== -1) return hitNodeId;
    }
  }

  if (
    node.type === SnapshotNodeType.Shape &&
    (node.gestureEnabled || node.draggable) &&
    node.hitTestDescriptor
  ) {
    const inv = invert(
      getAbsoluteMatrixFromSnapshot(snapshot, getTransform, id)
    );
    if (!inv) return -1;
    const lp = applyTransformsToPoint(inv, { x: px, y: py });
    if (
      getIsHitTestSuccessful(
        node.hitTestDescriptor.shape,
        node.hitTestDescriptor.params,
        node.hitTestDescriptor.points,
        lp.x,
        lp.y,
        extraPad
      )
    ) {
      return id;
    }
  }
  return -1;
}
