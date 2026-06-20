import {
  memo,
  useEffect,
  useLayoutEffect,
  useMemo,
  type ReactNode,
} from 'react';
import {
  Group as SkiaGroup,
  type Transforms3d,
} from '@shopify/react-native-skia';
import { useSharedValue, useDerivedValue } from 'react-native-reanimated';
import type { NodeConfig, Vector2d } from '../../core/types';
import { buildTransforms3dArray } from '../../core/transform';
import type { HitTestDescriptor } from '../../core/hitTestDescriptor';
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
  hitTestDescriptor?: HitTestDescriptor;
  children?: ReactNode;
}

export const Container = memo(
  ({ config, type, hitTestDescriptor, children }: ContainerProps) => {
    const registry = useRegistry();
    const draggable = config.draggable === true;

    const dragOffsetSV = useSharedValue<Vector2d>({ x: 0, y: 0 });

    const id = useRegisterNode({ type, config, hitTestDescriptor });

    useLayoutEffect(() => {
      if (!registry || id == null || !draggable) return;
      registry.registerDragOffset(id, dragOffsetSV);
      return () => registry.unregisterDragOffset(id);
    }, [registry, id, draggable, dragOffsetSV]);

    useEffect(() => {
      // on change of prop provided x or y, we reset drag values to make the component controlled
      dragOffsetSV.value = { x: 0, y: 0 };
    }, [config.x, config.y, dragOffsetSV]);

    const staticTransform = useMemo(
      () => buildTransforms3dArray(config),
      [config]
    );
    const animatedTransform = useDerivedValue<Transforms3d>(() => {
      const transforms3d: Transforms3d = [];
      const dx = dragOffsetSV.value.x;
      const dy = dragOffsetSV.value.y;
      if (dx !== 0) transforms3d.push({ translateX: dx });
      if (dy !== 0) transforms3d.push({ translateY: dy });
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
