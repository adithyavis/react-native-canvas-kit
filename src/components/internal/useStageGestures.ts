import { useEffect, useMemo, useRef } from 'react';
import {
  Gesture,
  type ComposedGesture,
  type GestureTouchEvent,
} from 'react-native-gesture-handler';
import {
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import type { NodeRegistry } from '../../core/registry';
import type { ActiveGesture } from '../../core/types';
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

export interface StageGestures {
  gesture: ComposedGesture;
  activeGestureSV: SharedValue<ActiveGesture | null>;
}

export function useStageGestures(
  registry: NodeRegistry,
  rootId: number,
  enabled = true,
  options: StageGestureOptions = {}
): StageGestures {
  const pinchSensitivity =
    PINCH_SCALE_SENSITIVITY * (options.pinchSensitivity ?? 1);
  const rotationSensitivity =
    ROTATION_SENSITIVITY * (options.rotationSensitivity ?? 1);
  const snapshotSV = useSharedValue<Snapshot>(EMPTY_SNAPSHOT);
  const idToDragOffsetMapSV = useSharedValue<idToSVMap<Vector2d>>({});
  const idToScaleMapSV = useSharedValue<idToSVMap<Vector2d>>({});
  const idToRotationMapSV = useSharedValue<idToSVMap<number>>({});
  const pressStateSV = useSharedValue<PressState | null>(null);
  const pinchStateSV = useSharedValue<PinchState | null>(null);
  const touchesSV = useSharedValue<Vector2d[]>([]);
  const lastTapSV = useSharedValue<LastTap | null>(null);
  const brushPointsSV = useSharedValue<SharedValue<number[]> | null>(null);
  const brushAbortedSV = useSharedValue(false);
  const idToTransformMapVersionRef = useRef(-1);
  const brushToolVersionRef = useRef(-1);

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
      if (registry.brushToolVersion !== brushToolVersionRef.current) {
        brushToolVersionRef.current = registry.brushToolVersion;
        brushPointsSV.value = registry.getBrushTool()?.activePointsSV ?? null;
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
    brushPointsSV,
  ]);

  const dispatchRef = useRef((type: string, id: number, payload?: unknown) => {
    dispatch(registry, type, id, payload ?? {});
  });

  const commitBrushStrokeRef = useRef((points: number[]) => {
    registry.getBrushTool()?.commit(points);
  });

  const activeGestureSV = useSharedValue<ActiveGesture | null>(null);
  useAnimatedReaction(
    () => {
      const pinch = pinchStateSV.value;
      if (pinch && pinch.targetId !== -1) {
        return {
          nodeId: pinch.targetId,
          isDragging: false,
          isScaling: pinch.scalable,
          isRotating: pinch.rotatable,
        };
      }
      const press = pressStateSV.value;
      if (press && press.dragging && press.dragTargetId !== -1) {
        return {
          nodeId: press.dragTargetId,
          isDragging: true,
          isScaling: false,
          isRotating: false,
        };
      }
      return null;
    },
    (value) => {
      activeGestureSV.value = value;
    }
  );

  const gesture = useMemo(() => {
    const on = dispatchRef.current;
    const commitBrushStroke = commitBrushStrokeRef.current;
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

      const brushPoints = brushPointsSV.value;
      if (brushPoints && e.allTouches.length >= 2) {
        brushAbortedSV.value = true;
        brushPoints.value = [];
      }
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
        const brushPoints = brushPointsSV.value;
        if (brushPoints) {
          if (e.numberOfPointers >= 2) {
            brushAbortedSV.value = true;
            brushPoints.value = [];
            return;
          }
          brushAbortedSV.value = false;
          brushPoints.value = [e.x, e.y];
          return;
        }
        pointerDown(
          snapshotSV.value,
          getTransform,
          pressStateSV,
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
        const brushPoints = brushPointsSV.value;
        if (brushPoints) {
          if (brushAbortedSV.value) return;
          brushPoints.value = [...brushPoints.value, e.x, e.y];
          return;
        }
        pointerMove(
          snapshotSV.value,
          getTransform,
          pressStateSV,
          callbacks,
          e.x,
          e.y
        );
      })
      .onFinalize((e) => {
        'worklet';
        const brushPoints = brushPointsSV.value;
        if (brushPoints) {
          if (brushAbortedSV.value) {
            brushAbortedSV.value = false;
            return;
          }
          runOnJS(commitBrushStroke)(brushPoints.value);
          return;
        }
        pointerUp(
          snapshotSV.value,
          getTransform,
          pressStateSV,
          lastTapSV,
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
        if (brushPointsSV.value) return;
        pinchBegin(
          snapshotSV.value,
          getTransform,
          pinchStateSV,
          callbacks,
          rootId,
          touchesSV.value,
          pressStateSV
        );
      })
      .onUpdate((e) => {
        'worklet';
        pinchUpdate(
          snapshotSV.value,
          getTransform,
          pinchStateSV,
          callbacks,
          e.scale,
          pinchSensitivity
        );
      })
      .onFinalize(() => {
        'worklet';
        pinchEnd(snapshotSV.value, getTransform, pinchStateSV, callbacks);
      });

    const rotation = Gesture.Rotation()
      .enabled(enabled)
      .onBegin(() => {
        'worklet';
        if (brushPointsSV.value) return;
        pinchBegin(
          snapshotSV.value,
          getTransform,
          pinchStateSV,
          callbacks,
          rootId,
          touchesSV.value,
          pressStateSV
        );
      })
      .onUpdate((e) => {
        'worklet';
        rotationUpdate(
          snapshotSV.value,
          getTransform,
          pinchStateSV,
          callbacks,
          e.rotation,
          rotationSensitivity
        );
      })
      .onFinalize(() => {
        'worklet';
        pinchEnd(snapshotSV.value, getTransform, pinchStateSV, callbacks);
      });

    return Gesture.Simultaneous(pan, pinch, rotation);
  }, [
    snapshotSV,
    idToDragOffsetMapSV,
    idToScaleMapSV,
    idToRotationMapSV,
    pressStateSV,
    pinchStateSV,
    touchesSV,
    lastTapSV,
    brushPointsSV,
    brushAbortedSV,
    rootId,
    enabled,
    pinchSensitivity,
    rotationSensitivity,
  ]);

  return { gesture, activeGestureSV };
}
