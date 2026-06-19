import { memo } from 'react';
import type { NodeConfig } from '../core/types';
import { Container } from './internal/Container';

export type LayerProps = NodeConfig;

export const Layer = memo(({ children, ...config }: LayerProps) => {
  return (
    <Container config={config} type="layer">
      {children}
    </Container>
  );
});
Layer.displayName = 'Layer';
