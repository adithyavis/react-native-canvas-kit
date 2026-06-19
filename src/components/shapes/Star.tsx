import { memo, useMemo } from 'react';
import { Path } from '@shopify/react-native-skia';
import type { ShapeConfig } from '../../core/types';
import {
  basePaintProps,
  isPaintable,
  ShapeDecorations,
} from '../../core/styling';
import { starPath } from '../../core/path';
import { polygonHit, starVertices, hitStrokePad } from '../../core/hitTest';
import { Container } from '../internal/Container';

export interface StarProps extends ShapeConfig {
  numPoints?: number;
  innerRadius?: number;
  outerRadius?: number;
}

export const Star = memo(
  ({
    numPoints = 5,
    innerRadius = 0,
    outerRadius = 0,
    ...props
  }: StarProps) => {
    const config: ShapeConfig = props;
    const path = useMemo(
      () => starPath(numPoints, innerRadius, outerRadius),
      [numPoints, innerRadius, outerRadius]
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
          starVertices(numPoints, innerRadius, outerRadius),
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
Star.displayName = 'Star';
