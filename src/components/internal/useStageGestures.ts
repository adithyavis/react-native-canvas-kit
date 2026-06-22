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
  type TransformLookup,
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

type idToSVMap<T> = Record<number, SharedValue<T>>;

export function useStageGestures(
  registry: NodeRegistry,
  rootId: number,
  enabled = true
): GestureType {
  const snapshotSV = useSharedValue<Snapshot>(EMPTY_SNAPSHOT);
  const idToDragOffsetMapSV = useSharedValue<idToSVMap<Vector2d>>({});
  const idToScaleMapSV = useSharedValue<idToSVMap<Vector2d>>({});
  const idToRotationMapSV = useSharedValue<idToSVMap<number>>({});
  const pressState = useSharedValue<PressState | null>(null);
  const lastTap = useSharedValue<LastTap | null>(null);
  const idToTransformMapVersionRef = useRef(-1);

  useEffect(() => {
    const syncSnapshot = () => {
      snapshotSV.value = registry.getSnapshot();
      if (
        registry.idToTransformMapVersion !== idToTransformMapVersionRef.current
      ) {
        idToTransformMapVersionRef.current = registry.idToTransformMapVersion;
        idToDragOffsetMapSV.value = registry.getIdToDragOffsetMap();
        idToScaleMapSV.value = registry.getIdToScaleMap();
        idToRotationMapSV.value = registry.getIdToRotationMap();
      }
    };
    const unsubscribe = registry.subscribeToChanges(syncSnapshot);
    syncSnapshot();
    return unsubscribe;
  }, [
    registry,
    snapshotSV,
    idToDragOffsetMapSV,
    idToScaleMapSV,
    idToRotationMapSV,
  ]);

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
        const getTransform: TransformLookup = (id) => ({
          offset: idToDragOffsetMapSV.value[id]?.value ?? { x: 0, y: 0 },
          scale: idToScaleMapSV.value[id]?.value ?? { x: 1, y: 1 },
          rotation: idToRotationMapSV.value[id]?.value ?? 0,
        });
        const callbacks: GestureEventCallbacks = {
          setTransform: (id, x, y) => {
            const sv = idToDragOffsetMapSV.value[id];
            if (sv) sv.value = { x, y };
          },
          on: (type, id) => runOnJS(on)(type, id),
        };
        pointerDown(
          snapshotSV.value,
          getTransform,
          pressState,
          callbacks,
          rootId,
          e.x,
          e.y,
          Date.now()
        );
      })
      .onUpdate((e) => {
        'worklet';
        const getTransform: TransformLookup = (id) => ({
          offset: idToDragOffsetMapSV.value[id]?.value ?? { x: 0, y: 0 },
          scale: idToScaleMapSV.value[id]?.value ?? { x: 1, y: 1 },
          rotation: idToRotationMapSV.value[id]?.value ?? 0,
        });
        const callbacks: GestureEventCallbacks = {
          setTransform: (id, x, y) => {
            const sv = idToDragOffsetMapSV.value[id];
            if (sv) sv.value = { x, y };
          },
          on: (type, id) => runOnJS(on)(type, id),
        };
        pointerMove(
          snapshotSV.value,
          getTransform,
          pressState,
          callbacks,
          e.x,
          e.y
        );
      })
      .onFinalize((e) => {
        'worklet';
        const getTransform: TransformLookup = (id) => ({
          offset: idToDragOffsetMapSV.value[id]?.value ?? { x: 0, y: 0 },
          scale: idToScaleMapSV.value[id]?.value ?? { x: 1, y: 1 },
          rotation: idToRotationMapSV.value[id]?.value ?? 0,
        });
        const callbacks: GestureEventCallbacks = {
          setTransform: (id, x, y) => {
            const sv = idToDragOffsetMapSV.value[id];
            if (sv) sv.value = { x, y };
          },
          on: (type, id) => runOnJS(on)(type, id),
        };
        pointerUp(
          snapshotSV.value,
          getTransform,
          pressState,
          lastTap,
          callbacks,
          rootId,
          e.x,
          e.y,
          Date.now()
        );
      });
  }, [
    snapshotSV,
    idToDragOffsetMapSV,
    idToScaleMapSV,
    idToRotationMapSV,
    pressState,
    lastTap,
    rootId,
    enabled,
  ]);
}
