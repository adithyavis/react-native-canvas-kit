import {
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import type { NodeConfig, Vector2d } from '../core/types';
import { resolveTransform, type ResolvedTransform } from '../core/transform';
import { boxHitTestDescriptor } from '../core/hitTestDescriptor';
import { useRegisterNode, useRegistry } from './internal/NodeContext';
import { usePortal, type PortalPointerEvents } from './internal/portal';

export interface PortalProps extends NodeConfig {
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  pointerEvents?: PortalPointerEvents;
  children?: ReactNode;
}

export const Portal = memo(
  ({
    width,
    height,
    style,
    pointerEvents,
    children,
    ...config
  }: PortalProps) => {
    const registry = useRegistry();
    const portal = usePortal();

    const dragOffsetSV = useSharedValue<Vector2d>({ x: 0, y: 0 });
    const scaleSV = useSharedValue<Vector2d>({ x: 1, y: 1 });
    const rotationSV = useSharedValue<number>(0);

    const resolved = useMemo(() => resolveTransform(config), [config]);
    const resolvedTransformSV = useSharedValue<ResolvedTransform>(resolved);

    const transformable =
      config.draggable === true ||
      config.scalable === true ||
      config.rotatable === true;

    const nodeConfig: NodeConfig = useMemo(
      () => ({ gestureEnabled: true, ...config }),
      [config]
    );

    const [measured, setMeasured] = useState<{
      width: number;
      height: number;
    } | null>(null);

    const onMeasure = useCallback(
      (layoutWidth: number, layoutHeight: number) => {
        setMeasured((prev) =>
          prev && prev.width === layoutWidth && prev.height === layoutHeight
            ? prev
            : { width: layoutWidth, height: layoutHeight }
        );
      },
      []
    );

    const hitWidth = width ?? measured?.width ?? 0;
    const hitHeight = height ?? measured?.height ?? 0;

    const hitTestDescriptor = useMemo(
      () => boxHitTestDescriptor(0, 0, hitWidth, hitHeight),
      [hitWidth, hitHeight]
    );

    const id = useRegisterNode({
      type: 'shape',
      config: nodeConfig,
      hitTestDescriptor,
    });

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
      resolvedTransformSV.value = {
        x: resolved.x,
        y: resolved.y,
        rotation: resolved.rotation,
        scaleX: resolved.scaleX,
        scaleY: resolved.scaleY,
        skewX: resolved.skewX,
        skewY: resolved.skewY,
        offsetX: resolved.offsetX,
        offsetY: resolved.offsetY,
      };
      dragOffsetSV.value = { x: 0, y: 0 };
      scaleSV.value = { x: 1, y: 1 };
      rotationSV.value = 0;
    }, [
      resolved.x,
      resolved.y,
      resolved.rotation,
      resolved.scaleX,
      resolved.scaleY,
      resolved.skewX,
      resolved.skewY,
      resolved.offsetX,
      resolved.offsetY,
      resolvedTransformSV,
      dragOffsetSV,
      scaleSV,
      rotationSV,
    ]);

    useLayoutEffect(() => {
      if (!portal || id == null) return;
      return portal.registerPortal({
        id,
        width,
        height,
        style,
        pointerEvents,
        onLayout: onMeasure,
        resolvedTransform: resolvedTransformSV,
        dragOffset: dragOffsetSV,
        scale: scaleSV,
        rotation: rotationSV,
        children,
      });
    }, [
      portal,
      id,
      onMeasure,
      width,
      height,
      style,
      pointerEvents,
      resolvedTransformSV,
      dragOffsetSV,
      scaleSV,
      rotationSV,
      children,
    ]);

    return null;
  }
);
Portal.displayName = 'Portal';
