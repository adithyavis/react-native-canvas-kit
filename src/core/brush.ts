import { Skia, type SkPath } from '@shopify/react-native-skia';

function smoothenPoints(points: number[], passes: number): number[] {
  'worklet';
  const pointCount = Math.floor(points.length / 2);
  if (pointCount < 3 || passes <= 0) return points;

  let src = points;
  for (let pass = 0; pass < passes; pass++) {
    const out = src.slice();
    for (let i = 1; i < pointCount - 1; i++) {
      const xi = i * 2;
      const yi = i * 2 + 1;
      out[xi] = (src[xi - 2]! + 2 * src[xi]! + src[xi + 2]!) / 4;
      out[yi] = (src[yi - 2]! + 2 * src[yi]! + src[yi + 2]!) / 4;
    }
    src = out;
  }
  return src;
}

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

  const pts = smoothenPoints(points, Math.round(t * 2));
  const f = t * 0.5;
  const lastIndex = pointCount - 1;

  path.moveTo(pts[0]!, pts[1]!);
  for (let i = 1; i < lastIndex; i++) {
    const prevX = pts[(i - 1) * 2]!;
    const prevY = pts[(i - 1) * 2 + 1]!;
    const cx = pts[i * 2]!;
    const cy = pts[i * 2 + 1]!;
    const nextX = pts[(i + 1) * 2]!;
    const nextY = pts[(i + 1) * 2 + 1]!;

    path.lineTo(cx + (prevX - cx) * f, cy + (prevY - cy) * f);
    path.quadTo(cx, cy, cx + (nextX - cx) * f, cy + (nextY - cy) * f);
  }
  path.lineTo(pts[lastIndex * 2]!, pts[lastIndex * 2 + 1]!);
  return path;
}
