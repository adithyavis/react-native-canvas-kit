import { memo, useLayoutEffect, useMemo, type ReactNode } from 'react';
import {
  Group as SkiaGroup,
  type Transforms3d,
} from '@shopify/react-native-skia';
import { useSharedValue, useDerivedValue } from 'react-native-reanimated';
import type { NodeConfig, Vector2d } from '../../core/types';
import { buildTransforms3dArray } from '../../core/transform';
import { buildAffineMatrixFromConfig, multiply } from '../../core/matrix';
import type { NodeType } from '../../core/registry';
import {
  ParentContext,
  OrderedChildren,
  useRegisterNode,
  useRegistry,
} from './NodeContext';

interface ContainerProps {
  config: NodeConfig;
  type: NodeType;
  hitTest?: (p: Vector2d) => boolean;
  children?: ReactNode;
}

export const Container = memo(
  ({ config, type, hitTest, children }: ContainerProps) => {
    const registry = useRegistry();
    const draggable = config.draggable === true;

    const dragX = useSharedValue(0);
    const dragY = useSharedValue(0);

    const id = useRegisterNode({
      type,
      config,
      hitTest,
      getLocalMatrix: () => {
        const baseMatrix = buildAffineMatrixFromConfig(config);
        const dx = dragX.value;
        const dy = dragY.value;
        if (dx === 0 && dy === 0) return baseMatrix;
        return multiply([1, 0, 0, 1, dx, dy], baseMatrix);
      },
    });

    useLayoutEffect(() => {
      if (!registry || id == null || !draggable) return;
      registry.registerDragHandler(id, (x, y) => {
        dragX.value = x;
        dragY.value = y;
      });
      return () => registry.unregisterDragHandler(id);
    }, [registry, id, draggable, dragX, dragY]);

    const staticTransform = useMemo(
      () => buildTransforms3dArray(config),
      [config]
    );
    const animatedTransform = useDerivedValue<Transforms3d>(() => {
      const transforms3d: Transforms3d = [];
      if (dragX.value !== 0) transforms3d.push({ translateX: dragX.value });
      if (dragY.value !== 0) transforms3d.push({ translateY: dragY.value });
      for (let i = 0; i < staticTransform.length; i++) {
        transforms3d.push(staticTransform[i]!);
      }
      return transforms3d;
    }, [staticTransform]);

    const transform = useMemo(
      () => (draggable ? animatedTransform : staticTransform),
      [animatedTransform, draggable, staticTransform]
    );

    if (config.visible === false) {
      return null;
    }

    return (
      <ParentContext.Provider value={id}>
        <SkiaGroup transform={transform} opacity={config.opacity}>
          <OrderedChildren>{children}</OrderedChildren>
        </SkiaGroup>
      </ParentContext.Provider>
    );
  }
);
Container.displayName = 'Container';
