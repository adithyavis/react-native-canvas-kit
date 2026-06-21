import { useEffect, useMemo, useRef } from 'react';
import { Gesture, type GestureType } from 'react-native-gesture-handler';
import {
  runOnJS,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import type { NodeRegistry } from '../../core/registry';
import { dispatch } from '../../core/dispatch';
import {
  EMPTY_SNAPSHOT,
  type OffsetLookup,
  type Snapshot,
} from '../../core/snapshot';
import {
  pointerDown,
  pointerMove,
  pointerUp,
  type GestureEventCallbacks,
  type LastTap,
  type PressState,
} from '../../core/gestures';
import type { Vector2d } from '../../core/types';

export function useStageGestures(
  registry: NodeRegistry,
  rootId: number,
  enabled = true
): GestureType {
  const snapshotSV = useSharedValue<Snapshot>(EMPTY_SNAPSHOT);
  const idToDragOffsetMapSV = useSharedValue<
    Record<number, SharedValue<Vector2d>>
  >({});
  const pressState = useSharedValue<PressState | null>(null);
  const lastTap = useSharedValue<LastTap | null>(null);
  const idToDragOffsetMapVersionRef = useRef(-1);

  useEffect(() => {
    const syncSnapshot = () => {
      snapshotSV.value = registry.getSnapshot();
      if (
        registry.idToDragOffsetMapVersion !==
        idToDragOffsetMapVersionRef.current
      ) {
        idToDragOffsetMapVersionRef.current = registry.idToDragOffsetMapVersion;
        idToDragOffsetMapSV.value = registry.getIdToDragOffsetMap();
      }
    };
    const unsubscribe = registry.subscribeToChanges(syncSnapshot);
    syncSnapshot();
    return unsubscribe;
  }, [registry, snapshotSV, idToDragOffsetMapSV]);

  const dispatchRef = useRef((type: string, id: number) => {
    dispatch(registry, type, id, {});
  });

  return useMemo(() => {
    const on = dispatchRef.current;
    return Gesture.Pan()
      .enabled(enabled)
      .minDistance(0)
      .onBegin((e) => {
        'worklet';
        const getOffset: OffsetLookup = (id) =>
          idToDragOffsetMapSV.value[id]?.value ?? { x: 0, y: 0 };
        const gestureEventCallbacks: GestureEventCallbacks = {
          setOffset: (id, x, y) => {
            const dragOffsetSV = idToDragOffsetMapSV.value[id];
            if (dragOffsetSV) {
              dragOffsetSV.value = { x, y };
            }
          },
          on: (type, id) => runOnJS(on)(type, id),
        };
        pointerDown(
          snapshotSV.value,
          getOffset,
          pressState,
          gestureEventCallbacks,
          rootId,
          e.x,
          e.y,
          Date.now()
        );
      })
      .onUpdate((e) => {
        'worklet';
        const getOffset: OffsetLookup = (id) =>
          idToDragOffsetMapSV.value[id]?.value ?? { x: 0, y: 0 };
        const gestureEventCallbacks: GestureEventCallbacks = {
          setOffset: (id, x, y) => {
            const dragOffsetSV = idToDragOffsetMapSV.value[id];
            if (dragOffsetSV) {
              dragOffsetSV.value = { x, y };
            }
          },
          on: (type, id) => runOnJS(on)(type, id),
        };
        pointerMove(
          snapshotSV.value,
          getOffset,
          pressState,
          gestureEventCallbacks,
          e.x,
          e.y
        );
      })
      .onFinalize((e) => {
        'worklet';
        const getOffset: OffsetLookup = (id) =>
          idToDragOffsetMapSV.value[id]?.value ?? { x: 0, y: 0 };
        const gestureEventCallbacks: GestureEventCallbacks = {
          setOffset: (id, x, y) => {
            const dragOffsetSV = idToDragOffsetMapSV.value[id];
            if (dragOffsetSV) {
              dragOffsetSV.value = { x, y };
            }
          },
          on: (type, id) => runOnJS(on)(type, id),
        };
        pointerUp(
          snapshotSV.value,
          getOffset,
          pressState,
          lastTap,
          gestureEventCallbacks,
          rootId,
          e.x,
          e.y,
          Date.now()
        );
      });
  }, [snapshotSV, idToDragOffsetMapSV, pressState, lastTap, rootId, enabled]);
}
