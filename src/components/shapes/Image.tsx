import { memo, type ReactNode } from 'react';
import {
  Image as SkiaImage,
  useImage,
  type SkImage,
  type DataSourceParam,
  type Fit,
} from '@shopify/react-native-skia';
import type { ShapeConfig } from '../../core/types';
import {
  boxHitTestDescriptor,
  hitStrokePad,
} from '../../core/hitTestDescriptor';
import { Container } from '../internal/Container';

export interface ImageProps extends ShapeConfig {
  image?: SkImage | null;
  src?: DataSourceParam;
  width?: number;
  height?: number;
  fit?: Fit;
  children?: ReactNode;
}

export const Image = memo(
  ({ image, src, width, height, fit, children, ...props }: ImageProps) => {
    const resolved = useImage(src ?? null);
    const skImage = image ?? resolved;

    if (!skImage) {
      return null;
    }
    const config: ShapeConfig = props;
    const w = width ?? skImage.width();
    const h = height ?? skImage.height();
    return (
      <Container
        config={config}
        type="shape"
        hitTestDescriptor={boxHitTestDescriptor(
          0,
          0,
          w,
          h,
          hitStrokePad(config)
        )}
      >
        <SkiaImage
          image={skImage}
          x={0}
          y={0}
          width={w}
          height={h}
          fit={fit ?? 'fill'}
        >
          {children}
        </SkiaImage>
      </Container>
    );
  }
);
Image.displayName = 'Image';
