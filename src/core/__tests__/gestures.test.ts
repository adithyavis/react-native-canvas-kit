import { describe, it, expect } from '@jest/globals';
import type { SharedValue } from 'react-native-reanimated';
import { NodeRegistry } from '../registry';
import { boxHitTestDescriptor } from '../hitTestDescriptor';
import type { NodeConfig, TransformResult } from '../types';
import type { Transform, TransformLookup } from '../snapshot';
import {
  pinchBegin,
  pinchUpdate,
  rotationUpdate,
  pinchEnd,
  PINCH_SCALE_SENSITIVITY,
  ROTATION_SENSITIVITY,
  type GestureEventCallbacks,
  type PinchState,
} from '../gestures';

// Minimal SharedValue stand-in; the gesture worklets only touch `.value`.
function sharedValue<T>(initial: T): SharedValue<T> {
  return { value: initial } as unknown as SharedValue<T>;
}

function buildScene() {
  const reg = new NodeRegistry();
  const stage = reg.register({
    parentId: null,
    type: 'stage',
    getConfig: () => ({}),
  });
  const group = reg.register({
    parentId: stage,
    type: 'group',
    getConfig: (): NodeConfig => ({ draggable: true }),
  });
  const shape = reg.register({
    parentId: group,
    type: 'shape',
    getConfig: (): NodeConfig => ({ gestureEnabled: true }),
    getHitTestDescriptor: () => boxHitTestDescriptor(0, 0, 100, 100, 0),
  });
  return { snapshot: reg.getSnapshot(), stage, group, shape };
}

// A test harness whose `getTransform` reads back the same per-node live
// transform that setScale/setRotation/setDragOffset write — mirroring how the
// real shared-value maps behave, so the resolved event payload is meaningful.
function makeHarness() {
  const scales: Array<[number, number, number]> = [];
  const rotations: Array<[number, number]> = [];
  const events: Array<[string, number, TransformResult]> = [];
  const live = new Map<number, Transform>();
  const liveFor = (id: number): Transform => {
    let t = live.get(id);
    if (!t) {
      t = { offset: { x: 0, y: 0 }, scale: { x: 1, y: 1 }, rotation: 0 };
      live.set(id, t);
    }
    return t;
  };
  const getTransform: TransformLookup = (id) =>
    live.get(id) ?? {
      offset: { x: 0, y: 0 },
      scale: { x: 1, y: 1 },
      rotation: 0,
    };
  const callbacks: GestureEventCallbacks = {
    setDragOffset: (id, x, y) => {
      liveFor(id).offset = { x, y };
    },
    setScale: (id, x, y) => {
      liveFor(id).scale = { x, y };
      scales.push([id, x, y]);
    },
    setRotation: (id, deg) => {
      liveFor(id).rotation = deg;
      rotations.push([id, deg]);
    },
    on: (type, id, payload) =>
      events.push([type, id, payload as TransformResult]),
  };
  return { getTransform, callbacks, scales, rotations, events };
}

describe('pinch / rotation gestures', () => {
  it('targets the draggable ancestor under the focal point and fires transformstart', () => {
    const { snapshot, group } = buildScene();
    const pinch = sharedValue<PinchState | null>(null);
    const { getTransform, callbacks, events } = makeHarness();

    pinchBegin(
      snapshot,
      getTransform,
      pinch,
      callbacks,
      snapshot.rootId,
      50,
      50
    );

    expect(pinch.value?.targetId).toBe(group);
    expect(pinch.value?.activeGestures).toBe(1);
    expect(events).toEqual([['transformstart', group, expect.anything()]]);
  });

  it('scales the target and emits the resolved scale in the event payload', () => {
    const { snapshot, group } = buildScene();
    const pinch = sharedValue<PinchState | null>(null);
    const { getTransform, callbacks, scales, events } = makeHarness();

    pinchBegin(
      snapshot,
      getTransform,
      pinch,
      callbacks,
      snapshot.rootId,
      50,
      50
    );
    pinchUpdate(snapshot, getTransform, pinch, callbacks, 2);

    // The raw 2x pinch is damped toward 1 by PINCH_SCALE_SENSITIVITY.
    const damped = 1 + (2 - 1) * PINCH_SCALE_SENSITIVITY;
    expect(scales).toEqual([[group, damped, damped]]);
    const transform = events.find(([type]) => type === 'transform');
    expect(transform?.[1]).toBe(group);
    expect(transform?.[2]?.scaleX).toBeCloseTo(damped);
    expect(transform?.[2]?.scaleY).toBeCloseTo(damped);
  });

  it('rotates the target by the gesture angle in degrees', () => {
    const { snapshot, group } = buildScene();
    const pinch = sharedValue<PinchState | null>(null);
    const { getTransform, callbacks, rotations, events } = makeHarness();

    pinchBegin(
      snapshot,
      getTransform,
      pinch,
      callbacks,
      snapshot.rootId,
      50,
      50
    );
    rotationUpdate(snapshot, getTransform, pinch, callbacks, Math.PI / 2);

    // A 90° gesture is damped by ROTATION_SENSITIVITY.
    const dampedDeg = 90 * ROTATION_SENSITIVITY;
    expect(rotations).toHaveLength(1);
    expect(rotations[0]![0]).toBe(group);
    expect(rotations[0]![1]).toBeCloseTo(dampedDeg);
    const transform = events.find(([type]) => type === 'transform');
    expect(transform?.[2]?.rotation).toBeCloseTo(dampedDeg);
  });

  it('shares one target across pinch + rotation and ends only when both finish', () => {
    const { snapshot, group } = buildScene();
    const pinch = sharedValue<PinchState | null>(null);
    const { getTransform, callbacks, events } = makeHarness();

    // pinch begins, then rotation begins on the same target (transformstart
    // should fire exactly once).
    pinchBegin(
      snapshot,
      getTransform,
      pinch,
      callbacks,
      snapshot.rootId,
      50,
      50
    );
    pinchBegin(
      snapshot,
      getTransform,
      pinch,
      callbacks,
      snapshot.rootId,
      50,
      50
    );
    expect(pinch.value?.activeGestures).toBe(2);
    expect(events.filter(([type]) => type === 'transformstart')).toHaveLength(
      1
    );

    // first finger up: still active, no transformend yet
    pinchEnd(snapshot, getTransform, pinch, callbacks);
    expect(pinch.value?.activeGestures).toBe(1);
    expect(events.some(([type]) => type === 'transformend')).toBe(false);

    // second finger up: gesture fully ends, transformend fires once
    pinchEnd(snapshot, getTransform, pinch, callbacks);
    expect(pinch.value).toBeNull();
    expect(events.filter(([type]) => type === 'transformend')).toEqual([
      ['transformend', group, expect.anything()],
    ]);
  });

  it('is a no-op when the focal point misses any draggable node', () => {
    const { snapshot } = buildScene();
    const pinch = sharedValue<PinchState | null>(null);
    const { getTransform, callbacks, scales, events } = makeHarness();

    pinchBegin(
      snapshot,
      getTransform,
      pinch,
      callbacks,
      snapshot.rootId,
      500,
      500
    );
    pinchUpdate(snapshot, getTransform, pinch, callbacks, 2);

    expect(pinch.value?.targetId).toBe(-1);
    expect(scales).toEqual([]);
    expect(events).toEqual([]);
  });
});
