import { memo, useMemo } from 'react';
import { Path } from '@shopify/react-native-skia';
import type { ShapeConfig } from '../../core/types';
import { basePaintProps, ShapeDecorations } from '../../core/styling';
import { linePath } from '../../core/path';
import {
  polygonHitTestDescriptor,
  segmentHitTestDescriptor,
  hitStrokePad,
} from '../../core/hitTestDescriptor';
import { Container } from '../internal/Container';
import { isPaintable } from '../../core/paint';

export interface LineProps extends ShapeConfig {
  points?: number[];
  closed?: boolean;
  /** spline smoothing is not yet implemented. */
  tension?: number;
}

export const Line = memo(
  ({ points = [], closed = false, ...props }: LineProps) => {
    const config: ShapeConfig = props;
    const path = useMemo(() => linePath(points, closed), [points, closed]);
    if (!isPaintable(config)) {
      return null;
    }
    const base = basePaintProps(config)!;
    const pad = hitStrokePad(config);
    const hitTestDescriptor = closed
      ? polygonHitTestDescriptor(points, pad)
      : segmentHitTestDescriptor(points, Math.max(pad, 1));
    return (
      <Container
        config={config}
        type="shape"
        hitTestDescriptor={hitTestDescriptor}
      >
        <Path path={path} {...base}>
          <ShapeDecorations c={config} />
        </Path>
      </Container>
    );
  }
);
Line.displayName = 'Line';
