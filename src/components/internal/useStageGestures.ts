import { useEffect, useMemo, useRef } from 'react';
import {
  Gesture,
  type ComposedGesture,
  type GestureTouchEvent,
} from 'react-native-gesture-handler';
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
  pinchBegin,
  pinchUpdate,
  rotationUpdate,
  pinchEnd,
  PINCH_SCALE_SENSITIVITY,
  ROTATION_SENSITIVITY,
  type GestureEventCallbacks,
  type LastTap,
  type PressState,
  type PinchState,
} from '../../core/gestures';
import type { Vector2d } from '../../core/types';

type idToSVMap<T> = Record<number, SharedValue<T>>;

export interface StageGestureOptions {
  // User multipliers on top of the base sensitivity (default 1 = base only).
  pinchSensitivity?: number;
  rotationSensitivity?: number;
}

export function useStageGestures(
  registry: NodeRegistry,
  rootId: number,
  enabled = true,
  options: StageGestureOptions = {}
): ComposedGesture {
  const pinchSensitivity =
    PINCH_SCALE_SENSITIVITY * (options.pinchSensitivity ?? 1);
  const rotationSensitivity =
    ROTATION_SENSITIVITY * (options.rotationSensitivity ?? 1);
  const snapshotSV = useSharedValue<Snapshot>(EMPTY_SNAPSHOT);
  const idToDragOffsetMapSV = useSharedValue<idToSVMap<Vector2d>>({});
  const idToScaleMapSV = useSharedValue<idToSVMap<Vector2d>>({});
  const idToRotationMapSV = useSharedValue<idToSVMap<number>>({});
  const pressState = useSharedValue<PressState | null>(null);
  const pinchState = useSharedValue<PinchState | null>(null);
  const touchesSV = useSharedValue<Vector2d[]>([]);
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

  const dispatchRef = useRef((type: string, id: number, payload?: unknown) => {
    dispatch(registry, type, id, payload ?? {});
  });

  return useMemo(() => {
    const on = dispatchRef.current;
    const getTransform: TransformLookup = (id) => {
      'worklet';
      return {
        offset: idToDragOffsetMapSV.value[id]?.value ?? { x: 0, y: 0 },
        scale: idToScaleMapSV.value[id]?.value ?? { x: 1, y: 1 },
        rotation: idToRotationMapSV.value[id]?.value ?? 0,
      };
    };
    const callbacks: GestureEventCallbacks = {
      setDragOffset: (id, x, y) => {
        'worklet';
        const sv = idToDragOffsetMapSV.value[id];
        if (sv) sv.value = { x, y };
      },
      setScale: (id, x, y) => {
        'worklet';
        const sv = idToScaleMapSV.value[id];
        if (sv) sv.value = { x, y };
      },
      setRotation: (id, rotationDeg) => {
        'worklet';
        const sv = idToRotationMapSV.value[id];
        if (sv) sv.value = rotationDeg;
      },
      on: (type, id, payload) => {
        'worklet';
        runOnJS(on)(type, id, payload);
      },
    };

    const syncTouches = (e: GestureTouchEvent) => {
      'worklet';
      const touches: Vector2d[] = [];
      for (let i = 0; i < e.allTouches.length; i++) {
        const touch = e.allTouches[i]!;
        touches.push({ x: touch.x, y: touch.y });
      }
      touchesSV.value = touches;
    };

    const pan = Gesture.Pan()
      .enabled(enabled)
      .minDistance(0)
      .onTouchesDown(syncTouches)
      .onTouchesMove(syncTouches)
      .onTouchesUp(syncTouches)
      .onTouchesCancelled(syncTouches)
      .onBegin((e) => {
        'worklet';
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
        if (e.numberOfPointers >= 2) return;
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

    const pinch = Gesture.Pinch()
      .enabled(enabled)
      .onBegin(() => {
        'worklet';
        pinchBegin(
          snapshotSV.value,
          getTransform,
          pinchState,
          callbacks,
          rootId,
          touchesSV.value
        );
      })
      .onUpdate((e) => {
        'worklet';
        pinchUpdate(
          snapshotSV.value,
          getTransform,
          pinchState,
          callbacks,
          e.scale,
          pinchSensitivity
        );
      })
      .onFinalize(() => {
        'worklet';
        pinchEnd(snapshotSV.value, getTransform, pinchState, callbacks);
      });

    const rotation = Gesture.Rotation()
      .enabled(enabled)
      .onBegin(() => {
        'worklet';
        pinchBegin(
          snapshotSV.value,
          getTransform,
          pinchState,
          callbacks,
          rootId,
          touchesSV.value
        );
      })
      .onUpdate((e) => {
        'worklet';
        rotationUpdate(
          snapshotSV.value,
          getTransform,
          pinchState,
          callbacks,
          e.rotation,
          rotationSensitivity
        );
      })
      .onFinalize(() => {
        'worklet';
        pinchEnd(snapshotSV.value, getTransform, pinchState, callbacks);
      });

    return Gesture.Simultaneous(pan, pinch, rotation);
  }, [
    snapshotSV,
    idToDragOffsetMapSV,
    idToScaleMapSV,
    idToRotationMapSV,
    pressState,
    pinchState,
    touchesSV,
    lastTap,
    rootId,
    enabled,
    pinchSensitivity,
    rotationSensitivity,
  ]);
}
