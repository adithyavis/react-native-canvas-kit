import type { SharedValue } from 'react-native-reanimated';
import type { Mat } from '../../core/matrix';
import type { Rect as BoundsRect } from '../../core/bounds';
import { type ResolvedTransform, DEG_TO_RAD } from '../../core/transform';
import { computeResize, computeRotation } from '../../core/transformer';
import { ZERO_VECTOR, UNIT_VECTOR } from '../../core/geometry';
import { clampTransformResult } from '../../core/nodeBounds';
import type {
  AnchorId,
  NodeBounds,
  TransformResult,
  Vector2d,
} from '../../core/types';

const MIN_SIZE = 1;

export interface TransformChannels {
  dragOffsetSV?: SharedValue<Vector2d>;
  scaleSV?: SharedValue<Vector2d>;
  rotationSV?: SharedValue<number>;
}

export interface ActiveAnchorDrag {
  anchor: AnchorId;
  startPointer: Vector2d;
  rect: BoundsRect;
  matrix: Mat;
  cfgX: number;
  cfgY: number;
  cfgScaleX: number;
  cfgScaleY: number;
  cfgRotation: number;
  offsetX: number;
  offsetY: number;
}

export interface TransformConstraints {
  keepRatio: boolean;
  centeredScaling: boolean;
  rotationSnaps?: number[];
  rotationSnapTolerance: number;
  bounds: NodeBounds;
  xEdgeSnaps?: number[];
  xCenterSnaps?: number[];
  yEdgeSnaps?: number[];
  yCenterSnaps?: number[];
  snapTolerance?: number;
}

export function computeTransform(
  resolvedTransform: ResolvedTransform,
  channels: TransformChannels
): TransformResult {
  'worklet';
  const dO = channels.dragOffsetSV ? channels.dragOffsetSV.value : ZERO_VECTOR;
  const sV = channels.scaleSV ? channels.scaleSV.value : UNIT_VECTOR;
  const rV = channels.rotationSV ? channels.rotationSV.value : 0;
  return {
    x: resolvedTransform.x + dO.x,
    y: resolvedTransform.y + dO.y,
    scaleX: resolvedTransform.scaleX * sV.x,
    scaleY: resolvedTransform.scaleY * sV.y,
    rotation: resolvedTransform.rotation / DEG_TO_RAD + rV,
  };
}

export function rotaterAnchorPoint(
  base: Vector2d,
  rotationRad: number,
  offset: number
): Vector2d {
  'worklet';
  return {
    x: base.x + Math.sin(rotationRad) * offset,
    y: base.y - Math.cos(rotationRad) * offset,
  };
}

export function resolveAnchorTransform(
  a: ActiveAnchorDrag,
  pointer: Vector2d,
  c: TransformConstraints
): TransformResult {
  'worklet';
  if (a.anchor === 'rotater') {
    return clampTransformResult(
      computeRotation({
        rect: a.rect,
        matrix: a.matrix,
        rotationDeg: a.cfgRotation,
        offsetX: a.offsetX,
        offsetY: a.offsetY,
        scaleX: a.cfgScaleX,
        scaleY: a.cfgScaleY,
        startPointer: a.startPointer,
        pointer,
        snaps: c.rotationSnaps,
        snapTolerance: c.rotationSnapTolerance,
      }),
      c.bounds
    );
  }
  return clampTransformResult(
    computeResize({
      rect: a.rect,
      matrix: a.matrix,
      anchor: a.anchor,
      pointer,
      rotationDeg: a.cfgRotation,
      offsetX: a.offsetX,
      offsetY: a.offsetY,
      startScaleX: a.cfgScaleX,
      startScaleY: a.cfgScaleY,
      keepRatio: c.keepRatio,
      centeredScaling: c.centeredScaling,
      minSize: MIN_SIZE,
      xEdgeSnaps: c.xEdgeSnaps,
      xCenterSnaps: c.xCenterSnaps,
      yEdgeSnaps: c.yEdgeSnaps,
      yCenterSnaps: c.yCenterSnaps,
      snapTolerance: c.snapTolerance,
    }),
    c.bounds
  );
}
