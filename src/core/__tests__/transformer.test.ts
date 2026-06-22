import { describe, it, expect } from '@jest/globals';
import {
  computeResize,
  computeRotation,
  applyRotationSnap,
  anchorLocalPoint,
} from '../transformer';
import { applyTransformsToPoint, buildAffineMatrixFromConfig } from '../matrix';
import type { Rect } from '../bounds';

const RECT: Rect = { x: 0, y: 0, width: 100, height: 100 };
const IDENTITY = buildAffineMatrixFromConfig({});

const baseResize = {
  rect: RECT,
  matrix: IDENTITY,
  rotationDeg: 0,
  offsetX: 0,
  offsetY: 0,
  startScaleX: 1,
  startScaleY: 1,
  keepRatio: false,
  centeredScaling: false,
  minSize: 1,
};

describe('computeResize', () => {
  it('scales from a corner, keeping the opposite corner fixed', () => {
    const r = computeResize({
      ...baseResize,
      anchor: 'bottom-right',
      pointer: { x: 200, y: 200 },
    });
    expect(r.scaleX).toBeCloseTo(2);
    expect(r.scaleY).toBeCloseTo(2);
    // opposite corner (top-left, local 0,0) stays at (0,0)
    expect(r.x).toBeCloseTo(0);
    expect(r.y).toBeCloseTo(0);
  });

  it('keeps the center fixed under centeredScaling', () => {
    const r = computeResize({
      ...baseResize,
      anchor: 'bottom-right',
      pointer: { x: 150, y: 150 },
      centeredScaling: true,
    });
    const m = buildAffineMatrixFromConfig({
      x: r.x,
      y: r.y,
      scaleX: r.scaleX,
      scaleY: r.scaleY,
    });
    expect(applyTransformsToPoint(m, { x: 50, y: 50 })).toEqual({
      x: 50,
      y: 50,
    });
  });

  it('only changes one axis for an edge anchor', () => {
    const r = computeResize({
      ...baseResize,
      anchor: 'middle-right',
      pointer: { x: 300, y: 50 },
    });
    expect(r.scaleX).toBeCloseTo(3);
    expect(r.scaleY).toBeCloseTo(1);
  });

  it('locks aspect ratio for corner anchors when keepRatio', () => {
    const r = computeResize({
      ...baseResize,
      anchor: 'bottom-right',
      pointer: { x: 200, y: 110 },
      keepRatio: true,
    });
    expect(r.scaleX).toBeCloseTo(2);
    expect(r.scaleY).toBeCloseTo(2);
  });

  it('clamps to a minimum size instead of collapsing to zero', () => {
    const r = computeResize({
      ...baseResize,
      anchor: 'bottom-right',
      pointer: { x: 0, y: 0 },
    });
    expect(r.scaleX).toBeCloseTo(0.01);
    expect(r.scaleY).toBeCloseTo(0.01);
  });

  it('resizes correctly for a rotated box', () => {
    const matrix = buildAffineMatrixFromConfig({ rotation: 90 });
    const r = computeResize({
      ...baseResize,
      matrix,
      rotationDeg: 90,
      anchor: 'bottom-right',
      // bottom-right (local 100,100) at scale 2 under 90deg maps to (-200,200)
      pointer: { x: -200, y: 200 },
    });
    expect(r.scaleX).toBeCloseTo(2);
    expect(r.scaleY).toBeCloseTo(2);
  });
});

describe('computeRotation', () => {
  it('rotates about the center and keeps it fixed', () => {
    const r = computeRotation({
      rect: RECT,
      matrix: IDENTITY,
      rotationDeg: 0,
      offsetX: 0,
      offsetY: 0,
      scaleX: 1,
      scaleY: 1,
      startPointer: { x: 50, y: -50 }, // straight up from center (50,50)
      pointer: { x: 150, y: 50 }, // straight right from center
    });
    expect(r.rotation).toBeCloseTo(90);
    const m = buildAffineMatrixFromConfig({
      x: r.x,
      y: r.y,
      rotation: r.rotation,
    });
    const center = applyTransformsToPoint(m, { x: 50, y: 50 });
    expect(center.x).toBeCloseTo(50);
    expect(center.y).toBeCloseTo(50);
  });
});

describe('applyRotationSnap', () => {
  it('snaps to the nearest target within tolerance', () => {
    expect(applyRotationSnap(88, [0, 90, 180, 270], 5)).toBe(90);
    expect(applyRotationSnap(3, [0, 90, 180, 270], 5)).toBe(0);
  });

  it('leaves the angle untouched outside tolerance or without snaps', () => {
    expect(applyRotationSnap(80, [0, 90, 180, 270], 5)).toBe(80);
    expect(applyRotationSnap(45, undefined, 5)).toBe(45);
  });
});

describe('anchorLocalPoint', () => {
  it('maps anchor names to rect points', () => {
    expect(anchorLocalPoint(RECT, 'top-left')).toEqual({ x: 0, y: 0 });
    expect(anchorLocalPoint(RECT, 'bottom-right')).toEqual({ x: 100, y: 100 });
    expect(anchorLocalPoint(RECT, 'middle-right')).toEqual({ x: 100, y: 50 });
  });
});
