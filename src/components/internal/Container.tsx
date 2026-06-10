import { type ReactNode } from 'react';
import { Group as SkiaGroup } from '@shopify/react-native-skia';
import type { NodeConfig } from '../../core/types';
import { buildTransform } from '../../core/transform';

export function Container({
  config,
  children,
}: {
  config: NodeConfig;
  children?: ReactNode;
}) {
  if (config.visible === false) {
    return null;
  }
  const transform = buildTransform(config);
  return (
    <SkiaGroup
      transform={transform.length > 0 ? transform : undefined}
      opacity={config.opacity}
    >
      {children}
    </SkiaGroup>
  );
}
