import { describe, it, expect } from '@jest/globals';
import {
  clampToBounds,
  clampTransformResult,
  resolveNodeBounds,
} from '../nodeBounds';
import type { NodeConfig, TransformResult } from '../types';

describe('clampToBounds', () => {
  it('passes through when no bounds are set', () => {
    expect(clampToBounds(42, undefined, undefined)).toBe(42);
  });

  it('clamps to min and max', () => {
    expect(clampToBounds(-5, 0, 100)).toBe(0);
    expect(clampToBounds(150, 0, 100)).toBe(100);
    expect(clampToBounds(50, 0, 100)).toBe(50);
  });

  it('applies a one-sided bound', () => {
    expect(clampToBounds(-5, 0, undefined)).toBe(0);
    expect(clampToBounds(999, undefined, 100)).toBe(100);
  });

  it('treats zero as a real bound (not falsy)', () => {
    expect(clampToBounds(-1, 0, undefined)).toBe(0);
    expect(clampToBounds(1, undefined, 0)).toBe(0);
  });
});

describe('clampTransformResult', () => {
  const t: TransformResult = {
    x: 500,
    y: -20,
    scaleX: 5,
    scaleY: 0.1,
    rotation: 200,
  };

  it('clamps every channel that has a bound', () => {
    const r = clampTransformResult(t, {
      minX: 0,
      maxX: 300,
      minY: 0,
      maxScaleX: 2,
      minScaleY: 0.5,
      maxRotation: 90,
    });
    expect(r.x).toBe(300);
    expect(r.y).toBe(0);
    expect(r.scaleX).toBe(2);
    expect(r.scaleY).toBe(0.5);
    expect(r.rotation).toBe(90);
  });

  it('leaves channels without bounds untouched', () => {
    const r = clampTransformResult(t, { maxX: 300 });
    expect(r.x).toBe(300);
    expect(r.y).toBe(-20);
    expect(r.scaleX).toBe(5);
    expect(r.rotation).toBe(200);
  });
});

describe('resolveNodeBounds', () => {
  it('picks only the bound fields off a config', () => {
    const config: NodeConfig = {
      x: 10,
      y: 20,
      draggable: true,
      minX: 0,
      maxRotation: 45,
    };
    const bounds = resolveNodeBounds(config);
    expect(bounds).toEqual({
      minX: 0,
      maxX: undefined,
      minY: undefined,
      maxY: undefined,
      minScaleX: undefined,
      maxScaleX: undefined,
      minScaleY: undefined,
      maxScaleY: undefined,
      minRotation: undefined,
      maxRotation: 45,
    });
  });
});
