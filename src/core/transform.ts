import type { Transforms3d } from '@shopify/react-native-skia';
import type { NodeConfig } from './types';

const DEG_TO_RAD = Math.PI / 180;

export interface ResolvedTransform {
  x: number;
  y: number;
  rotation: number; // radians
  scaleX: number;
  scaleY: number;
  skewX: number;
  skewY: number;
  offsetX: number;
  offsetY: number;
}

export function resolveTransform(config: NodeConfig): ResolvedTransform {
  return {
    x: config.x ?? 0,
    y: config.y ?? 0,
    rotation: (config.rotation ?? 0) * DEG_TO_RAD,
    scaleX: config.scaleX ?? config.scale?.x ?? 1,
    scaleY: config.scaleY ?? config.scale?.y ?? 1,
    skewX: config.skewX ?? 0,
    skewY: config.skewY ?? 0,
    offsetX: config.offsetX ?? config.offset?.x ?? 0,
    offsetY: config.offsetY ?? config.offset?.y ?? 0,
  };
}

export function buildTransforms3dArray(config: NodeConfig): Transforms3d {
  const t = resolveTransform(config);
  const out: Transforms3d = [];

  if (t.x !== 0) {
    out.push({ translateX: t.x });
  }
  if (t.y !== 0) {
    out.push({ translateY: t.y });
  }
  if (t.rotation !== 0) {
    out.push({ rotate: t.rotation });
  }
  if (t.skewX !== 0) {
    out.push({ skewX: t.skewX });
  }
  if (t.skewY !== 0) {
    out.push({ skewY: t.skewY });
  }
  if (t.scaleX !== 1) {
    out.push({ scaleX: t.scaleX });
  }
  if (t.scaleY !== 1) {
    out.push({ scaleY: t.scaleY });
  }
  if (t.offsetX !== 0) {
    out.push({ translateX: -t.offsetX });
  }
  if (t.offsetY !== 0) {
    out.push({ translateY: -t.offsetY });
  }

  return out;
}
