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
