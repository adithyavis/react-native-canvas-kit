import { dist2, minSegmentDist } from './geometry';
import { hasStroke } from './paint';
import type { ShapeConfig } from './types';

export const HitShape = {
  Rect: 'Rect',
  Circle: 'Circle',
  Ellipse: 'Ellipse',
  Box: 'Box',
  Segment: 'Segment',
  Polygon: 'Polygon',
} as const;
export type HitShape = (typeof HitShape)[keyof typeof HitShape];

export interface HitTestDescriptor {
  shape: HitShape;
  params: number[];
  points?: number[];
}

export const MULTI_TOUCH_HIT_SLOP = 60;

export function hitStrokePad(c: ShapeConfig): number {
  if (c.hitStrokeWidth != null) {
    return c.hitStrokeWidth / 2;
  }
  if (hasStroke(c)) {
    return c.strokeWidth! / 2;
  }
  return 0;
}

interface HitTestDescriptorRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function getHitTestDescriptorRect(
  d: HitTestDescriptor
): HitTestDescriptorRect {
  'worklet';
  const { shape, params, points } = d;
  switch (shape) {
    case HitShape.Rect:
      return { x: 0, y: 0, width: params[0] ?? 0, height: params[1] ?? 0 };
    case HitShape.Circle: {
      const r = params[0] ?? 0;
      return { x: -r, y: -r, width: 2 * r, height: 2 * r };
    }
    case HitShape.Ellipse: {
      const rx = params[0] ?? 0;
      const ry = params[1] ?? 0;
      return { x: -rx, y: -ry, width: 2 * rx, height: 2 * ry };
    }
    case HitShape.Box:
      return {
        x: params[0] ?? 0,
        y: params[1] ?? 0,
        width: params[2] ?? 0,
        height: params[3] ?? 0,
      };
    case HitShape.Segment:
    case HitShape.Polygon: {
      const pts = points ?? [];
      if (pts.length < 2) return { x: 0, y: 0, width: 0, height: 0 };
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (let i = 0; i < pts.length - 1; i += 2) {
        const x = pts[i]!;
        const y = pts[i + 1]!;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
      return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }
    default:
      return { x: 0, y: 0, width: 0, height: 0 };
  }
}

export function rectHitTestDescriptor(
  w: number,
  h: number,
  cornerRadius: number,
  pad: number
): HitTestDescriptor {
  return { shape: HitShape.Rect, params: [w, h, cornerRadius, pad] };
}

export function circleHitTestDescriptor(
  r: number,
  pad: number
): HitTestDescriptor {
  return { shape: HitShape.Circle, params: [r, pad] };
}

export function ellipseHitTestDescriptor(
  rx: number,
  ry: number,
  pad: number
): HitTestDescriptor {
  return { shape: HitShape.Ellipse, params: [rx, ry, pad] };
}

export function boxHitTestDescriptor(
  x0: number,
  y0: number,
  w: number,
  h: number,
  pad: number = 0
): HitTestDescriptor {
  return { shape: HitShape.Box, params: [x0, y0, w, h, pad] };
}

export function segmentHitTestDescriptor(
  points: number[],
  halfWidth: number
): HitTestDescriptor {
  return { shape: HitShape.Segment, params: [halfWidth], points };
}

export function polygonHitTestDescriptor(
  verts: number[],
  pad: number
): HitTestDescriptor {
  return { shape: HitShape.Polygon, params: [pad], points: verts };
}

function pointInRoundedRectangle(
  px: number,
  py: number,
  w: number,
  h: number,
  r: number
): boolean {
  'worklet';
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

function pointInPolygon(verts: number[], px: number, py: number): boolean {
  'worklet';
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

export function getIsHitTestSuccessful(
  shape: HitShape,
  params: number[],
  points: number[] | undefined,
  px: number,
  py: number,
  extraPad: number = 0
): boolean {
  'worklet';
  switch (shape) {
    case HitShape.Rect: {
      const w = params[0]!;
      const h = params[1]!;
      const cornerRadius = params[2]!;
      const pad = params[3]! + extraPad;
      return pointInRoundedRectangle(
        px + pad,
        py + pad,
        w + 2 * pad,
        h + 2 * pad,
        (cornerRadius || 0) + pad
      );
    }
    case HitShape.Circle: {
      const r = params[0]! + params[1]! + extraPad;
      return px * px + py * py <= r * r;
    }
    case HitShape.Ellipse: {
      const ax = params[0]! + params[2]! + extraPad;
      const ay = params[1]! + params[2]! + extraPad;
      if (ax <= 0 || ay <= 0) return false;
      const nx = px / ax;
      const ny = py / ay;
      return nx * nx + ny * ny <= 1;
    }
    case HitShape.Box: {
      const x0 = params[0]!;
      const y0 = params[1]!;
      const w = params[2]!;
      const h = params[3]!;
      const pad = params[4]! + extraPad;
      return (
        px >= x0 - pad &&
        px <= x0 + w + pad &&
        py >= y0 - pad &&
        py <= y0 + h + pad
      );
    }
    case HitShape.Segment: {
      const halfWidth = params[0]! + extraPad;
      return points ? minSegmentDist(points, px, py) <= halfWidth : false;
    }
    case HitShape.Polygon: {
      const pad = params[0]! + extraPad;
      const verts = points ?? [];
      if (pointInPolygon(verts, px, py)) return true;
      if (pad > 0 && verts.length >= 4) {
        const closed = [...verts, verts[0]!, verts[1]!];
        return minSegmentDist(closed, px, py) <= pad;
      }
      return false;
    }
    default:
      return false;
  }
}
