import type { NodeSnaps } from './types';

export const DEFAULT_SNAP_TOLERANCE = 5;
export const EMPTY_SNAPS: NodeSnaps = {};

export function resolveNodeSnaps(config: NodeSnaps): NodeSnaps {
  return {
    xEdgeSnaps: config.xEdgeSnaps,
    xCenterSnaps: config.xCenterSnaps,
    yEdgeSnaps: config.yEdgeSnaps,
    yCenterSnaps: config.yCenterSnaps,
    snapTolerance: config.snapTolerance ?? 10,
    rotationSnaps: config.rotationSnaps,
    rotationSnapTolerance: config.rotationSnapTolerance ?? 5,
  };
}

export function snapAxis(
  pos: number,
  leftOffset: number,
  size: number,
  edgeSnaps: number[] | undefined,
  centerSnaps: number[] | undefined,
  tolerance: number
): number {
  'worklet';
  const left = pos + leftOffset;
  const right = pos + leftOffset + size;
  const center = pos + leftOffset + size / 2;
  let bestDelta = 0;
  let bestDist = Infinity;
  if (edgeSnaps) {
    const edges = [left, right];
    for (let i = 0; i < edges.length; i++) {
      for (let j = 0; j < edgeSnaps.length; j++) {
        const d = Math.abs(edges[i]! - edgeSnaps[j]!);
        if (d <= tolerance && d < bestDist) {
          bestDist = d;
          bestDelta = edgeSnaps[j]! - edges[i]!;
        }
      }
    }
  }
  if (centerSnaps) {
    for (let j = 0; j < centerSnaps.length; j++) {
      const d = Math.abs(center - centerSnaps[j]!);
      if (d <= tolerance && d < bestDist) {
        bestDist = d;
        bestDelta = centerSnaps[j]! - center;
      }
    }
  }
  return pos + bestDelta;
}

export function snapResizeEdge(
  edge: number,
  fixed: number,
  includeCenter: boolean,
  edgeSnaps: number[] | undefined,
  centerSnaps: number[] | undefined,
  tolerance: number
): number {
  'worklet';
  const center = (fixed + edge) / 2;
  let bestDelta = 0;
  let bestDist = Infinity;
  if (edgeSnaps) {
    for (let i = 0; i < edgeSnaps.length; i++) {
      const d = Math.abs(edge - edgeSnaps[i]!);
      if (d <= tolerance && d < bestDist) {
        bestDist = d;
        bestDelta = edgeSnaps[i]! - edge;
      }
    }
  }
  if (includeCenter && centerSnaps) {
    for (let i = 0; i < centerSnaps.length; i++) {
      const d = Math.abs(center - centerSnaps[i]!);
      if (d <= tolerance && d < bestDist) {
        bestDist = d;
        bestDelta = 2 * (centerSnaps[i]! - center);
      }
    }
  }
  return edge + bestDelta;
}
