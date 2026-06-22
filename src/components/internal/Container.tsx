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
import { buildTransforms3dArray, resolveTransform } from '../../core/transform';
import type { HitTestDescriptor } from '../../core/hitTestDescriptor';
import type { NodeType } from '../../core/registry';
import {
  ParentContext,
  OrderedChildren,
  useRegisterNode,
  useRegistry,
} from './NodeContext';

const DEG_TO_RAD = Math.PI / 180;

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
    const draggable = config.draggable === true;

    const dragOffsetSV = useSharedValue<Vector2d>({ x: 0, y: 0 });
    const scaleSV = useSharedValue<Vector2d>({ x: 1, y: 1 });
    const rotationSV = useSharedValue<number>(0);

    const id = useRegisterNode({ type, config, hitTestDescriptor });

    useLayoutEffect(() => {
      if (!registry || id == null || !draggable) return;
      registry.registerDragOffset(id, dragOffsetSV);
      registry.registerScale(id, scaleSV);
      registry.registerRotation(id, rotationSV);
      return () => {
        registry.unregisterDragOffset(id);
        registry.unregisterScale(id);
        registry.unregisterRotation(id);
      };
    }, [registry, id, draggable, dragOffsetSV, scaleSV, rotationSV]);

    useEffect(() => {
      dragOffsetSV.value = { x: 0, y: 0 };
      scaleSV.value = { x: 1, y: 1 };
      rotationSV.value = 0;
    }, [
      config.x,
      config.y,
      config.scaleX,
      config.scaleY,
      config.rotation,
      dragOffsetSV,
      scaleSV,
      rotationSV,
    ]);

    const resolved = useMemo(() => resolveTransform(config), [config]);
    const staticTransform = useMemo(
      () => buildTransforms3dArray(config),
      [config]
    );

    const animatedTransform = useDerivedValue<Transforms3d>(() => {
      const offset = dragOffsetSV.value;
      const scale = scaleSV.value;
      const x = resolved.x + offset.x;
      const y = resolved.y + offset.y;
      const rotation = resolved.rotation + rotationSV.value * DEG_TO_RAD;
      const scaleX = resolved.scaleX * scale.x;
      const scaleY = resolved.scaleY * scale.y;
      const out: Transforms3d = [];
      if (x !== 0) out.push({ translateX: x });
      if (y !== 0) out.push({ translateY: y });
      if (rotation !== 0) out.push({ rotate: rotation });
      if (resolved.skewX !== 0) out.push({ skewX: resolved.skewX });
      if (resolved.skewY !== 0) out.push({ skewY: resolved.skewY });
      if (scaleX !== 1) out.push({ scaleX });
      if (scaleY !== 1) out.push({ scaleY });
      if (resolved.offsetX !== 0) out.push({ translateX: -resolved.offsetX });
      if (resolved.offsetY !== 0) out.push({ translateY: -resolved.offsetY });
      return out;
    }, [resolved]);

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

interface ContainerProps {
  config: NodeConfig;
  type: NodeType;
  hitTestDescriptor?: HitTestDescriptor;
  children?: ReactNode;
}
