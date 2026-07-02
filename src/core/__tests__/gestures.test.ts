import { describe, it, expect } from '@jest/globals';
import type { SharedValue } from 'react-native-reanimated';
import { NodeRegistry } from '../registry';
import { boxHitTestDescriptor } from '../hitTestDescriptor';
import { getAbsoluteMatrixFromSnapshot } from '../snapshot';
import { applyTransformsToPoint } from '../matrix';
import type { NodeConfig, TransformResult, Vector2d } from '../types';
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

// The scene's shape is a 100x100 box at the group's origin. Two fingers both
// inside it resolve to the draggable group; off-box or split fingers do not.
const TOUCHES_ON_SHAPE: Vector2d[] = [
  { x: 40, y: 40 },
  { x: 60, y: 60 },
];
const TOUCHES_OFF_SHAPE: Vector2d[] = [
  { x: 500, y: 500 },
  { x: 510, y: 510 },
];
const TOUCHES_SPLIT: Vector2d[] = [
  { x: 40, y: 40 },
  { x: 500, y: 500 },
];

describe('pinch / rotation gestures', () => {
  it('targets the draggable ancestor both fingers land on and fires transformstart', () => {
    const { snapshot, group } = buildScene();
    const pinch = sharedValue<PinchState | null>(null);
    const { getTransform, callbacks, events } = makeHarness();

    pinchBegin(
      snapshot,
      getTransform,
      pinch,
      callbacks,
      snapshot.rootId,
      TOUCHES_ON_SHAPE
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
      TOUCHES_ON_SHAPE
    );
    pinchUpdate(
      snapshot,
      getTransform,
      pinch,
      callbacks,
      2,
      PINCH_SCALE_SENSITIVITY
    );

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
      TOUCHES_ON_SHAPE
    );
    rotationUpdate(
      snapshot,
      getTransform,
      pinch,
      callbacks,
      Math.PI / 2,
      ROTATION_SENSITIVITY
    );

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
      TOUCHES_ON_SHAPE
    );
    pinchBegin(
      snapshot,
      getTransform,
      pinch,
      callbacks,
      snapshot.rootId,
      TOUCHES_ON_SHAPE
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

  it('is a no-op when both fingers miss any draggable node', () => {
    const { snapshot } = buildScene();
    const pinch = sharedValue<PinchState | null>(null);
    const { getTransform, callbacks, scales, events } = makeHarness();

    pinchBegin(
      snapshot,
      getTransform,
      pinch,
      callbacks,
      snapshot.rootId,
      TOUCHES_OFF_SHAPE
    );
    pinchUpdate(
      snapshot,
      getTransform,
      pinch,
      callbacks,
      2,
      PINCH_SCALE_SENSITIVITY
    );

    expect(pinch.value?.targetId).toBe(-1);
    expect(scales).toEqual([]);
    expect(events).toEqual([]);
  });

  it('is a no-op when only one finger hits the target', () => {
    const { snapshot } = buildScene();
    const pinch = sharedValue<PinchState | null>(null);
    const { getTransform, callbacks, scales, events } = makeHarness();

    pinchBegin(
      snapshot,
      getTransform,
      pinch,
      callbacks,
      snapshot.rootId,
      TOUCHES_SPLIT
    );
    pinchUpdate(
      snapshot,
      getTransform,
      pinch,
      callbacks,
      2,
      PINCH_SCALE_SENSITIVITY
    );

    expect(pinch.value?.targetId).toBe(-1);
    expect(scales).toEqual([]);
    expect(events).toEqual([]);
  });

  it('keeps the shape centre fixed when rotating about it', () => {
    // A draggable 100x100 box at the origin: the multi-touch target is the
    // shape itself, so it carries hit geometry and the centre pivot applies.
    const reg = new NodeRegistry();
    const stage = reg.register({
      parentId: null,
      type: 'stage',
      getConfig: () => ({}),
    });
    const shape = reg.register({
      parentId: stage,
      type: 'shape',
      getConfig: (): NodeConfig => ({ draggable: true }),
      getHitTestDescriptor: () => boxHitTestDescriptor(0, 0, 100, 100, 0),
    });
    const snapshot = reg.getSnapshot();
    const pinch = sharedValue<PinchState | null>(null);
    const { getTransform, callbacks } = makeHarness();

    const center: Vector2d = { x: 50, y: 50 };
    const centerBefore = applyTransformsToPoint(
      getAbsoluteMatrixFromSnapshot(snapshot, getTransform, shape),
      center
    );

    pinchBegin(snapshot, getTransform, pinch, callbacks, snapshot.rootId, [
      { x: 40, y: 40 },
      { x: 60, y: 60 },
    ]);
    rotationUpdate(
      snapshot,
      getTransform,
      pinch,
      callbacks,
      Math.PI / 2,
      ROTATION_SENSITIVITY
    );

    // A 90° rotation about the corner would fling the centre to (-50, 50);
    // the compensating drag offset should pin it back to where it started.
    const centerAfter = applyTransformsToPoint(
      getAbsoluteMatrixFromSnapshot(snapshot, getTransform, shape),
      center
    );
    expect(centerAfter.x).toBeCloseTo(centerBefore.x);
    expect(centerAfter.y).toBeCloseTo(centerBefore.y);
    expect(getTransform(shape).offset.x).toBeCloseTo(100);
    expect(getTransform(shape).offset.y).toBeCloseTo(0);
  });

  it('keeps a group centre fixed using its descendants union', () => {
    // The draggable group has no hit geometry; its centre comes from the two
    // child shapes. A 50x50 box at (0,0) plus a 50x50 box at (50,50) span
    // (0,0)-(100,100), so the group centre is (50,50).
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
    reg.register({
      parentId: group,
      type: 'shape',
      getConfig: (): NodeConfig => ({ gestureEnabled: true }),
      getHitTestDescriptor: () => boxHitTestDescriptor(0, 0, 50, 50, 0),
    });
    reg.register({
      parentId: group,
      type: 'shape',
      getConfig: (): NodeConfig => ({ gestureEnabled: true }),
      getHitTestDescriptor: () => boxHitTestDescriptor(50, 50, 50, 50, 0),
    });
    const snapshot = reg.getSnapshot();
    const pinch = sharedValue<PinchState | null>(null);
    const { getTransform, callbacks } = makeHarness();

    const center: Vector2d = { x: 50, y: 50 };
    const before = applyTransformsToPoint(
      getAbsoluteMatrixFromSnapshot(snapshot, getTransform, group),
      center
    );

    pinchBegin(snapshot, getTransform, pinch, callbacks, snapshot.rootId, [
      { x: 10, y: 10 },
      { x: 90, y: 90 },
    ]);
    expect(pinch.value?.targetId).toBe(group);
    rotationUpdate(
      snapshot,
      getTransform,
      pinch,
      callbacks,
      Math.PI / 2,
      ROTATION_SENSITIVITY
    );

    const after = applyTransformsToPoint(
      getAbsoluteMatrixFromSnapshot(snapshot, getTransform, group),
      center
    );
    expect(after.x).toBeCloseTo(before.x);
    expect(after.y).toBeCloseTo(before.y);
  });

  it('skips multiTouchEnabled=false nodes, falling through to the one behind', () => {
    // Two overlapping draggable boxes; the top one opts out of multi-touch.
    // Both fingers land on the overlap: a pinch should target the lower box.
    const reg = new NodeRegistry();
    const stage = reg.register({
      parentId: null,
      type: 'stage',
      getConfig: () => ({}),
    });
    const behind = reg.register({
      parentId: stage,
      type: 'shape',
      getConfig: (): NodeConfig => ({ draggable: true }),
      getHitTestDescriptor: () => boxHitTestDescriptor(0, 0, 100, 100, 0),
    });
    const front = reg.register({
      parentId: stage,
      type: 'shape',
      getConfig: (): NodeConfig => ({
        draggable: true,
        multiTouchEnabled: false,
      }),
      getHitTestDescriptor: () => boxHitTestDescriptor(0, 0, 100, 100, 0),
    });
    const snapshot = reg.getSnapshot();
    const pinch = sharedValue<PinchState | null>(null);
    const { getTransform, callbacks } = makeHarness();

    pinchBegin(snapshot, getTransform, pinch, callbacks, snapshot.rootId, [
      { x: 40, y: 40 },
      { x: 60, y: 60 },
    ]);

    expect(pinch.value?.targetId).toBe(behind);
    expect(pinch.value?.targetId).not.toBe(front);
  });

  it('resolves the pinch target from the touch centroid, not every finger', () => {
    const reg = new NodeRegistry();
    const stage = reg.register({
      parentId: null,
      type: 'stage',
      getConfig: () => ({}),
    });
    const box = reg.register({
      parentId: stage,
      type: 'shape',
      getConfig: (): NodeConfig => ({ draggable: true }),
      getHitTestDescriptor: () => boxHitTestDescriptor(0, 0, 100, 100, 0),
    });
    const snapshot = reg.getSnapshot();
    const pinch = sharedValue<PinchState | null>(null);
    const { getTransform, callbacks } = makeHarness();

    // One finger on the box, the other well outside it (beyond the multi-touch
    // slop). Their centroid (50, -25) still lands on the box, so the pinch
    // targets it — where the old "every finger must agree" rule would abort.
    pinchBegin(snapshot, getTransform, pinch, callbacks, snapshot.rootId, [
      { x: 50, y: 50 },
      { x: 50, y: -100 },
    ]);
    expect(pinch.value?.targetId).toBe(box);
  });

  it('is a no-op with fewer than two touches', () => {
    const { snapshot } = buildScene();
    const pinch = sharedValue<PinchState | null>(null);
    const { getTransform, callbacks, scales } = makeHarness();

    pinchBegin(snapshot, getTransform, pinch, callbacks, snapshot.rootId, [
      { x: 50, y: 50 },
    ]);
    pinchUpdate(
      snapshot,
      getTransform,
      pinch,
      callbacks,
      2,
      PINCH_SCALE_SENSITIVITY
    );

    expect(pinch.value?.targetId).toBe(-1);
    expect(scales).toEqual([]);
  });
});
