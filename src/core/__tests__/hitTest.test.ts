import { describe, it, expect } from '@jest/globals';
import {
  rectHit,
  circleHit,
  ellipseHit,
  boxHit,
  segmentDistanceHit,
  polygonHit,
  regularPolygonVertices,
  starVertices,
} from '../hitTest';
import {
  hitStrokePad,
  boxHitTestDescriptor,
  getIsHitTestSuccessful,
  MULTI_TOUCH_HIT_SLOP,
} from '../hitTestDescriptor';

describe('rectHit', () => {
  it('tests a plain box', () => {
    const hit = rectHit(100, 50, 0, 0);
    expect(hit({ x: 50, y: 25 })).toBe(true);
    expect(hit({ x: 0, y: 0 })).toBe(true);
    expect(hit({ x: 101, y: 25 })).toBe(false);
    expect(hit({ x: 50, y: -1 })).toBe(false);
  });

  it('clips rounded corners', () => {
    const hit = rectHit(100, 100, 20, 0);
    expect(hit({ x: 50, y: 50 })).toBe(true);
    expect(hit({ x: 1, y: 1 })).toBe(false);
    expect(hit({ x: 20, y: 20 })).toBe(true);
  });

  it('honours padding', () => {
    const hit = rectHit(10, 10, 0, 5);
    expect(hit({ x: -4, y: 5 })).toBe(true);
    expect(hit({ x: -6, y: 5 })).toBe(false);
  });
});

describe('circleHit', () => {
  it('tests radius from origin', () => {
    const hit = circleHit(10, 0);
    expect(hit({ x: 0, y: 0 })).toBe(true);
    expect(hit({ x: 10, y: 0 })).toBe(true);
    expect(hit({ x: 8, y: 8 })).toBe(false); // ~11.3 > 10
  });

  it('honours padding', () => {
    expect(circleHit(10, 2)({ x: 11, y: 0 })).toBe(true);
  });
});

describe('ellipseHit', () => {
  it('tests both radii', () => {
    const hit = ellipseHit(20, 10, 0);
    expect(hit({ x: 20, y: 0 })).toBe(true);
    expect(hit({ x: 0, y: 10 })).toBe(true);
    expect(hit({ x: 20, y: 10 })).toBe(false);
  });
});

describe('boxHit', () => {
  it('tests an offset box', () => {
    const hit = boxHit(0, -8, 40, 10);
    expect(hit({ x: 20, y: -4 })).toBe(true);
    expect(hit({ x: 20, y: 5 })).toBe(false);
  });
});

describe('segmentDistanceHit (open line)', () => {
  it('hits near a segment within half-width', () => {
    const hit = segmentDistanceHit([0, 0, 100, 0], 5);
    expect(hit({ x: 50, y: 3 })).toBe(true);
    expect(hit({ x: 50, y: 8 })).toBe(false);
  });
});

describe('polygonHit', () => {
  it('tests a triangle', () => {
    const tri = [0, 0, 100, 0, 50, 100];
    const hit = polygonHit(tri, 0);
    expect(hit({ x: 50, y: 50 })).toBe(true);
    expect(hit({ x: 5, y: 90 })).toBe(false);
  });

  it('handles a concave star (point in a notch is outside)', () => {
    const star = starVertices(5, 20, 50);
    const hit = polygonHit(star, 0);
    expect(hit({ x: 0, y: 0 })).toBe(true); // centre
    expect(hit({ x: 45, y: 45 })).toBe(false);
  });

  it('regular polygon contains its centre', () => {
    const hex = regularPolygonVertices(6, 30);
    expect(polygonHit(hex, 0)({ x: 0, y: 0 })).toBe(true);
    expect(polygonHit(hex, 0)({ x: 100, y: 100 })).toBe(false);
  });
});

describe('hitStrokePad', () => {
  it('is zero with no stroke', () => {
    expect(hitStrokePad({ fill: 'red' })).toBe(0);
  });
  it('is half the stroke width when stroked', () => {
    expect(hitStrokePad({ stroke: 'red', strokeWidth: 8 })).toBe(4);
  });
  it('prefers explicit hitStrokeWidth', () => {
    expect(hitStrokePad({ stroke: 'red', hitStrokeWidth: 20 })).toBe(10);
  });
});

describe('getIsHitTestSuccessful extraPad', () => {
  const box = boxHitTestDescriptor(0, 0, 100, 100, 0);
  const hit = (px: number, py: number, extraPad?: number) =>
    getIsHitTestSuccessful(box.shape, box.params, box.points, px, py, extraPad);

  it('rejects a point outside the shape with no extra pad', () => {
    expect(hit(120, 50)).toBe(false);
  });
  it('accepts that same point once the extra pad reaches it', () => {
    expect(hit(120, 50, MULTI_TOUCH_HIT_SLOP)).toBe(true);
  });
  it('still rejects points beyond the extra pad', () => {
    expect(hit(100 + MULTI_TOUCH_HIT_SLOP + 1, 50, MULTI_TOUCH_HIT_SLOP)).toBe(
      false
    );
  });
});
