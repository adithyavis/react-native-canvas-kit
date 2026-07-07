import type { NodeBounds, TransformResult } from './types';

export const EMPTY_BOUNDS: NodeBounds = {};

export function clampToBounds(
  value: number,
  min: number | undefined,
  max: number | undefined
): number {
  'worklet';
  let clamped = value;
  if (min != null && clamped < min) clamped = min;
  if (max != null && clamped > max) clamped = max;
  return clamped;
}

export function clampTransformResult(
  t: TransformResult,
  b: NodeBounds
): TransformResult {
  'worklet';
  return {
    x: clampToBounds(t.x, b.minX, b.maxX),
    y: clampToBounds(t.y, b.minY, b.maxY),
    scaleX: clampToBounds(t.scaleX, b.minScaleX, b.maxScaleX),
    scaleY: clampToBounds(t.scaleY, b.minScaleY, b.maxScaleY),
    rotation: clampToBounds(t.rotation, b.minRotation, b.maxRotation),
  };
}

export function resolveNodeBounds(config: NodeBounds): NodeBounds {
  return {
    minX: config.minX,
    maxX: config.maxX,
    minY: config.minY,
    maxY: config.maxY,
    minScaleX: config.minScaleX,
    maxScaleX: config.maxScaleX,
    minScaleY: config.minScaleY,
    maxScaleY: config.maxScaleY,
    minRotation: config.minRotation,
    maxRotation: config.maxRotation,
  };
}
