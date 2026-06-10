import { Skia, type SkPath } from '@shopify/react-native-skia';

/**
 * `RegularPolygon`: `sides` vertices evenly spaced on a circle of
 * `radius`, centred at the origin, with the first vertex pointing straight up
 * (matching, which starts at -90deg).
 */
export function regularPolygonPath(sides: number, radius: number): SkPath {
  const path = Skia.Path.Make();
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    if (i === 0) {
      path.moveTo(x, y);
    } else {
      path.lineTo(x, y);
    }
  }
  path.close();
  return path;
}

/**
 * `Star`: `numPoints` points alternating between `outerRadius` and
 * `innerRadius`, centred at the origin, first outer point straight up.
 */
export function starPath(
  numPoints: number,
  innerRadius: number,
  outerRadius: number
): SkPath {
  const path = Skia.Path.Make();
  const count = numPoints * 2;
  for (let i = 0; i < count; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    if (i === 0) {
      path.moveTo(x, y);
    } else {
      path.lineTo(x, y);
    }
  }
  path.close();
  return path;
}

/**
 * `Line`: a polyline through a flat `[x0, y0, x1, y1, ...]` point array.
 * `closed` joins the last point back to the first.
 *
 * NOTE: `tension` (spline smoothing) is not implemented in v1 — points
 * are connected with straight segments regardless of tension. See
 * docs/02-shapes.md for the planned Catmull-Rom implementation.
 */
export function linePath(points: number[], closed = false): SkPath {
  const path = Skia.Path.Make();
  if (points.length >= 2) {
    path.moveTo(points[0]!, points[1]!);
    for (let i = 2; i < points.length - 1; i += 2) {
      path.lineTo(points[i]!, points[i + 1]!);
    }
    if (closed) {
      path.close();
    }
  }
  return path;
}
