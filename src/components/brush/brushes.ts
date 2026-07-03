import type { SkiaBlendMode } from '../../core/blend';

export type BrushTool =
  | 'pen'
  | 'pencil'
  | 'marker'
  | 'highlighter'
  | 'tape'
  | 'eraser';

export type StrokeCap = 'butt' | 'round' | 'square';
export type StrokeJoin = 'miter' | 'round' | 'bevel';

export interface BrushStyle {
  color: string;
  strokeWidth: number;
  opacity: number;
  blendMode?: SkiaBlendMode;
  cap: StrokeCap;
  join: StrokeJoin;
  tension: number;
}

export const BRUSHES: Record<BrushTool, BrushStyle> = {
  pen: {
    color: '#1b0030',
    strokeWidth: 4,
    opacity: 1,
    cap: 'round',
    join: 'round',
    tension: 0.5,
  },
  pencil: {
    color: '#3a3a3a',
    strokeWidth: 2,
    opacity: 0.9,
    cap: 'round',
    join: 'round',
    tension: 0.4,
  },
  marker: {
    color: '#e0218a',
    strokeWidth: 16,
    opacity: 0.55,
    blendMode: 'multiply' as SkiaBlendMode,
    cap: 'round',
    join: 'round',
    tension: 0.5,
  },
  highlighter: {
    color: '#eaff00',
    strokeWidth: 22,
    opacity: 0.35,
    blendMode: 'multiply' as SkiaBlendMode,
    cap: 'square',
    join: 'bevel',
    tension: 0.4,
  },
  tape: {
    color: '#9fe7ff',
    strokeWidth: 26,
    opacity: 0.4,
    cap: 'butt',
    join: 'miter',
    tension: 0,
  },
  eraser: {
    color: '#000000',
    strokeWidth: 24,
    opacity: 1,
    blendMode: 'dstOut' as SkiaBlendMode,
    cap: 'round',
    join: 'round',
    tension: 0.5,
  },
};
