import type { Vector2d } from './types';
import { resolveTransform, type ResolvedTransform } from './transform';

export type Mat = [
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
];

export function identity(): Mat {
  'worklet';
  return [1, 0, 0, 1, 0, 0];
}

export function multiply(a: Mat, b: Mat): Mat {
  'worklet';
  const [a1, b1, c1, d1, e1, f1] = a;
  const [a2, b2, c2, d2, e2, f2] = b;
  return [
    a1 * a2 + c1 * b2,
    b1 * a2 + d1 * b2,
    a1 * c2 + c1 * d2,
    b1 * c2 + d1 * d2,
    a1 * e2 + c1 * f2 + e1,
    b1 * e2 + d1 * f2 + f1,
  ];
}

export function buildAffineMatrixFromConfig(
  config: Parameters<typeof resolveTransform>[0]
): Mat {
  function fromResolvedTransform(t: ResolvedTransform): Mat {
    let m = identity();
    if (t.x !== 0) m = multiply(m, [1, 0, 0, 1, t.x, 0]);
    if (t.y !== 0) m = multiply(m, [1, 0, 0, 1, 0, t.y]);
    if (t.rotation !== 0) {
      const cos = Math.cos(t.rotation);
      const sin = Math.sin(t.rotation);
      m = multiply(m, [cos, sin, -sin, cos, 0, 0]);
    }
    if (t.skewX !== 0) m = multiply(m, [1, 0, t.skewX, 1, 0, 0]);
    if (t.skewY !== 0) m = multiply(m, [1, t.skewY, 0, 1, 0, 0]);
    if (t.scaleX !== 1) m = multiply(m, [t.scaleX, 0, 0, 1, 0, 0]);
    if (t.scaleY !== 1) m = multiply(m, [1, 0, 0, t.scaleY, 0, 0]);
    if (t.offsetX !== 0) m = multiply(m, [1, 0, 0, 1, -t.offsetX, 0]);
    if (t.offsetY !== 0) m = multiply(m, [1, 0, 0, 1, 0, -t.offsetY]);
    return m;
  }
  return fromResolvedTransform(resolveTransform(config));
}

export function invert(m: Mat): Mat | null {
  'worklet';
  const [a, b, c, d, e, f] = m;
  const det = a * d - b * c;
  if (det === 0 || !Number.isFinite(det)) {
    return null;
  }
  const id = 1 / det;
  return [
    d * id,
    -b * id,
    -c * id,
    a * id,
    (c * f - d * e) * id,
    (b * e - a * f) * id,
  ];
}

export function applyTransformsToPoint(m: Mat, p: Vector2d): Vector2d {
  'worklet';
  return {
    x: m[0] * p.x + m[2] * p.y + m[4],
    y: m[1] * p.x + m[3] * p.y + m[5],
  };
}
