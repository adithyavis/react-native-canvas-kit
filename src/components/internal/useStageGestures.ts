import { useMemo, useRef } from 'react';
import { Gesture, type GestureType } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import type { NodeRegistry } from '../../core/registry';
import { GestureController } from '../../core/dispatch';

export function useStageGestures(
  registry: NodeRegistry,
  rootId: number
): GestureType {
  const controllerRef = useRef<GestureController | null>(null);
  if (!controllerRef.current) {
    controllerRef.current = new GestureController(registry, rootId, {
      setDragOffset: (id, x, y) => registry.onDrag(id, x, y),
    });
  }

  const handlersRef = useRef({
    onBegin: (x: number, y: number) =>
      controllerRef.current!.pointerDown({ x, y }, { x, y }, Date.now()),
    onUpdate: (x: number, y: number) =>
      controllerRef.current!.pointerMove({ x, y }, { x, y }),
    onEnd: (x: number, y: number) =>
      controllerRef.current!.pointerUp({ x, y }, { x, y }, Date.now()),
  });

  return useMemo(() => {
    const handlers = handlersRef.current;
    return Gesture.Pan()
      .minDistance(0)
      .onBegin((e) => {
        'worklet';
        runOnJS(handlers.onBegin)(e.x, e.y);
      })
      .onUpdate((e) => {
        'worklet';
        runOnJS(handlers.onUpdate)(e.x, e.y);
      })
      .onFinalize((e) => {
        'worklet';
        runOnJS(handlers.onEnd)(e.x, e.y);
      });
  }, []);
}
