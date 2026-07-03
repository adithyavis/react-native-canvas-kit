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

  const lastIndex = pointCount - 1;
  path.moveTo(points[0]!, points[1]!);
  for (let i = 0; i < lastIndex; i++) {
    const i0 = i - 1 < 0 ? 0 : i - 1;
    const i1 = i;
    const i2 = i + 1 > lastIndex ? lastIndex : i + 1;
    const i3 = i + 2 > lastIndex ? lastIndex : i + 2;

    const x0 = points[i0 * 2]!;
    const y0 = points[i0 * 2 + 1]!;
    const x1 = points[i1 * 2]!;
    const y1 = points[i1 * 2 + 1]!;
    const x2 = points[i2 * 2]!;
    const y2 = points[i2 * 2 + 1]!;
    const x3 = points[i3 * 2]!;
    const y3 = points[i3 * 2 + 1]!;

    const control1x = x1 + ((x2 - x0) * t) / 6;
    const control1y = y1 + ((y2 - y0) * t) / 6;
    const control2x = x2 - ((x3 - x1) * t) / 6;
    const control2y = y2 - ((y3 - y1) * t) / 6;

    path.cubicTo(control1x, control1y, control2x, control2y, x2, y2);
  }
  return path;
}
