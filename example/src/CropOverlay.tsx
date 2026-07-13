import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import {
  Canvas,
  Path,
  Group,
  Skia,
  FillType,
} from '@shopify/react-native-skia';

interface CropOverlayProps {
  size: number;
  radius: number;
}

export function CropOverlay({ size, radius }: CropOverlayProps) {
  const center = size / 2;

  const vignette = useMemo(() => {
    const path = Skia.Path.Make();
    path.addRect(Skia.XYWHRect(0, 0, size, size));
    path.addCircle(center, center, radius);
    path.setFillType(FillType.EvenOdd);
    return path;
  }, [size, center, radius]);

  const circle = useMemo(() => {
    const path = Skia.Path.Make();
    path.addCircle(center, center, radius);
    return path;
  }, [center, radius]);

  const grid = useMemo(() => {
    const path = Skia.Path.Make();
    const left = center - radius;
    const top = center - radius;
    const step = (radius * 2) / 3;
    for (let i = 1; i < 3; i++) {
      const x = left + step * i;
      path.moveTo(x, top);
      path.lineTo(x, top + radius * 2);
      const y = top + step * i;
      path.moveTo(left, y);
      path.lineTo(left + radius * 2, y);
    }
    return path;
  }, [center, radius]);

  return (
    <Canvas style={[styles.canvas, { width: size, height: size }]}>
      <Path path={vignette} color="rgba(0, 0, 0, 0.55)" />
      <Group clip={circle}>
        <Path
          path={grid}
          color="rgba(255, 255, 255, 0.5)"
          style="stroke"
          strokeWidth={1}
        />
      </Group>
      <Path
        path={circle}
        color="rgba(255, 255, 255, 0.85)"
        style="stroke"
        strokeWidth={1.5}
      />
    </Canvas>
  );
}

const styles = StyleSheet.create({
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
