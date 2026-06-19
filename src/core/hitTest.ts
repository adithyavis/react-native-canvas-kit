import { dist2, minSegmentDist } from './geometry';
import { hasStroke } from './styling';
import type { ShapeConfig, Vector2d } from './types';

export function hitStrokePad(c: ShapeConfig): number {
  if (c.hitStrokeWidth != null) {
    return c.hitStrokeWidth / 2;
  }
  if (hasStroke(c)) {
    return c.strokeWidth! / 2;
  }
  return 0;
}

function pointInRoundedRectangle(
  px: number,
  py: number,
  w: number,
  h: number,
  r: number
): boolean {
  if (px < 0 || py < 0 || px > w || py > h) return false;
  if (r <= 0) return true;
  const rr = Math.min(r, w / 2, h / 2);
  if (px < rr && py < rr) return dist2(px, py, rr, rr) <= rr * rr;
  if (px > w - rr && py < rr) return dist2(px, py, w - rr, rr) <= rr * rr;
  if (px < rr && py > h - rr) return dist2(px, py, rr, h - rr) <= rr * rr;
  if (px > w - rr && py > h - rr)
    return dist2(px, py, w - rr, h - rr) <= rr * rr;
  return true;
}

export function rectHit(
  w: number,
  h: number,
  cornerRadius: number,
  pad: number
): (p: Vector2d) => boolean {
  return (p) =>
    pointInRoundedRectangle(
      p.x + pad,
      p.y + pad,
      w + 2 * pad,
      h + 2 * pad,
      (cornerRadius || 0) + pad
    );
}

export function circleHit(r: number, pad: number): (p: Vector2d) => boolean {
  const rr = (r + pad) * (r + pad);
  return (p) => p.x * p.x + p.y * p.y <= rr;
}

export function ellipseHit(
  rx: number,
  ry: number,
  pad: number
): (p: Vector2d) => boolean {
  const ax = rx + pad;
  const ay = ry + pad;
  return (p) => {
    if (ax <= 0 || ay <= 0) return false;
    const nx = p.x / ax;
    const ny = p.y / ay;
    return nx * nx + ny * ny <= 1;
  };
}

export function boxHit(
  x0: number,
  y0: number,
  w: number,
  h: number,
  pad: number = 0
): (p: Vector2d) => boolean {
  return (p) =>
    p.x >= x0 - pad &&
    p.x <= x0 + w + pad &&
    p.y >= y0 - pad &&
    p.y <= y0 + h + pad;
}

export function segmentDistanceHit(
  points: number[],
  halfWidth: number
): (p: Vector2d) => boolean {
  return (p) => minSegmentDist(points, p.x, p.y) <= halfWidth;
}

function pointInPolygon(verts: number[], px: number, py: number): boolean {
  let inside = false;
  const n = verts.length / 2;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = verts[i * 2]!;
    const yi = verts[i * 2 + 1]!;
    const xj = verts[j * 2]!;
    const yj = verts[j * 2 + 1]!;
    const intersect =
      yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function polygonHit(
  verts: number[],
  pad: number
): (p: Vector2d) => boolean {
  const closed = verts.length >= 4 ? [...verts, verts[0]!, verts[1]!] : verts;
  return (p) =>
    pointInPolygon(verts, p.x, p.y) ||
    (pad > 0 && minSegmentDist(closed, p.x, p.y) <= pad);
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
