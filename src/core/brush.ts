import { Skia, type SkPath } from '@shopify/react-native-skia';

export function buildBrushPath(points: number[], tension = 0.5): SkPath {
  'worklet';
  const t = tension < 0 ? 0 : tension > 1 ? 1 : tension;
  const path = Skia.Path.Make();
  const pointCount = Math.floor(points.length / 2);

  if (pointCount < 2) {
    if (pointCount === 1) {
      path.moveTo(points[0]!, points[1]!);
      path.lineTo(points[0]!, points[1]!);
    }
    return path;
  }

  if (t === 0 || pointCount < 3) {
    path.moveTo(points[0]!, points[1]!);
    for (let i = 2; i < points.length - 1; i += 2) {
      path.lineTo(points[i]!, points[i + 1]!);
    }
    return path;
  }

  const EPS = 1e-4;
  const ALPHA_HALF = 0.25;
  const k = (t * 2) / 3;
  const lastIndex = pointCount - 1;

  path.moveTo(points[0]!, points[1]!);
  for (let i = 0; i < lastIndex; i++) {
    const i0 = i - 1 < 0 ? 0 : i - 1;
    const i1 = i;
    const i2 = i + 1;
    const i3 = i + 2 > lastIndex ? lastIndex : i + 2;

    const x0 = points[i0 * 2]!;
    const y0 = points[i0 * 2 + 1]!;
    const x1 = points[i1 * 2]!;
    const y1 = points[i1 * 2 + 1]!;
    const x2 = points[i2 * 2]!;
    const y2 = points[i2 * 2 + 1]!;
    const x3 = points[i3 * 2]!;
    const y3 = points[i3 * 2 + 1]!;

    let d1 = Math.pow(
      (x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0),
      ALPHA_HALF
    );
    let d2 = Math.pow(
      (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1),
      ALPHA_HALF
    );
    let d3 = Math.pow(
      (x3 - x2) * (x3 - x2) + (y3 - y2) * (y3 - y2),
      ALPHA_HALF
    );
    if (d1 < EPS) d1 = EPS;
    if (d2 < EPS) d2 = EPS;
    if (d3 < EPS) d3 = EPS;

    const m1x = x2 - x1 + d2 * ((x1 - x0) / d1 - (x2 - x0) / (d1 + d2));
    const m1y = y2 - y1 + d2 * ((y1 - y0) / d1 - (y2 - y0) / (d1 + d2));
    const m2x = x2 - x1 + d2 * ((x3 - x2) / d3 - (x3 - x1) / (d2 + d3));
    const m2y = y2 - y1 + d2 * ((y3 - y2) / d3 - (y3 - y1) / (d2 + d3));

    const control1x = x1 + m1x * k;
    const control1y = y1 + m1y * k;
    const control2x = x2 - m2x * k;
    const control2y = y2 - m2y * k;

    path.cubicTo(control1x, control1y, control2x, control2y, x2, y2);
  }
  return path;
}
