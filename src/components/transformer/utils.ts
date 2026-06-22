import type { SharedValue } from 'react-native-reanimated';
import type { Mat } from '../../core/matrix';
import type { Rect as BoundsRect } from '../../core/bounds';
import { computeResize, computeRotation } from '../../core/transformer';
import type {
  AnchorId,
  NodeConfig,
  TransformResult,
  Vector2d,
} from '../../core/types';

export const DEG_TO_RAD = Math.PI / 180;
const MIN_SIZE = 1;

const ZERO: Vector2d = { x: 0, y: 0 };
const UNIT: Vector2d = { x: 1, y: 1 };

export interface TransformerCfg {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
}

export interface TransformChannels {
  dragSV?: SharedValue<Vector2d>;
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
}

export function resolveTransformerCfg(
  config: NodeConfig | undefined
): TransformerCfg | null {
  if (!config) return null;
  return {
    x: config.x ?? 0,
    y: config.y ?? 0,
    scaleX: config.scaleX ?? config.scale?.x ?? 1,
    scaleY: config.scaleY ?? config.scale?.y ?? 1,
    rotation: config.rotation ?? 0,
    offsetX: config.offsetX ?? config.offset?.x ?? 0,
    offsetY: config.offsetY ?? config.offset?.y ?? 0,
  };
}

export function computeTransform(
  transformerConfig: TransformerCfg,
  channels: TransformChannels
): TransformResult {
  'worklet';
  const dO = channels.dragSV ? channels.dragSV.value : ZERO;
  const sV = channels.scaleSV ? channels.scaleSV.value : UNIT;
  const rV = channels.rotationSV ? channels.rotationSV.value : 0;
  return {
    x: transformerConfig.x + dO.x,
    y: transformerConfig.y + dO.y,
    scaleX: transformerConfig.scaleX * sV.x,
    scaleY: transformerConfig.scaleY * sV.y,
    rotation: transformerConfig.rotation + rV,
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
    return computeRotation({
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
    });
  }
  return computeResize({
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
  });
}
