import type { ShapeConfig } from './types';

export const DEFAULT_STROKE_WIDTH = 2;

export function hasFill(c: ShapeConfig): boolean {
  if (c.fillEnabled === false) {
    return false;
  }
  return (
    c.fill != null ||
    c.fillLinearGradientColorStops != null ||
    c.fillRadialGradientColorStops != null
  );
}

export function hasStroke(c: ShapeConfig): boolean {
  if (c.strokeEnabled === false) {
    return false;
  }
  return c.stroke != null && (c.strokeWidth ?? DEFAULT_STROKE_WIDTH) > 0;
}

export function isPaintable(c: ShapeConfig): boolean {
  return hasFill(c) || hasStroke(c);
}
