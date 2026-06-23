import type { Vector2d } from './types';

export const ZERO_VECTOR: Vector2d = { x: 0, y: 0 };
export const UNIT_VECTOR: Vector2d = { x: 1, y: 1 };

export function dist(ax: number, ay: number, bx: number, by: number): number {
  'worklet';
  return Math.hypot(ax - bx, ay - by);
}

export function dist2(ax: number, ay: number, bx: number, by: number): number {
  'worklet';
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

function pointSegmentDist2(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number
): number {
  'worklet';
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return dist2(px, py, ax, ay);
  let t = ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return dist2(px, py, ax + t * dx, ay + t * dy);
}

export function minSegmentDist(
  points: number[],
  px: number,
  py: number
): number {
  'worklet';
  let min = Infinity;
  for (let i = 0; i + 3 < points.length; i += 2) {
    const d = pointSegmentDist2(
      px,
      py,
      points[i]!,
      points[i + 1]!,
      points[i + 2]!,
      points[i + 3]!
    );
    if (d < min) min = d;
  }
  return Math.sqrt(min);
}
