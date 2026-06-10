import type { SkEnum, BlendMode } from '@shopify/react-native-skia';
import type { GlobalCompositeOperation } from './types';

/** Skia's accepted blend-mode prop type (lowercased enum keys). */
export type SkiaBlendMode = SkEnum<typeof BlendMode>;

const BLEND_MAP: Record<GlobalCompositeOperation, string> = {
  'source-over': 'srcOver',
  'source-in': 'srcIn',
  'source-out': 'srcOut',
  'source-atop': 'srcATop',
  'destination-over': 'dstOver',
  'destination-in': 'dstIn',
  'destination-out': 'dstOut',
  'destination-atop': 'dstATop',
  'lighter': 'plus',
  'copy': 'src',
  'xor': 'xor',
  'multiply': 'multiply',
  'screen': 'screen',
  'overlay': 'overlay',
  'darken': 'darken',
  'lighten': 'lighten',
  'color-dodge': 'colorDodge',
  'color-burn': 'colorBurn',
  'hard-light': 'hardLight',
  'soft-light': 'softLight',
  'difference': 'difference',
  'exclusion': 'exclusion',
  'hue': 'hue',
  'saturation': 'saturation',
  'color': 'color',
  'luminosity': 'luminosity',
};

export function toSkiaBlendMode(
  op: GlobalCompositeOperation | undefined
): SkiaBlendMode | undefined {
  if (!op) {
    return undefined;
  }
  return BLEND_MAP[op] as SkiaBlendMode;
}
