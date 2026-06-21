import { memo, useLayoutEffect, useRef, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Canvas } from '@shopify/react-native-skia';
import { GestureDetector } from 'react-native-gesture-handler';
import { NodeRegistry } from '../core/registry';
import {
  RegistryContext,
  ParentContext,
  OrderedChildren,
} from './internal/NodeContext';
import { useStageGestures } from './internal/useStageGestures';

export interface StageProps {
  width: number;
  height: number;
  style?: StyleProp<ViewStyle>;
  listening?: boolean;
  gestureEnabled?: boolean;
  children?: ReactNode;
}

export const Stage = memo(
  ({
    width,
    height,
    style,
    listening = true,
    gestureEnabled: _gestureEnabled = true,
    children,
  }: StageProps) => {
    const registryRef = useRef<NodeRegistry | null>(null);
    if (!registryRef.current) {
      registryRef.current = new NodeRegistry();
    }
    const registry = registryRef.current;

    const rootIdRef = useRef<number | null>(null);
    if (rootIdRef.current == null) {
      rootIdRef.current = registry.allocateId();
    }
    const rootId = rootIdRef.current;

    useLayoutEffect(() => {
      registry.register({
        id: rootId,
        parentId: null,
        type: 'stage',
        getConfig: () => ({}),
      });
      return () => registry.unregister(rootId);
    }, [registry, rootId]);

    const gestureEnabled = listening !== false && _gestureEnabled !== false;
    const gesture = useStageGestures(registry, rootId, gestureEnabled);

    const canvas = (
      <Canvas
        style={[{ width, height }, style]}
        pointerEvents={gestureEnabled ? 'auto' : 'none'}
      >
        <RegistryContext.Provider value={registry}>
          <ParentContext.Provider value={rootId}>
            <OrderedChildren>{children}</OrderedChildren>
          </ParentContext.Provider>
        </RegistryContext.Provider>
      </Canvas>
    );

    if (!gestureEnabled) {
      return canvas;
    }

    return <GestureDetector gesture={gesture}>{canvas}</GestureDetector>;
  }
);
Stage.displayName = 'Stage';
