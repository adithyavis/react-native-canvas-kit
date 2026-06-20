import { memo } from 'react';
import { Oval } from '@shopify/react-native-skia';
import type { ShapeConfig } from '../../core/types';
import { basePaintProps, ShapeDecorations } from '../../core/styling';
import {
  ellipseHitTestDescriptor,
  hitStrokePad,
} from '../../core/hitTestDescriptor';
import { Container } from '../internal/Container';
import { isPaintable } from '../../core/paint';

export interface EllipseProps extends ShapeConfig {
  radiusX?: number;
  radiusY?: number;
}

export const Ellipse = memo(
  ({ radiusX = 0, radiusY = 0, ...props }: EllipseProps) => {
    const config: ShapeConfig = props;
    if (!isPaintable(config)) {
      return null;
    }
    const base = basePaintProps(config)!;
    return (
      <Container
        config={config}
        type="shape"
        hitTestDescriptor={ellipseHitTestDescriptor(
          radiusX,
          radiusY,
          hitStrokePad(config)
        )}
      >
        <Oval
          x={-radiusX}
          y={-radiusY}
          width={radiusX * 2}
          height={radiusY * 2}
          {...base}
        >
          <ShapeDecorations c={config} />
        </Oval>
      </Container>
    );
  }
);
Ellipse.displayName = 'Ellipse';
