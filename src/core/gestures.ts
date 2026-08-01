import {
  applyTransformsToPoint,
  identity,
  invert,
  multiply,
  type Mat,
} from './matrix';
import { dist } from './geometry';
import { DEG_TO_RAD, RAD_TO_DEG } from './transform';
import { clampToBounds } from './nodeBounds';
import { snapAxis, DEFAULT_SNAP_TOLERANCE } from './nodeSnaps';
import { applyRotationSnap } from './transformer';
import { getHitTestDescriptorRect } from './hitTestDescriptor';
import type { SharedValue } from 'react-native-reanimated';
import type { NodeSnaps, TransformResult, Vector2d } from './types';
import {
  DEFAULT_DRAG_DISTANCE,
  findDragTarget,
  findTransformTarget,
  getAbsoluteMatrixFromSnapshot,
  getHitNodeIdFromSnapshot,
  getNodeContentCenter,
  type TransformLookup,
  type Snapshot,
} from './snapshot';

export const TAP_SLOP = 5;
export const DBL_TAP_MS = 300;

export const PINCH_SCALE_SENSITIVITY = 1;
export const ROTATION_SENSITIVITY = 1;

export interface GestureEventCallbacks {
  setDragOffset: (id: number, x: number, y: number) => void;
  setScale: (id: number, x: number, y: number) => void;
  setRotation: (id: number, rotationDeg: number) => void;
  on: (type: string, id: number, payload?: unknown) => void;
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

interface PinchState {
  targetId: number; // -1 none
  scalable: boolean;
  rotatable: boolean;
  baseScaleX: number;
  baseScaleY: number;
  baseRotation: number; // degrees
  activeGestures: number;
  pivotX: number;
  pivotY: number;
  startOffsetX: number;
  startOffsetY: number;
  startCenterX: number;
  startCenterY: number;
}

export type { PinchState };

export interface LastTap {
  id: number;
  time: number;
}

function resolveTransformResult(
  snapshot: Snapshot,
  getTransform: TransformLookup,
  id: number
): TransformResult {
  'worklet';
  const node = snapshot.nodes[id];
  const base = node ? node.transform : null;
  const live = getTransform(id);
  return {
    x: (base?.x ?? 0) + live.offset.x,
    y: (base?.y ?? 0) + live.offset.y,
    scaleX: (base?.scaleX ?? 1) * live.scale.x,
    scaleY: (base?.scaleY ?? 1) * live.scale.y,
    rotation: (base ? base.rotation * RAD_TO_DEG : 0) + live.rotation,
  };
}

function getMultiTouchTarget(
  snapshot: Snapshot,
  getTransform: TransformLookup,
  rootId: number,
  touches: Vector2d[]
): number {
  'worklet';
  if (touches.length < 2) return -1;
  let sumX = 0;
  let sumY = 0;
  for (let i = 0; i < touches.length; i++) {
    sumX += touches[i]!.x;
    sumY += touches[i]!.y;
  }
  const cx = sumX / touches.length;
  const cy = sumY / touches.length;
  const hitNodeId = getHitNodeIdFromSnapshot(
    snapshot,
    getTransform,
    rootId,
    cx,
    cy,
    true,
    true
  );
  return hitNodeId !== -1 ? findTransformTarget(snapshot, hitNodeId) : -1;
}

function linearPart(
  rotationRad: number,
  skewX: number,
  skewY: number,
  scaleX: number,
  scaleY: number
): Mat {
  'worklet';
  const cos = Math.cos(rotationRad);
  const sin = Math.sin(rotationRad);
  let m: Mat = [cos, sin, -sin, cos, 0, 0];
  if (skewX !== 0) m = multiply(m, [1, 0, skewX, 1, 0, 0]);
  if (skewY !== 0) m = multiply(m, [1, skewY, 0, 1, 0, 0]);
  m = multiply(m, [scaleX, 0, 0, 1, 0, 0]);
  m = multiply(m, [1, 0, 0, scaleY, 0, 0]);
  return m;
}

function applyCenterPivot(
  snapshot: Snapshot,
  getTransform: TransformLookup,
  pinch: SharedValue<PinchState | null>,
  gestureEventCallbacks: GestureEventCallbacks
): void {
  'worklet';
  const p = pinch.value;
  if (!p || p.targetId === -1) return;
  if (p.pivotX === 0 && p.pivotY === 0) return;
  const node = snapshot.nodes[p.targetId];
  if (!node) return;
  const base = node.transform;
  const live = getTransform(p.targetId);
  const a = linearPart(
    base.rotation + live.rotation * DEG_TO_RAD,
    base.skewX,
    base.skewY,
    base.scaleX * live.scale.x,
    base.scaleY * live.scale.y
  );
  const centerX = a[0] * p.pivotX + a[2] * p.pivotY;
  const centerY = a[1] * p.pivotX + a[3] * p.pivotY;
  gestureEventCallbacks.setDragOffset(
    p.targetId,
    p.startOffsetX + p.startCenterX - centerX,
    p.startOffsetY + p.startCenterY - centerY
  );
}

function computePinchSnapFactor(
  snapshot: Snapshot,
  getTransform: TransformLookup,
  p: PinchState,
  snaps: NodeSnaps
): number {
  'worklet';
  const node = snapshot.nodes[p.targetId];
  if (!node || !node.hitTestDescriptor) return 1;
  const xEdgeSnaps = snaps.xEdgeSnaps;
  const xCenterSnaps = snaps.xCenterSnaps;
  const yEdgeSnaps = snaps.yEdgeSnaps;
  const yCenterSnaps = snaps.yCenterSnaps;
  const hasX =
    (xEdgeSnaps != null && xEdgeSnaps.length > 0) ||
    (xCenterSnaps != null && xCenterSnaps.length > 0);
  const hasY =
    (yEdgeSnaps != null && yEdgeSnaps.length > 0) ||
    (yCenterSnaps != null && yCenterSnaps.length > 0);
  if (!hasX && !hasY) return 1;

  const absMatrix = getAbsoluteMatrixFromSnapshot(
    snapshot,
    getTransform,
    p.targetId
  );
  const rect = getHitTestDescriptorRect(node.hitTestDescriptor);
  const c1 = applyTransformsToPoint(absMatrix, { x: rect.x, y: rect.y });
  const c2 = applyTransformsToPoint(absMatrix, {
    x: rect.x + rect.width,
    y: rect.y,
  });
  const c3 = applyTransformsToPoint(absMatrix, {
    x: rect.x,
    y: rect.y + rect.height,
  });
  const c4 = applyTransformsToPoint(absMatrix, {
    x: rect.x + rect.width,
    y: rect.y + rect.height,
  });
  const left = Math.min(c1.x, c2.x, c3.x, c4.x);
  const right = Math.max(c1.x, c2.x, c3.x, c4.x);
  const top = Math.min(c1.y, c2.y, c3.y, c4.y);
  const bottom = Math.max(c1.y, c2.y, c3.y, c4.y);
  const pivot = applyTransformsToPoint(
    absMatrix,
    getNodeContentCenter(snapshot, getTransform, p.targetId)
  );
  const tolerance = snaps.snapTolerance ?? DEFAULT_SNAP_TOLERANCE;

  const refs: number[] = [];
  const pivots: number[] = [];
  const targets: (number[] | undefined)[] = [];
  if (xEdgeSnaps) {
    refs.push(left, right);
    pivots.push(pivot.x, pivot.x);
    targets.push(xEdgeSnaps, xEdgeSnaps);
  }
  if (xCenterSnaps) {
    refs.push((left + right) / 2);
    pivots.push(pivot.x);
    targets.push(xCenterSnaps);
  }
  if (yEdgeSnaps) {
    refs.push(top, bottom);
    pivots.push(pivot.y, pivot.y);
    targets.push(yEdgeSnaps, yEdgeSnaps);
  }
  if (yCenterSnaps) {
    refs.push((top + bottom) / 2);
    pivots.push(pivot.y);
    targets.push(yCenterSnaps);
  }

  let bestFactor = 1;
  let bestDist = Infinity;
  for (let i = 0; i < refs.length; i++) {
    const denom = refs[i]! - pivots[i]!;
    if (Math.abs(denom) < 1e-6) continue;
    const snapTargets = targets[i]!;
    for (let j = 0; j < snapTargets.length; j++) {
      const d = Math.abs(refs[i]! - snapTargets[j]!);
      if (d <= tolerance && d < bestDist) {
        bestDist = d;
        bestFactor = (snapTargets[j]! - pivots[i]!) / denom;
      }
    }
  }
  return bestFactor;
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
  gestureEventCallbacks.on(
    'transformstart',
    p.dragTargetId,
    resolveTransformResult(snapshot, getTransform, p.dragTargetId)
  );
}

export function pointerDown(
  snapshot: Snapshot,
  getTransform: TransformLookup,
  press: SharedValue<PressState | null>,
  gestureEventCallbacks: GestureEventCallbacks,
  rootId: number,
  px: number,
  py: number,
  now: number,
  allowDrag: boolean = true
): void {
  'worklet';
  const hitNodeId = getHitNodeIdFromSnapshot(
    snapshot,
    getTransform,
    rootId,
    px,
    py
  );
  const dragHitNodeId = allowDrag
    ? getHitNodeIdFromSnapshot(
        snapshot,
        getTransform,
        rootId,
        px,
        py,
        false,
        true
      )
    : -1;
  const dragTargetId =
    dragHitNodeId !== -1 ? findDragTarget(snapshot, dragHitNodeId) : -1;
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
    let dx = p2.baseOffsetX + (cur.x - p2.dragStartParentX);
    let dy = p2.baseOffsetY + (cur.y - p2.dragStartParentY);
    const node = snapshot.nodes[p2.dragTargetId];
    if (node) {
      const b = node.bounds;
      const s = node.snaps;
      let cx = node.transform.x + dx;
      let cy = node.transform.y + dy;
      const hasXSnaps =
        (s.xEdgeSnaps && s.xEdgeSnaps.length > 0) ||
        (s.xCenterSnaps && s.xCenterSnaps.length > 0);
      const hasYSnaps =
        (s.yEdgeSnaps && s.yEdgeSnaps.length > 0) ||
        (s.yCenterSnaps && s.yCenterSnaps.length > 0);
      if ((hasXSnaps || hasYSnaps) && node.hitTestDescriptor) {
        const live = getTransform(p2.dragTargetId);
        const absMatrix = getAbsoluteMatrixFromSnapshot(
          snapshot,
          getTransform,
          p2.dragTargetId
        );
        const rect = getHitTestDescriptorRect(node.hitTestDescriptor);
        const cA = applyTransformsToPoint(absMatrix, { x: rect.x, y: rect.y });
        const cB = applyTransformsToPoint(absMatrix, {
          x: rect.x + rect.width,
          y: rect.y,
        });
        const cC = applyTransformsToPoint(absMatrix, {
          x: rect.x,
          y: rect.y + rect.height,
        });
        const cD = applyTransformsToPoint(absMatrix, {
          x: rect.x + rect.width,
          y: rect.y + rect.height,
        });
        const shiftX = dx - live.offset.x;
        const shiftY = dy - live.offset.y;
        const left = Math.min(cA.x, cB.x, cC.x, cD.x) + shiftX;
        const right = Math.max(cA.x, cB.x, cC.x, cD.x) + shiftX;
        const top = Math.min(cA.y, cB.y, cC.y, cD.y) + shiftY;
        const bottom = Math.max(cA.y, cB.y, cC.y, cD.y) + shiftY;
        const centerX = (left + right) / 2;
        const centerY = (top + bottom) / 2;
        const tolerance = s.snapTolerance ?? DEFAULT_SNAP_TOLERANCE;
        cx += snapAxis(
          left,
          right,
          centerX,
          s.xEdgeSnaps,
          s.xCenterSnaps,
          tolerance
        );
        cy += snapAxis(
          top,
          bottom,
          centerY,
          s.yEdgeSnaps,
          s.yCenterSnaps,
          tolerance
        );
      }
      cx = clampToBounds(cx, b.minX, b.maxX);
      cy = clampToBounds(cy, b.minY, b.maxY);
      dx = cx - node.transform.x;
      dy = cy - node.transform.y;
    }
    gestureEventCallbacks.setDragOffset(p2.dragTargetId, dx, dy);
    gestureEventCallbacks.on('dragmove', p2.dragTargetId);
    gestureEventCallbacks.on(
      'transform',
      p2.dragTargetId,
      resolveTransformResult(snapshot, getTransform, p2.dragTargetId)
    );
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
    gestureEventCallbacks.on(
      'transformend',
      p.dragTargetId,
      resolveTransformResult(snapshot, getTransform, p.dragTargetId)
    );
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

export function pinchBegin(
  snapshot: Snapshot,
  getTransform: TransformLookup,
  pinch: SharedValue<PinchState | null>,
  gestureEventCallbacks: GestureEventCallbacks,
  rootId: number,
  touches: Vector2d[],
  press?: SharedValue<PressState | null>
): void {
  'worklet';
  const existing = pinch.value;
  if (existing) {
    pinch.value = { ...existing, activeGestures: existing.activeGestures + 1 };
    return;
  }
  const activePress = press?.value;
  const draggingId =
    activePress && activePress.dragging ? activePress.dragTargetId : -1;
  const targetId =
    draggingId !== -1
      ? draggingId
      : getMultiTouchTarget(snapshot, getTransform, rootId, touches);

  const transformContinues = draggingId !== -1;
  if (draggingId !== -1) {
    gestureEventCallbacks.on('dragend', draggingId);
  }
  if (press) press.value = null;

  if (targetId === -1) {
    pinch.value = {
      targetId: -1,
      scalable: false,
      rotatable: false,
      baseScaleX: 1,
      baseScaleY: 1,
      baseRotation: 0,
      activeGestures: 1,
      pivotX: 0,
      pivotY: 0,
      startOffsetX: 0,
      startOffsetY: 0,
      startCenterX: 0,
      startCenterY: 0,
    };
    return;
  }
  const base = getTransform(targetId);
  const node = snapshot.nodes[targetId]!;
  const bt = node.transform;
  const center = getNodeContentCenter(snapshot, getTransform, targetId);
  const pivotX = center.x - bt.offsetX;
  const pivotY = center.y - bt.offsetY;
  const a0 = linearPart(
    bt.rotation + base.rotation * DEG_TO_RAD,
    bt.skewX,
    bt.skewY,
    bt.scaleX * base.scale.x,
    bt.scaleY * base.scale.y
  );
  const startCenterX = a0[0] * pivotX + a0[2] * pivotY;
  const startCenterY = a0[1] * pivotX + a0[3] * pivotY;
  pinch.value = {
    targetId,
    scalable: node.scalable,
    rotatable: node.rotatable,
    baseScaleX: base.scale.x,
    baseScaleY: base.scale.y,
    baseRotation: base.rotation,
    activeGestures: 1,
    pivotX,
    pivotY,
    startOffsetX: base.offset.x,
    startOffsetY: base.offset.y,
    startCenterX,
    startCenterY,
  };
  if (!transformContinues) {
    gestureEventCallbacks.on(
      'transformstart',
      targetId,
      resolveTransformResult(snapshot, getTransform, targetId)
    );
  }
}

export function pinchUpdate(
  snapshot: Snapshot,
  getTransform: TransformLookup,
  pinch: SharedValue<PinchState | null>,
  gestureEventCallbacks: GestureEventCallbacks,
  scale: number,
  sensitivity: number
): void {
  'worklet';
  const p = pinch.value;
  if (!p || p.targetId === -1 || !p.scalable) return;
  const dampedScale = 1 + (scale - 1) * sensitivity;
  let liveScaleX = p.baseScaleX * dampedScale;
  let liveScaleY = p.baseScaleY * dampedScale;
  const node = snapshot.nodes[p.targetId];
  if (node) {
    const b = node.bounds;
    const baseScaleX = node.transform.scaleX;
    const baseScaleY = node.transform.scaleY;
    if (baseScaleX !== 0) {
      liveScaleX =
        clampToBounds(baseScaleX * liveScaleX, b.minScaleX, b.maxScaleX) /
        baseScaleX;
    }
    if (baseScaleY !== 0) {
      liveScaleY =
        clampToBounds(baseScaleY * liveScaleY, b.minScaleY, b.maxScaleY) /
        baseScaleY;
    }
  }
  gestureEventCallbacks.setScale(p.targetId, liveScaleX, liveScaleY);
  applyCenterPivot(snapshot, getTransform, pinch, gestureEventCallbacks);

  if (node) {
    const factor = computePinchSnapFactor(
      snapshot,
      getTransform,
      p,
      node.snaps
    );
    if (factor !== 1) {
      const b = node.bounds;
      const baseScaleX = node.transform.scaleX;
      const baseScaleY = node.transform.scaleY;
      let snappedScaleX = liveScaleX * factor;
      let snappedScaleY = liveScaleY * factor;
      if (baseScaleX !== 0) {
        snappedScaleX =
          clampToBounds(baseScaleX * snappedScaleX, b.minScaleX, b.maxScaleX) /
          baseScaleX;
      }
      if (baseScaleY !== 0) {
        snappedScaleY =
          clampToBounds(baseScaleY * snappedScaleY, b.minScaleY, b.maxScaleY) /
          baseScaleY;
      }
      gestureEventCallbacks.setScale(p.targetId, snappedScaleX, snappedScaleY);
      applyCenterPivot(snapshot, getTransform, pinch, gestureEventCallbacks);
    }
  }

  gestureEventCallbacks.on(
    'transform',
    p.targetId,
    resolveTransformResult(snapshot, getTransform, p.targetId)
  );
}

export function pinchEnd(
  snapshot: Snapshot,
  getTransform: TransformLookup,
  pinch: SharedValue<PinchState | null>,
  gestureEventCallbacks: GestureEventCallbacks
): void {
  'worklet';
  const p = pinch.value;
  if (!p) return;
  const remaining = p.activeGestures - 1;
  if (remaining > 0) {
    pinch.value = { ...p, activeGestures: remaining };
    return;
  }
  if (p.targetId !== -1) {
    gestureEventCallbacks.on(
      'transformend',
      p.targetId,
      resolveTransformResult(snapshot, getTransform, p.targetId)
    );
  }
  pinch.value = null;
}

export function rotationUpdate(
  snapshot: Snapshot,
  getTransform: TransformLookup,
  pinch: SharedValue<PinchState | null>,
  gestureEventCallbacks: GestureEventCallbacks,
  rotationRad: number,
  sensitivity: number
): void {
  'worklet';
  const p = pinch.value;
  if (!p || p.targetId === -1 || !p.rotatable) return;
  let liveRotationDeg = p.baseRotation + rotationRad * RAD_TO_DEG * sensitivity;
  const node = snapshot.nodes[p.targetId];
  if (node) {
    const b = node.bounds;
    const s = node.snaps;
    const baseRotationDeg = node.transform.rotation * RAD_TO_DEG;
    let effectiveDeg = clampToBounds(
      baseRotationDeg + liveRotationDeg,
      b.minRotation,
      b.maxRotation
    );
    if (s.rotationSnaps && s.rotationSnaps.length > 0) {
      effectiveDeg = applyRotationSnap(
        effectiveDeg,
        s.rotationSnaps,
        s.rotationSnapTolerance ?? DEFAULT_SNAP_TOLERANCE
      );
    }
    liveRotationDeg = effectiveDeg - baseRotationDeg;
  }
  gestureEventCallbacks.setRotation(p.targetId, liveRotationDeg);
  applyCenterPivot(snapshot, getTransform, pinch, gestureEventCallbacks);
  gestureEventCallbacks.on(
    'transform',
    p.targetId,
    resolveTransformResult(snapshot, getTransform, p.targetId)
  );
}
