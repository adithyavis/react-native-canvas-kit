import { applyTransformsToPoint, type Mat } from './matrix';
import { HitShape, type HitTestDescriptor } from './hitTestDescriptor';
import { DEFAULT_STROKE_WIDTH, hasStroke } from './paint';
import type { NodeConfig, ShapeConfig, Vector2d } from './types';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function boundsOfPoints(points?: number[]): Rect | null {
  if (!points || points.length < 4) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < points.length - 1; i += 2) {
    const x = points[i]!;
    const y = points[i + 1]!;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function getSelfRect(
  descriptor: HitTestDescriptor | null,
  config: NodeConfig,
  ignoreStroke = false
): Rect | null {
  if (!descriptor) return null;
  const { shape, params, points } = descriptor;
  let rect: Rect | null = null;
  switch (shape) {
    case HitShape.Rect:
      rect = { x: 0, y: 0, width: params[0] ?? 0, height: params[1] ?? 0 };
      break;
    case HitShape.Circle: {
      const r = params[0] ?? 0;
      rect = { x: -r, y: -r, width: 2 * r, height: 2 * r };
      break;
    }
    case HitShape.Ellipse: {
      const rx = params[0] ?? 0;
      const ry = params[1] ?? 0;
      rect = { x: -rx, y: -ry, width: 2 * rx, height: 2 * ry };
      break;
    }
    case HitShape.Box:
      rect = {
        x: params[0] ?? 0,
        y: params[1] ?? 0,
        width: params[2] ?? 0,
        height: params[3] ?? 0,
      };
      break;
    case HitShape.Segment:
    case HitShape.Polygon:
      rect = boundsOfPoints(points);
      break;
  }
  if (!rect) return null;

  if (!ignoreStroke && hasStroke(config as ShapeConfig)) {
    const half =
      ((config as ShapeConfig).strokeWidth ?? DEFAULT_STROKE_WIDTH) / 2;
    rect = {
      x: rect.x - half,
      y: rect.y - half,
      width: rect.width + 2 * half,
      height: rect.height + 2 * half,
    };
  }
  return rect;
}

export function unionRect(a: Rect, b: Rect): Rect {
  const minX = Math.min(a.x, b.x);
  const minY = Math.min(a.y, b.y);
  const maxX = Math.max(a.x + a.width, b.x + b.width);
  const maxY = Math.max(a.y + a.height, b.y + b.height);
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function inflateRect(r: Rect, pad: number): Rect {
  return {
    x: r.x - pad,
    y: r.y - pad,
    width: r.width + 2 * pad,
    height: r.height + 2 * pad,
  };
}

export function getRectCorners(
  r: Rect,
  m: Mat
): [Vector2d, Vector2d, Vector2d, Vector2d] {
  return [
    applyTransformsToPoint(m, { x: r.x, y: r.y }),
    applyTransformsToPoint(m, { x: r.x + r.width, y: r.y }),
    applyTransformsToPoint(m, { x: r.x + r.width, y: r.y + r.height }),
    applyTransformsToPoint(m, { x: r.x, y: r.y + r.height }),
  ];
}

export function getClientRect(r: Rect, m: Mat): Rect {
  const corners = getRectCorners(r, m);
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of corners) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}
