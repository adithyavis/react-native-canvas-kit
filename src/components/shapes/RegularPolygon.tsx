import { memo, useMemo } from 'react';
import { Path } from '@shopify/react-native-skia';
import type { ShapeConfig } from '../../core/types';
import {
  basePaintProps,
  isPaintable,
  ShapeDecorations,
} from '../../core/styling';
import { regularPolygonPath } from '../../core/path';
import {
  polygonHit,
  regularPolygonVertices,
  hitStrokePad,
} from '../../core/hitTest';
import { Container } from '../internal/Container';

export interface RegularPolygonProps extends ShapeConfig {
  sides?: number;
  radius?: number;
}

export const RegularPolygon = memo(
  ({ sides = 3, radius = 0, ...props }: RegularPolygonProps) => {
    const config: ShapeConfig = props;
    const path = useMemo(
      () => regularPolygonPath(sides, radius),
      [sides, radius]
    );
    if (!isPaintable(config)) {
      return null;
    }
    const base = basePaintProps(config)!;
    return (
      <Container
        config={config}
        type="shape"
        hitTest={polygonHit(
          regularPolygonVertices(sides, radius),
          hitStrokePad(config)
        )}
      >
        <Path path={path} {...base}>
          <ShapeDecorations c={config} />
        </Path>
      </Container>
    );
  }
);
RegularPolygon.displayName = 'RegularPolygon';
