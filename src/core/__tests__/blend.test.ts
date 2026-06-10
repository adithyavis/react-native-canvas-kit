import { describe, it, expect } from '@jest/globals';
import { toSkiaBlendMode } from '../blend';

describe('toSkiaBlendMode', () => {
  it('returns undefined when no operation is given', () => {
    expect(toSkiaBlendMode(undefined)).toBeUndefined();
  });

  it('maps the common HTML5 composite operations to Skia blend modes', () => {
    expect(toSkiaBlendMode('source-over')).toBe('srcOver');
    expect(toSkiaBlendMode('destination-out')).toBe('dstOut');
    expect(toSkiaBlendMode('source-atop')).toBe('srcATop');
    expect(toSkiaBlendMode('lighter')).toBe('plus');
    expect(toSkiaBlendMode('copy')).toBe('src');
    expect(toSkiaBlendMode('multiply')).toBe('multiply');
    expect(toSkiaBlendMode('color-dodge')).toBe('colorDodge');
    expect(toSkiaBlendMode('luminosity')).toBe('luminosity');
  });
});
