import { memo } from 'react';
import type { NodeConfig } from '../core/types';
import { boxHitTestDescriptor } from '../core/hitTestDescriptor';
import { Container } from './internal/Container';

export type LayerProps = NodeConfig;

export const Layer = memo(({ children, ...config }: LayerProps) => {
  const { width, height } = config;
  const hitTestDescriptor =
    width != null && height != null
      ? boxHitTestDescriptor(0, 0, width, height)
      : undefined;
  return (
    <Container
      config={config}
      type="layer"
      hitTestDescriptor={hitTestDescriptor}
    >
      {children}
    </Container>
  );
});
Layer.displayName = 'Layer';
