import { Skia, type SkPath } from '@shopify/react-native-skia';

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

export function linePath(
  points: number[],
  closed = false,
  _tension = 0
): SkPath {
  const tension = Math.max(0, Math.min(1, _tension));

  const path = Skia.Path.Make();
  const pointCount = Math.floor(points.length / 2);
  if (pointCount < 2) {
    return path;
  }

  if (tension === 0 || pointCount < 3) {
    path.moveTo(points[0]!, points[1]!);
    for (let i = 2; i < points.length - 1; i += 2) {
      path.lineTo(points[i]!, points[i + 1]!);
    }
    if (closed) {
      path.close();
    }
    return path;
  }

  const wrap = (i: number) => ((i % pointCount) + pointCount) % pointCount;
  const x = (i: number) => points[wrap(i) * 2]!;
  const y = (i: number) => points[wrap(i) * 2 + 1]!;

  const segmentCount = closed ? pointCount : pointCount - 1;
  path.moveTo(x(0), y(0));
  for (let i = 0; i < segmentCount; i++) {
    const p0 = closed ? i - 1 : Math.max(i - 1, 0);
    const p1 = i;
    const p2 = closed ? i + 1 : Math.min(i + 1, pointCount - 1);
    const p3 = closed ? i + 2 : Math.min(i + 2, pointCount - 1);

    const control1x = x(p1) + ((x(p2) - x(p0)) * tension) / 6;
    const control1y = y(p1) + ((y(p2) - y(p0)) * tension) / 6;
    const control2x = x(p2) - ((x(p3) - x(p1)) * tension) / 6;
    const control2y = y(p2) - ((y(p3) - y(p1)) * tension) / 6;

    path.cubicTo(control1x, control1y, control2x, control2y, x(p2), y(p2));
  }
  if (closed) {
    path.close();
  }
  return path;
}
