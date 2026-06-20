import {
  getIsHitTestSuccessful,
  rectHitTestDescriptor,
  circleHitTestDescriptor,
  ellipseHitTestDescriptor,
  boxHitTestDescriptor,
  segmentHitTestDescriptor,
  polygonHitTestDescriptor,
  type HitTestDescriptor,
} from './hitTestDescriptor';
import type { Vector2d } from './types';

export function hitTestPredicate(
  hitTestDescriptor: HitTestDescriptor
): (p: Vector2d) => boolean {
  return (p) =>
    getIsHitTestSuccessful(
      hitTestDescriptor.shape,
      hitTestDescriptor.params,
      hitTestDescriptor.points,
      p.x,
      p.y
    );
}

export function rectHit(
  w: number,
  h: number,
  cornerRadius: number,
  pad: number
): (p: Vector2d) => boolean {
  return hitTestPredicate(rectHitTestDescriptor(w, h, cornerRadius, pad));
}

export function circleHit(r: number, pad: number): (p: Vector2d) => boolean {
  return hitTestPredicate(circleHitTestDescriptor(r, pad));
}

export function ellipseHit(
  rx: number,
  ry: number,
  pad: number
): (p: Vector2d) => boolean {
  return hitTestPredicate(ellipseHitTestDescriptor(rx, ry, pad));
}

export function boxHit(
  x0: number,
  y0: number,
  w: number,
  h: number,
  pad: number = 0
): (p: Vector2d) => boolean {
  return hitTestPredicate(boxHitTestDescriptor(x0, y0, w, h, pad));
}

export function segmentDistanceHit(
  points: number[],
  halfWidth: number
): (p: Vector2d) => boolean {
  return hitTestPredicate(segmentHitTestDescriptor(points, halfWidth));
}

export function polygonHit(
  verts: number[],
  pad: number
): (p: Vector2d) => boolean {
  return hitTestPredicate(polygonHitTestDescriptor(verts, pad));
}

export function regularPolygonVertices(
  sides: number,
  radius: number
): number[] {
  const out: number[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
    out.push(radius * Math.cos(angle), radius * Math.sin(angle));
  }
  return out;
}

export function starVertices(
  numPoints: number,
  innerRadius: number,
  outerRadius: number
): number[] {
  const out: number[] = [];
  const count = numPoints * 2;
  for (let i = 0; i < count; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    out.push(radius * Math.cos(angle), radius * Math.sin(angle));
  }
  return out;
}
