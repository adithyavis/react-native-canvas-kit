import { memo } from 'react';
import { Circle as SkiaCircle } from '@shopify/react-native-skia';
import type { ShapeConfig } from '../../core/types';
import { basePaintProps, ShapeDecorations } from '../../core/styling';
import {
  circleHitTestDescriptor,
  hitStrokePad,
} from '../../core/hitTestDescriptor';
import { Container } from '../internal/Container';
import { isPaintable } from '../../core/paint';

export interface CircleProps extends ShapeConfig {
  radius?: number;
}

export const Circle = memo(({ radius = 0, ...props }: CircleProps) => {
  const config: ShapeConfig = props;
  if (!isPaintable(config)) {
    return null;
  }
  const base = basePaintProps(config)!;
  return (
    <Container
      config={config}
      type="shape"
      hitTestDescriptor={circleHitTestDescriptor(radius, hitStrokePad(config))}
    >
      <SkiaCircle cx={0} cy={0} r={radius} {...base}>
        <ShapeDecorations c={config} />
      </SkiaCircle>
    </Container>
  );
});
Circle.displayName = 'Circle';
