import { applyTransformsToPoint, identity, invert, type Mat } from './matrix';
import { dist } from './geometry';
import type { SharedValue } from 'react-native-reanimated';
import {
  DEFAULT_DRAG_DISTANCE,
  findDragTarget,
  getAbsoluteMatrixFromSnapshot,
  getHitNodeIdFromSnapshot,
  type TransformLookup,
  type Snapshot,
} from './snapshot';

export const TAP_SLOP = 5;
export const DBL_TAP_MS = 300;

export interface GestureEventCallbacks {
  setTransform: (id: number, x: number, y: number) => void;
  on: (type: string, id: number) => void;
}

interface PressState {
  startX: number;
  startY: number;
  startTime: number;
  hitNodeId: number; // -1 none
  dragTargetId: number; // -1 none
  dragDistance: number;
  dragging: boolean;
  parentInv: Mat | null;
  dragStartParentX: number;
  dragStartParentY: number;
  baseOffsetX: number;
  baseOffsetY: number;
}

export type { PressState };

export interface LastTap {
  id: number;
  time: number;
}

function beginDrag(
  snapshot: Snapshot,
  getTransform: TransformLookup,
  press: SharedValue<PressState | null>,
  gestureEventCallbacks: GestureEventCallbacks
): void {
  'worklet';
  const p = press.value!;
  const id = p.dragTargetId;
  const node = snapshot.nodes[id];
  const parentId = node ? node.parentId : -1;
  const parentInv =
    parentId !== -1
      ? invert(getAbsoluteMatrixFromSnapshot(snapshot, getTransform, parentId))
      : invert(identity());
  let dragStartParentX = 0;
  let dragStartParentY = 0;
  if (parentInv) {
    const sp = applyTransformsToPoint(parentInv, { x: p.startX, y: p.startY });
    dragStartParentX = sp.x;
    dragStartParentY = sp.y;
  }
  const base = getTransform(id).offset;
  press.value = {
    ...p,
    parentInv,
    dragStartParentX,
    dragStartParentY,
    baseOffsetX: base.x,
    baseOffsetY: base.y,
    dragging: true,
  };
  gestureEventCallbacks.on('dragstart', id);
}

export function pointerDown(
  snapshot: Snapshot,
  getTransform: TransformLookup,
  press: SharedValue<PressState | null>,
  gestureEventCallbacks: GestureEventCallbacks,
  rootId: number,
  px: number,
  py: number,
  now: number
): void {
  'worklet';
  const hitNodeId = getHitNodeIdFromSnapshot(
    snapshot,
    getTransform,
    rootId,
    px,
    py
  );
  const dragTargetId =
    hitNodeId !== -1 ? findDragTarget(snapshot, hitNodeId) : -1;
  const dragNode = dragTargetId !== -1 ? snapshot.nodes[dragTargetId] : null;
  const dragDistance = dragNode ? dragNode.dragDistance : DEFAULT_DRAG_DISTANCE;
  press.value = {
    startX: px,
    startY: py,
    startTime: now,
    hitNodeId: hitNodeId,
    dragTargetId,
    dragDistance,
    dragging: false,
    parentInv: null,
    dragStartParentX: 0,
    dragStartParentY: 0,
    baseOffsetX: 0,
    baseOffsetY: 0,
  };
  const target = hitNodeId !== -1 ? hitNodeId : rootId;
  gestureEventCallbacks.on('pointerdown', target);
  gestureEventCallbacks.on('touchstart', target);
}

export function pointerMove(
  snapshot: Snapshot,
  getTransform: TransformLookup,
  press: SharedValue<PressState | null>,
  gestureEventCallbacks: GestureEventCallbacks,
  px: number,
  py: number
): void {
  'worklet';
  const p = press.value;
  if (!p || p.dragTargetId === -1) return;
  if (!p.dragging) {
    if (dist(px, py, p.startX, p.startY) < p.dragDistance) return;
    beginDrag(snapshot, getTransform, press, gestureEventCallbacks);
  }
  const p2 = press.value!;
  if (p2.dragging && p2.parentInv) {
    const cur = applyTransformsToPoint(p2.parentInv, { x: px, y: py });
    const dx = p2.baseOffsetX + (cur.x - p2.dragStartParentX);
    const dy = p2.baseOffsetY + (cur.y - p2.dragStartParentY);
    gestureEventCallbacks.setTransform(p2.dragTargetId, dx, dy);
    gestureEventCallbacks.on('dragmove', p2.dragTargetId);
  }
}

export function pointerUp(
  snapshot: Snapshot,
  getTransform: TransformLookup,
  press: SharedValue<PressState | null>,
  lastTap: SharedValue<LastTap | null>,
  gestureEventCallbacks: GestureEventCallbacks,
  rootId: number,
  px: number,
  py: number,
  now: number
): void {
  'worklet';
  const p = press.value;
  press.value = null;
  if (!p) return;

  if (p.dragging && p.dragTargetId !== -1) {
    gestureEventCallbacks.on('dragend', p.dragTargetId);
  }

  const target = p.hitNodeId !== -1 ? p.hitNodeId : rootId;
  gestureEventCallbacks.on('pointerup', target);
  gestureEventCallbacks.on('touchend', target);

  if (p.dragging || p.hitNodeId === -1) return;

  const hitNodeId = getHitNodeIdFromSnapshot(
    snapshot,
    getTransform,
    rootId,
    px,
    py
  );
  if (
    dist(px, py, p.startX, p.startY) > TAP_SLOP ||
    hitNodeId !== p.hitNodeId
  ) {
    return;
  }
  const tapTarget = p.hitNodeId;
  gestureEventCallbacks.on('click', tapTarget);
  gestureEventCallbacks.on('tap', tapTarget);
  const lt = lastTap.value;
  if (lt && lt.id === tapTarget && now - lt.time <= DBL_TAP_MS) {
    gestureEventCallbacks.on('dblclick', tapTarget);
    gestureEventCallbacks.on('dbltap', tapTarget);
    lastTap.value = null;
  } else {
    lastTap.value = { id: tapTarget, time: now };
  }
}
