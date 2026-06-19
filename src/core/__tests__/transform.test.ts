import { describe, it, expect } from '@jest/globals';
import { buildTransforms3dArray, resolveTransform } from '../transform';

describe('resolveTransform', () => {
  it('applies defaults', () => {
    expect(resolveTransform({})).toEqual({
      x: 0,
      y: 0,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      skewX: 0,
      skewY: 0,
      offsetX: 0,
      offsetY: 0,
    });
  });

  it('converts rotation from degrees to radians', () => {
    expect(resolveTransform({ rotation: 90 }).rotation).toBeCloseTo(
      Math.PI / 2
    );
  });

  it('prefers scaleX/Y over the scale vector', () => {
    const t = resolveTransform({ scale: { x: 2, y: 2 }, scaleX: 3 });
    expect(t.scaleX).toBe(3); // explicit scaleX wins
    expect(t.scaleY).toBe(2); // falls back to scale.y
  });

  it('reads offset from offsetX/Y or the offset vector', () => {
    expect(resolveTransform({ offset: { x: 5, y: 6 } })).toMatchObject({
      offsetX: 5,
      offsetY: 6,
    });
    expect(resolveTransform({ offsetX: 7 }).offsetX).toBe(7);
  });
});

describe('buildTransforms3dArray', () => {
  it('emits nothing for an identity transform', () => {
    expect(buildTransforms3dArray({})).toEqual([]);
  });

  it('emits translate for position', () => {
    expect(buildTransforms3dArray({ x: 10, y: 20 })).toEqual([
      { translateX: 10 },
      { translateY: 20 },
    ]);
  });

  it('preserves matrix order: translate -> rotate -> skew -> scale -> -offset', () => {
    const out = buildTransforms3dArray({
      x: 1,
      y: 2,
      rotation: 180,
      skewX: 0.1,
      skewY: 0.2,
      scaleX: 2,
      scaleY: 3,
      offsetX: 4,
      offsetY: 5,
    });
    expect(out).toEqual([
      { translateX: 1 },
      { translateY: 2 },
      { rotate: Math.PI },
      { skewX: 0.1 },
      { skewY: 0.2 },
      { scaleX: 2 },
      { scaleY: 3 },
      { translateX: -4 },
      { translateY: -5 },
    ]);
  });

  it('omits identity operations', () => {
    // scale of 1 and rotation of 0 should not appear
    expect(buildTransforms3dArray({ x: 5, scaleX: 1, rotation: 0 })).toEqual([
      { translateX: 5 },
    ]);
  });
});
