import { describe, it, expect } from '@jest/globals';
import {
  identity,
  multiply,
  buildAffineMatrixFromConfig,
  invert,
  applyTransformsToPoint,
  type Mat,
} from '../matrix';

const expectPointClose = (
  a: { x: number; y: number },
  b: { x: number; y: number }
) => {
  expect(a.x).toBeCloseTo(b.x);
  expect(a.y).toBeCloseTo(b.y);
};

describe('multiply', () => {
  it('is identity-neutral', () => {
    const m: Mat = [2, 0, 0, 3, 4, 5];
    expect(multiply(m, identity())).toEqual(m);
    expect(multiply(identity(), m)).toEqual(m);
  });

  it('applies the right operand first', () => {
    // scale by 2 then translate by (10, 0): translate · scale
    const scale: Mat = [2, 0, 0, 2, 0, 0];
    const translate: Mat = [1, 0, 0, 1, 10, 0];
    const m = multiply(translate, scale);
    expectPointClose(applyTransformsToPoint(m, { x: 1, y: 1 }), {
      x: 12,
      y: 2,
    });
  });
});

describe('Transforms', () => {
  it('translates', () => {
    const m = buildAffineMatrixFromConfig({ x: 10, y: 20 });
    expectPointClose(applyTransformsToPoint(m, { x: 0, y: 0 }), {
      x: 10,
      y: 20,
    });
    expectPointClose(applyTransformsToPoint(m, { x: 5, y: 5 }), {
      x: 15,
      y: 25,
    });
  });

  it('rotates 90deg about the origin', () => {
    const m = buildAffineMatrixFromConfig({ rotation: 90 });
    expectPointClose(applyTransformsToPoint(m, { x: 1, y: 0 }), { x: 0, y: 1 });
  });

  it('scales', () => {
    const m = buildAffineMatrixFromConfig({ scaleX: 2, scaleY: 3 });
    expectPointClose(applyTransformsToPoint(m, { x: 4, y: 5 }), {
      x: 8,
      y: 15,
    });
  });

  it('keeps the offset point fixed under rotation (Konva pivot semantics)', () => {
    // offset moves the rotation pivot; the offset point itself maps to (x, y).
    const m = buildAffineMatrixFromConfig({
      x: 100,
      y: 100,
      rotation: 45,
      offsetX: 10,
      offsetY: 10,
    });
    expectPointClose(applyTransformsToPoint(m, { x: 10, y: 10 }), {
      x: 100,
      y: 100,
    });
  });

  it('matches a hand-composed translate+scale chain', () => {
    const m = buildAffineMatrixFromConfig({ x: 3, y: 4, scaleX: 2, scaleY: 2 });
    // (1,1) scaled to (2,2) then translated to (5,6)
    expectPointClose(applyTransformsToPoint(m, { x: 1, y: 1 }), { x: 5, y: 6 });
  });
});

describe('invert', () => {
  it('round-trips an arbitrary transform', () => {
    const m = buildAffineMatrixFromConfig({
      x: 17,
      y: -9,
      rotation: 33,
      scaleX: 1.5,
      scaleY: 0.7,
    });
    const inv = invert(m)!;
    expect(inv).not.toBeNull();
    const p = { x: 12, y: -4 };
    expectPointClose(
      applyTransformsToPoint(inv, applyTransformsToPoint(m, p)),
      p
    );
  });

  it('returns null for a singular matrix', () => {
    expect(invert([0, 0, 0, 0, 5, 5])).toBeNull();
    // scaleX of 0 collapses the matrix
    expect(invert(buildAffineMatrixFromConfig({ scaleX: 0 }))).toBeNull();
  });
});
