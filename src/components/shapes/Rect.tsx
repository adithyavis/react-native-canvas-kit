import { memo } from 'react';
import { Rect as SkiaRect, RoundedRect } from '@shopify/react-native-skia';
import type { ShapeConfig } from '../../core/types';
import {
  basePaintProps,
  isPaintable,
  ShapeDecorations,
} from '../../core/styling';
import { rectHit, hitStrokePad } from '../../core/hitTest';
import { Container } from '../internal/Container';

export interface RectProps extends ShapeConfig {
  width?: number;
  height?: number;
  cornerRadius?: number | number[];
}

export const Rect = memo(({ cornerRadius, ...props }: RectProps) => {
  const config: ShapeConfig = props;
  const width = props.width ?? 0;
  const height = props.height ?? 0;
  if (!isPaintable(config)) {
    return null;
  }
  const base = basePaintProps(config)!;
  const r = Array.isArray(cornerRadius) ? cornerRadius[0] : cornerRadius;

  return (
    <Container
      config={config}
      type="shape"
      hitTest={rectHit(width, height, r ?? 0, hitStrokePad(config))}
    >
      {r ? (
        <RoundedRect x={0} y={0} width={width} height={height} r={r} {...base}>
          <ShapeDecorations c={config} />
        </RoundedRect>
      ) : (
        <SkiaRect x={0} y={0} width={width} height={height} {...base}>
          <ShapeDecorations c={config} />
        </SkiaRect>
      )}
    </Container>
  );
});
Rect.displayName = 'Rect';
