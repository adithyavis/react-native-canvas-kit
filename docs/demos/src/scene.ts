import type { ImageSourcePropType } from 'react-native';
import type { BrushTool } from 'react-native-canvas-kit';

export const FONT_URL =
  'https://cdn.jsdelivr.net/npm/@expo-google-fonts/inter/Inter_700Bold.ttf';
export const LABEL = 'react-native-canvas-kit';
export const CHIP = '#chip';
export const STICKER_SIZE = 76;

export interface NodeTransform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
}

export interface Sticker {
  id: string;
  src: number;
  fx: number;
  fy: number;
  scale: number;
  rotation: number;
}

export interface DrawnStroke {
  id: string;
  points: number[];
  tool: BrushTool;
}

export type Tool = BrushTool;

export const TOOLS: { tool: BrushTool; icon: ImageSourcePropType }[] = [
  { tool: 'pen', icon: require('../assets/tools/pen.png') },
  { tool: 'pencil', icon: require('../assets/tools/pencil.png') },
  { tool: 'marker', icon: require('../assets/tools/marker.png') },
  { tool: 'highlighter', icon: require('../assets/tools/highlighter.png') },
  { tool: 'tape', icon: require('../assets/tools/tape.png') },
  { tool: 'eraser', icon: require('../assets/tools/eraser.png') },
];

export const STICKERS: Sticker[] = [
  { id: 'gem', src: require('../assets/stickers/gem.png'), fx: 0.1, fy: 0.18, scale: 1.2, rotation: -14 },
  { id: 'crystal-ball', src: require('../assets/stickers/crystal-ball.png'), fx: 0.42, fy: 0.06, scale: 0.95, rotation: 16 },
  { id: 'star', src: require('../assets/stickers/star.png'), fx: 0.066, fy: 0.8, scale: 0.8, rotation: 8 },
  { id: 'unicorn', src: require('../assets/stickers/unicorn.png'), fx: 0.85, fy: 0.14, scale: 1.3, rotation: -10 },
  { id: 'rocket', src: require('../assets/stickers/rocket.png'), fx: 0.086, fy: 0.32, scale: 1.1, rotation: 30 },
  { id: 'crown', src: require('../assets/stickers/crown.png'), fx: 0.64, fy: 0.4, scale: 1.15, rotation: -12 },
  { id: 'fire', src: require('../assets/stickers/fire.png'), fx: 0.25, fy: 0.75, scale: 1.0, rotation: 10 },
  { id: 'rainbow', src: require('../assets/stickers/rainbow.png'), fx: 0.012, fy: 0.62, scale: 1.1, rotation: -18 },
  { id: 'fox', src: require('../assets/stickers/fox.png'), fx: 0.38, fy: 0.6, scale: 1.2, rotation: 14 },
  { id: 'balloon', src: require('../assets/stickers/balloon.png'), fx: 0.75, fy: 0.19, scale: 1.1, rotation: 24 },
];

export const sel = (id: string) => `#${id}`;

export function buildInitialTransforms(
  w: number,
  h: number
): Record<string, NodeTransform> {
  const out: Record<string, NodeTransform> = {};
  for (const s of STICKERS) {
    out[sel(s.id)] = {
      x: Math.round(w * s.fx),
      y: Math.round(h * s.fy),
      scaleX: s.scale,
      scaleY: s.scale,
      rotation: s.rotation,
    };
  }
  out[CHIP] = {
    x: Math.round(w * 0.5) - 150,
    y: Math.round(h * 0.5),
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
  };
  return out;
}
