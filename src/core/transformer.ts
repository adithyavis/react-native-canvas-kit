import { applyTransformsToPoint, type Mat } from './matrix';
import type { Rect } from './bounds';
import type { AnchorId, TransformResult, Vector2d } from './types';

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

export function isCornerAnchor(anchor: AnchorId): boolean {
  'worklet';
  return (
    anchor === 'top-left' ||
    anchor === 'top-right' ||
    anchor === 'bottom-left' ||
    anchor === 'bottom-right'
  );
}

function oppositeAnchor(anchor: AnchorId): AnchorId {
  'worklet';
  switch (anchor) {
    case 'top-left':
      return 'bottom-right';
    case 'top-center':
      return 'bottom-center';
    case 'top-right':
      return 'bottom-left';
    case 'middle-left':
      return 'middle-right';
    case 'middle-right':
      return 'middle-left';
    case 'bottom-left':
      return 'top-right';
    case 'bottom-center':
      return 'top-center';
    case 'bottom-right':
      return 'top-left';
  }
}

export function anchorLocalPoint(rect: Rect, anchor: AnchorId): Vector2d {
  'worklet';
  const left = rect.x;
  const centerX = rect.x + rect.width / 2;
  const right = rect.x + rect.width;
  const top = rect.y;
  const middleY = rect.y + rect.height / 2;
  const bottom = rect.y + rect.height;
  switch (anchor) {
    case 'top-left':
      return { x: left, y: top };
    case 'top-center':
      return { x: centerX, y: top };
    case 'top-right':
      return { x: right, y: top };
    case 'middle-left':
      return { x: left, y: middleY };
    case 'middle-right':
      return { x: right, y: middleY };
    case 'bottom-left':
      return { x: left, y: bottom };
    case 'bottom-center':
      return { x: centerX, y: bottom };
    case 'bottom-right':
      return { x: right, y: bottom };
  }
}

export function transformLocalPoint(
  t: TransformResult,
  offsetX: number,
  offsetY: number,
  px: number,
  py: number
): Vector2d {
  'worklet';
  const theta = t.rotation * DEG_TO_RAD;
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const sx = t.scaleX * (px - offsetX);
  const sy = t.scaleY * (py - offsetY);
  return { x: t.x + cos * sx - sin * sy, y: t.y + sin * sx + cos * sy };
}

function rotateVec(theta: number, v: Vector2d): Vector2d {
  'worklet';
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return { x: cos * v.x - sin * v.y, y: sin * v.x + cos * v.y };
}

function clampScale(scale: number, dimension: number, minSize: number): number {
  'worklet';
  if (dimension <= 0) return scale;
  const min = minSize / dimension;
  if (Math.abs(scale) < min) {
    return (scale < 0 ? -1 : 1) * min;
  }
  return scale;
}

function normalizeAngle(deg: number): number {
  'worklet';
  return ((deg % 360) + 360) % 360;
}

export function applyRotationSnap(
  deg: number,
  snaps: number[] | undefined,
  tolerance: number
): number {
  'worklet';
  if (!snaps || snaps.length === 0) return deg;
  const norm = normalizeAngle(deg);
  for (let i = 0; i < snaps.length; i++) {
    const target = normalizeAngle(snaps[i]!);
    let diff = Math.abs(norm - target);
    diff = Math.min(diff, 360 - diff);
    if (diff <= tolerance) return target;
  }
  return deg;
}

export interface ResizeInput {
  rect: Rect;
  matrix: Mat;
  anchor: AnchorId;
  pointer: Vector2d;
  rotationDeg: number;
  offsetX: number;
  offsetY: number;
  startScaleX: number;
  startScaleY: number;
  keepRatio: boolean;
  centeredScaling: boolean;
  minSize: number;
}

export function computeResize(input: ResizeInput): TransformResult {
  'worklet';
  const {
    rect,
    matrix,
    anchor,
    pointer,
    rotationDeg,
    offsetX,
    offsetY,
    startScaleX,
    startScaleY,
    keepRatio,
    centeredScaling,
    minSize,
  } = input;

  const theta = rotationDeg * DEG_TO_RAD;
  const a = anchorLocalPoint(rect, anchor);
  const p = centeredScaling
    ? { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
    : anchorLocalPoint(rect, oppositeAnchor(anchor));

  const pivotS = applyTransformsToPoint(matrix, p);
  const delta = rotateVec(-theta, {
    x: pointer.x - pivotS.x,
    y: pointer.y - pivotS.y,
  });

  const dx = a.x - p.x;
  const dy = a.y - p.y;
  let scaleX = dx !== 0 ? delta.x / dx : startScaleX;
  let scaleY = dy !== 0 ? delta.y / dy : startScaleY;

  if (keepRatio && isCornerAnchor(anchor)) {
    const ratio =
      Math.abs(startScaleX) > 1e-9 ? Math.abs(startScaleY / startScaleX) : 1;
    const signX = scaleX < 0 ? -1 : 1;
    const signY = scaleY < 0 ? -1 : 1;
    if (Math.abs(scaleX) * ratio > Math.abs(scaleY)) {
      scaleY = signY * Math.abs(scaleX) * ratio;
    } else if (ratio > 1e-9) {
      scaleX = signX * (Math.abs(scaleY) / ratio);
    }
  }

  scaleX = clampScale(scaleX, rect.width, minSize);
  scaleY = clampScale(scaleY, rect.height, minSize);

  const scaledPivot = rotateVec(theta, {
    x: scaleX * (p.x - offsetX),
    y: scaleY * (p.y - offsetY),
  });
  return {
    x: pivotS.x - scaledPivot.x,
    y: pivotS.y - scaledPivot.y,
    scaleX,
    scaleY,
    rotation: rotationDeg,
  };
}

export interface RotateInput {
  rect: Rect;
  matrix: Mat;
  rotationDeg: number;
  offsetX: number;
  offsetY: number;
  scaleX: number;
  scaleY: number;
  startPointer: Vector2d;
  pointer: Vector2d;
  snaps?: number[];
  snapTolerance?: number;
}

export function computeRotation(input: RotateInput): TransformResult {
  'worklet';
  const {
    rect,
    matrix,
    rotationDeg,
    offsetX,
    offsetY,
    scaleX,
    scaleY,
    startPointer,
    pointer,
    snaps,
    snapTolerance = 5,
  } = input;

  const centerLocal = {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };
  const centerS = applyTransformsToPoint(matrix, centerLocal);

  const angleStart = Math.atan2(
    startPointer.y - centerS.y,
    startPointer.x - centerS.x
  );
  const angleNow = Math.atan2(pointer.y - centerS.y, pointer.x - centerS.x);
  let deg = rotationDeg + (angleNow - angleStart) * RAD_TO_DEG;
  deg = applyRotationSnap(deg, snaps, snapTolerance);

  const theta = deg * DEG_TO_RAD;
  const scaledCenter = rotateVec(theta, {
    x: scaleX * (centerLocal.x - offsetX),
    y: scaleY * (centerLocal.y - offsetY),
  });
  return {
    x: centerS.x - scaledCenter.x,
    y: centerS.y - scaledCenter.y,
    scaleX,
    scaleY,
    rotation: deg,
  };
}
