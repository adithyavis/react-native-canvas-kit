import { memo, useLayoutEffect, useMemo, type ReactNode } from 'react';
import {
  Group as SkiaGroup,
  type Transforms3d,
} from '@shopify/react-native-skia';
import { useSharedValue, useDerivedValue } from 'react-native-reanimated';
import type { NodeConfig, Vector2d } from '../../core/types';
import {
  buildTransforms3dArray,
  resolveTransform,
  DEG_TO_RAD,
  type ResolvedTransform,
} from '../../core/transform';
import type { HitTestDescriptor } from '../../core/hitTestDescriptor';
import type { NodeType } from '../../core/registry';
import {
  ParentContext,
  OrderedChildren,
  useRegisterNode,
  useRegistry,
} from './NodeContext';

export const Container = memo(
  ({ config: _config, type, hitTestDescriptor, children }: ContainerProps) => {
    const config = useMemo(() => {
      const defaultGestureEnabled =
        type === 'shape' || type === 'group' ? true : undefined;
      return {
        ..._config,
        gestureEnabled: _config?.gestureEnabled ?? defaultGestureEnabled,
      };
    }, [_config, type]);

    const registry = useRegistry();
    const transformable =
      config.draggable === true ||
      config.scalable === true ||
      config.rotatable === true;

    const resolvedTransformFromConfig = useMemo(
      () => resolveTransform(config),
      [config]
    );

    const dragOffsetSV = useSharedValue<Vector2d>({ x: 0, y: 0 });
    const scaleSV = useSharedValue<Vector2d>({ x: 1, y: 1 });
    const rotationSV = useSharedValue<number>(0);
    const resolvedTransformFromConfigSV = useSharedValue(
      resolvedTransformFromConfig
    );

    const id = useRegisterNode({ type, config, hitTestDescriptor });

    useLayoutEffect(() => {
      if (!registry || id == null || !transformable) return;
      registry.registerDragOffset(id, dragOffsetSV);
      registry.registerScale(id, scaleSV);
      registry.registerRotation(id, rotationSV);
      return () => {
        registry.unregisterDragOffset(id);
        registry.unregisterScale(id);
        registry.unregisterRotation(id);
      };
    }, [registry, id, transformable, dragOffsetSV, scaleSV, rotationSV]);

    useLayoutEffect(() => {
      const next: ResolvedTransform = {
        x: resolvedTransformFromConfig.x,
        y: resolvedTransformFromConfig.y,
        rotation: resolvedTransformFromConfig.rotation,
        scaleX: resolvedTransformFromConfig.scaleX,
        scaleY: resolvedTransformFromConfig.scaleY,
        skewX: resolvedTransformFromConfig.skewX,
        skewY: resolvedTransformFromConfig.skewY,
        offsetX: resolvedTransformFromConfig.offsetX,
        offsetY: resolvedTransformFromConfig.offsetY,
      };
      resolvedTransformFromConfigSV.value = next;
      dragOffsetSV.value = { x: 0, y: 0 };
      scaleSV.value = { x: 1, y: 1 };
      rotationSV.value = 0;
    }, [
      resolvedTransformFromConfig.x,
      resolvedTransformFromConfig.y,
      resolvedTransformFromConfig.rotation,
      resolvedTransformFromConfig.scaleX,
      resolvedTransformFromConfig.scaleY,
      resolvedTransformFromConfig.skewX,
      resolvedTransformFromConfig.skewY,
      resolvedTransformFromConfig.offsetX,
      resolvedTransformFromConfig.offsetY,
      resolvedTransformFromConfigSV,
      dragOffsetSV,
      scaleSV,
      rotationSV,
    ]);

    useLayoutEffect(() => {
      if (!registry || id == null) return;
      registry.registerResolvedTransform(id, resolvedTransformFromConfigSV);
      return () => {
        registry.unregisterResolvedTransform(id);
      };
    }, [registry, id, resolvedTransformFromConfigSV]);

    const staticTransform = useMemo(
      () => buildTransforms3dArray(config),
      [config]
    );

    const animatedTransform = useDerivedValue<Transforms3d>(() => {
      const r = resolvedTransformFromConfigSV.value;
      const offset = dragOffsetSV.value;
      const scale = scaleSV.value;
      const x = r.x + offset.x;
      const y = r.y + offset.y;
      const rotation = r.rotation + rotationSV.value * DEG_TO_RAD;
      const scaleX = r.scaleX * scale.x;
      const scaleY = r.scaleY * scale.y;
      const out: Transforms3d = [];
      if (x !== 0) out.push({ translateX: x });
      if (y !== 0) out.push({ translateY: y });
      if (rotation !== 0) out.push({ rotate: rotation });
      if (r.skewX !== 0) out.push({ skewX: r.skewX });
      if (r.skewY !== 0) out.push({ skewY: r.skewY });
      if (scaleX !== 1) out.push({ scaleX });
      if (scaleY !== 1) out.push({ scaleY });
      if (r.offsetX !== 0) out.push({ translateX: -r.offsetX });
      if (r.offsetY !== 0) out.push({ translateY: -r.offsetY });
      return out;
    }, []);

    const transform = useMemo(
      () => (transformable ? animatedTransform : staticTransform),
      [animatedTransform, transformable, staticTransform]
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

interface ContainerProps {
  config: NodeConfig;
  type: NodeType;
  hitTestDescriptor?: HitTestDescriptor;
  children?: ReactNode;
}
