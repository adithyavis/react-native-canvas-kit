export interface TuneParam {
  key: string;
  label: string;
  min: number;
  max: number;
}

export const TUNE_PARAMS: TuneParam[] = [
  { key: 'brightness', label: 'Brightness', min: -100, max: 100 },
  { key: 'contrast', label: 'Contrast', min: -100, max: 100 },
  { key: 'saturation', label: 'Saturation', min: -100, max: 100 },
  { key: 'ambiance', label: 'Ambiance', min: -100, max: 100 },
  { key: 'highlights', label: 'Highlights', min: -100, max: 100 },
  { key: 'shadows', label: 'Shadows', min: -100, max: 100 },
  { key: 'warmth', label: 'Warmth', min: -100, max: 100 },
];

export type TuneValues = Record<string, number>;

export const NEUTRAL_TUNE: TuneValues = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  ambiance: 0,
  highlights: 0,
  shadows: 0,
  warmth: 0,
};

const IDENTITY: number[] = [
  1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0,
];

function multiply(a: number[], b: number[]): number[] {
  const out = new Array<number>(20).fill(0);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        sum += a[row * 5 + k]! * b[k * 5 + col]!;
      }
      if (col === 4) {
        sum += a[row * 5 + 4]!;
      }
      out[row * 5 + col] = sum;
    }
  }
  return out;
}

function brightnessMatrix(amount: number): number[] {
  const offset = amount / 100;
  return [
    1,
    0,
    0,
    0,
    offset,
    0,
    1,
    0,
    0,
    offset,
    0,
    0,
    1,
    0,
    offset,
    0,
    0,
    0,
    1,
    0,
  ];
}

function contrastMatrix(amount: number): number[] {
  const factor = 1 + amount / 100;
  const offset = (1 - factor) * 0.5;
  return [
    factor,
    0,
    0,
    0,
    offset,
    0,
    factor,
    0,
    0,
    offset,
    0,
    0,
    factor,
    0,
    offset,
    0,
    0,
    0,
    1,
    0,
  ];
}

function saturationMatrix(amount: number): number[] {
  const s = 1 + amount / 100;
  const lumaR = 0.213;
  const lumaG = 0.715;
  const lumaB = 0.072;
  return [
    lumaR + s * (1 - lumaR),
    lumaG - s * lumaG,
    lumaB - s * lumaB,
    0,
    0,
    lumaR - s * lumaR,
    lumaG + s * (1 - lumaG),
    lumaB - s * lumaB,
    0,
    0,
    lumaR - s * lumaR,
    lumaG - s * lumaG,
    lumaB + s * (1 - lumaB),
    0,
    0,
    0,
    0,
    0,
    1,
    0,
  ];
}

function warmthMatrix(amount: number): number[] {
  const shift = (amount / 100) * 0.12;
  return [
    1,
    0,
    0,
    0,
    shift,
    0,
    1,
    0,
    0,
    shift * 0.4,
    0,
    0,
    1,
    0,
    -shift,
    0,
    0,
    0,
    1,
    0,
  ];
}

export function buildTuneMatrix(values: TuneValues): number[] {
  let matrix = IDENTITY;
  matrix = multiply(brightnessMatrix(values.brightness ?? 0), matrix);
  matrix = multiply(brightnessMatrix((values.shadows ?? 0) * 0.35), matrix);
  matrix = multiply(contrastMatrix(values.contrast ?? 0), matrix);
  matrix = multiply(contrastMatrix((values.highlights ?? 0) * 0.4), matrix);
  matrix = multiply(saturationMatrix(values.saturation ?? 0), matrix);
  matrix = multiply(saturationMatrix((values.ambiance ?? 0) * 0.5), matrix);
  matrix = multiply(brightnessMatrix((values.ambiance ?? 0) * 0.15), matrix);
  matrix = multiply(warmthMatrix(values.warmth ?? 0), matrix);
  return matrix;
}

export interface StylePreset {
  id: string;
  label: string;
  values: TuneValues;
}

export const STYLE_PRESETS: StylePreset[] = [
  { id: 'original', label: 'Original', values: { ...NEUTRAL_TUNE } },
  {
    id: 'portrait',
    label: 'Portrait',
    values: { ...NEUTRAL_TUNE, brightness: 12, warmth: 20, saturation: 10 },
  },
  {
    id: 'smooth',
    label: 'Smooth',
    values: { ...NEUTRAL_TUNE, contrast: -18, brightness: 10, ambiance: 20 },
  },
  {
    id: 'pop',
    label: 'Pop',
    values: { ...NEUTRAL_TUNE, contrast: 30, saturation: 45, ambiance: 30 },
  },
  {
    id: 'accentuate',
    label: 'Accentuate',
    values: { ...NEUTRAL_TUNE, contrast: 22, highlights: 20, shadows: 25 },
  },
  {
    id: 'faded',
    label: 'Faded Glow',
    values: { ...NEUTRAL_TUNE, contrast: -30, brightness: 18, saturation: -20 },
  },
  {
    id: 'noir',
    label: 'Noir',
    values: { ...NEUTRAL_TUNE, saturation: -100, contrast: 35 },
  },
  {
    id: 'warm',
    label: 'Sun',
    values: { ...NEUTRAL_TUNE, warmth: 55, brightness: 8, saturation: 15 },
  },
  {
    id: 'cool',
    label: 'Cool',
    values: { ...NEUTRAL_TUNE, warmth: -50, contrast: 12 },
  },
];

export interface Tool {
  id: string;
  label: string;
  icon: string;
}

export const TOOLS: Tool[] = [
  { id: 'tune', label: 'Tune Image', icon: '🎛' },
  { id: 'details', label: 'Details', icon: '▽' },
  { id: 'curves', label: 'Curves', icon: '∿' },
  { id: 'white-balance', label: 'White Balance', icon: '◧' },
  { id: 'crop', label: 'Crop', icon: '⌗' },
  { id: 'rotate', label: 'Rotate', icon: '↻' },
  { id: 'perspective', label: 'Perspective', icon: '◱' },
  { id: 'expand', label: 'Expand', icon: '⤢' },
  { id: 'selective', label: 'Selective', icon: '◉' },
  { id: 'brush', label: 'Brush', icon: '🖌' },
  { id: 'healing', label: 'Healing', icon: '✚' },
  { id: 'hdr', label: 'HDR-scape', icon: '⛰' },
  { id: 'glamour', label: 'Glamour Glow', icon: '✦' },
  { id: 'tonal', label: 'Tonal Contrast', icon: '◐' },
  { id: 'drama', label: 'Drama', icon: '☁' },
  { id: 'vintage', label: 'Vintage', icon: '▦' },
];
