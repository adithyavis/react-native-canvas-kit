import { memo } from 'react';
import {
  Image as SkiaImage,
  useImage,
  type SkImage,
  type DataSourceParam,
  type Fit,
} from '@shopify/react-native-skia';
import type { ShapeConfig } from '../../core/types';
import { Container } from '../internal/Container';

export interface ImageProps extends ShapeConfig {
  image?: SkImage | null;
  src?: DataSourceParam;
  width?: number;
  height?: number;
  fit?: Fit;
}

export const Image = memo(
  ({ image, src, width, height, fit, ...props }: ImageProps) => {
    const resolved = useImage(src ?? null);
    const skImage = image ?? resolved;

    if (!skImage) {
      return null;
    }
    const config: ShapeConfig = props;
    return (
      <Container config={config}>
        <SkiaImage
          image={skImage}
          x={0}
          y={0}
          width={width ?? skImage.width()}
          height={height ?? skImage.height()}
          fit={fit ?? 'fill'}
        />
      </Container>
    );
  }
);
Image.displayName = 'Image';
