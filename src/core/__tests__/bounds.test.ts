import { describe, it, expect } from '@jest/globals';
import { getSelfRect, getClientRect, inflateRect } from '../bounds';
import { buildAffineMatrixFromConfig } from '../matrix';
import {
  rectHitTestDescriptor,
  circleHitTestDescriptor,
  ellipseHitTestDescriptor,
  boxHitTestDescriptor,
  polygonHitTestDescriptor,
} from '../hitTestDescriptor';
import type { ShapeConfig } from '../types';

describe('getSelfRect', () => {
  it('is top-left based for Rect', () => {
    expect(getSelfRect(rectHitTestDescriptor(100, 50, 0, 0), {})).toEqual({
      x: 0,
      y: 0,
      width: 100,
      height: 50,
    });
  });

  it('is centered for Circle', () => {
    expect(getSelfRect(circleHitTestDescriptor(30, 0), {})).toEqual({
      x: -30,
      y: -30,
      width: 60,
      height: 60,
    });
  });

  it('is centered for Ellipse', () => {
    expect(getSelfRect(ellipseHitTestDescriptor(40, 20, 0), {})).toEqual({
      x: -40,
      y: -20,
      width: 80,
      height: 40,
    });
  });

  it('uses the box origin for Box', () => {
    expect(getSelfRect(boxHitTestDescriptor(5, 6, 10, 20, 0), {})).toEqual({
      x: 5,
      y: 6,
      width: 10,
      height: 20,
    });
  });

  it('spans the points for a Polygon', () => {
    const desc = polygonHitTestDescriptor([0, 0, 10, 0, 10, 8, 0, 8], 0);
    expect(getSelfRect(desc, {})).toEqual({
      x: 0,
      y: 0,
      width: 10,
      height: 8,
    });
  });

  it('inflates by half the stroke width by default, not when ignoreStroke', () => {
    const desc = rectHitTestDescriptor(100, 50, 0, 0);
    const config: ShapeConfig = { stroke: '#000', strokeWidth: 4 };
    expect(getSelfRect(desc, config)).toEqual({
      x: -2,
      y: -2,
      width: 104,
      height: 54,
    });
    expect(getSelfRect(desc, config, true)).toEqual({
      x: 0,
      y: 0,
      width: 100,
      height: 50,
    });
  });

  it('returns null without a descriptor', () => {
    expect(getSelfRect(null, {})).toBeNull();
  });
});

describe('inflateRect', () => {
  it('expands on all sides', () => {
    expect(inflateRect({ x: 0, y: 0, width: 10, height: 10 }, 5)).toEqual({
      x: -5,
      y: -5,
      width: 20,
      height: 20,
    });
  });
});

describe('getClientRect', () => {
  it('scales the box', () => {
    const m = buildAffineMatrixFromConfig({ scaleX: 2, scaleY: 2 });
    expect(getClientRect({ x: 0, y: 0, width: 100, height: 50 }, m)).toEqual({
      x: 0,
      y: 0,
      width: 200,
      height: 100,
    });
  });

  it('is the AABB of the rotated box', () => {
    const m = buildAffineMatrixFromConfig({ rotation: 90 });
    const r = getClientRect({ x: 0, y: 0, width: 10, height: 10 }, m);
    expect(r.x).toBeCloseTo(-10);
    expect(r.y).toBeCloseTo(0);
    expect(r.width).toBeCloseTo(10);
    expect(r.height).toBeCloseTo(10);
  });
});
