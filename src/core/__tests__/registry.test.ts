import { describe, it, expect } from '@jest/globals';
import { NodeRegistry } from '../registry';
import { boxHitTestDescriptor } from '../hitTestDescriptor';
import { getHitNodeIdFromSnapshot, type TransformLookup } from '../snapshot';
import type { NodeConfig, Vector2d } from '../types';
import type { SharedValue } from 'react-native-reanimated';
import { createSharedValue } from '../reanimated';

const NO_LIVE_TRANSFORM: TransformLookup = () => ({
  offset: { x: 0, y: 0 },
  scale: { x: 1, y: 1 },
  rotation: 0,
});

/** Register a shape positioned at (x,y) covering a w×h box from its origin. */
function addShape(
  reg: NodeRegistry,
  parentId: number,
  config: NodeConfig,
  w: number,
  h: number
) {
  const cfg: NodeConfig = { gestureEnabled: true, ...config };
  return reg.register({
    parentId,
    type: 'shape',
    getConfig: () => cfg,
    getHitTestDescriptor: () => boxHitTestDescriptor(0, 0, w, h, 0),
  });
}

function addContainer(
  reg: NodeRegistry,
  parentId: number | null,
  type: 'stage' | 'layer' | 'group',
  config: NodeConfig = {}
) {
  return reg.register({
    parentId,
    type,
    getConfig: () => config,
  });
}

describe('NodeRegistry hit-testing', () => {
  it('returns the front-most overlapping shape (occlusion)', () => {
    const reg = new NodeRegistry();
    const stage = addContainer(reg, null, 'stage');
    const layer = addContainer(reg, stage, 'layer');
    // both cover (0,0)-(100,100); back registered first, front second
    const back = addShape(reg, layer, { x: 0, y: 0 }, 100, 100);
    const front = addShape(reg, layer, { x: 0, y: 0 }, 100, 100);
    expect(reg.getHitNodeId({ x: 50, y: 50 }, stage)).toBe(front);
    expect(back).not.toBe(front);
  });

  it('passes through non-opted shapes to interactive shapes below', () => {
    const reg = new NodeRegistry();
    const stage = addContainer(reg, null, 'stage');
    const layer = addContainer(reg, stage, 'layer');
    const interactive = addShape(reg, layer, { x: 0, y: 0 }, 100, 100);
    // transparent shape on top (no gestureEnabled)
    addShape(reg, layer, { gestureEnabled: false, x: 0, y: 0 }, 100, 100);
    expect(reg.getHitNodeId({ x: 50, y: 50 }, stage)).toBe(interactive);
  });

  it('respects paint order set via setChildIndex (reorder)', () => {
    const reg = new NodeRegistry();
    const stage = addContainer(reg, null, 'stage');
    const layer = addContainer(reg, stage, 'layer');
    const a = addShape(reg, layer, { x: 0, y: 0 }, 100, 100);
    const b = addShape(reg, layer, { x: 0, y: 0 }, 100, 100);
    expect(reg.getHitNodeId({ x: 10, y: 10 }, stage)).toBe(b); // b painted last
    // shuffle: a now painted last (front)
    reg.setChildIndex(a, 1);
    reg.setChildIndex(b, 0);
    expect(reg.getHitNodeId({ x: 10, y: 10 }, stage)).toBe(a);
  });

  it('listening:false prunes the whole subtree', () => {
    const reg = new NodeRegistry();
    const stage = addContainer(reg, null, 'stage');
    const layer = addContainer(reg, stage, 'layer', { listening: false });
    addShape(reg, layer, { x: 0, y: 0 }, 100, 100);
    expect(reg.getHitNodeId({ x: 50, y: 50 }, stage)).toBeNull();
  });

  it('misses when the point is outside every shape', () => {
    const reg = new NodeRegistry();
    const stage = addContainer(reg, null, 'stage');
    const layer = addContainer(reg, stage, 'layer');
    addShape(reg, layer, { x: 0, y: 0 }, 10, 10);
    expect(reg.getHitNodeId({ x: 500, y: 500 }, stage)).toBeNull();
  });

  it('hits a sized, gestureEnabled container on empty gaps; children win', () => {
    const reg = new NodeRegistry();
    const stage = addContainer(reg, null, 'stage');
    const layer = reg.register({
      parentId: stage,
      type: 'layer',
      getConfig: () => ({ gestureEnabled: true }),
      getHitTestDescriptor: () => boxHitTestDescriptor(0, 0, 200, 200, 0),
    });
    const shape = addShape(reg, layer, { x: 0, y: 0 }, 50, 50);
    // Over the child → the child takes priority over its container.
    expect(reg.getHitNodeId({ x: 25, y: 25 }, stage)).toBe(shape);
    // Empty gap inside the layer's box → the layer itself is hit.
    expect(reg.getHitNodeId({ x: 150, y: 150 }, stage)).toBe(layer);
    // Outside the layer's box → nothing.
    expect(reg.getHitNodeId({ x: 500, y: 500 }, stage)).toBeNull();
  });

  it('a sized container without gestureEnabled stays non-interactive', () => {
    const reg = new NodeRegistry();
    const stage = addContainer(reg, null, 'stage');
    const layer = reg.register({
      parentId: stage,
      type: 'layer',
      getConfig: () => ({}),
      getHitTestDescriptor: () => boxHitTestDescriptor(0, 0, 200, 200, 0),
    });
    addShape(reg, layer, { x: 0, y: 0 }, 50, 50);
    expect(reg.getHitNodeId({ x: 150, y: 150 }, stage)).toBeNull();
  });

  it('redirects drag/pinch hits on a hitTargetId proxy but stays transparent to taps', () => {
    const reg = new NodeRegistry();
    const stage = addContainer(reg, null, 'stage');
    const layer = addContainer(reg, stage, 'layer');
    // Bottom: the real target. Middle: an occluding shape. Top: an invisible
    // proxy (like a Transformer grab region) that redirects to the target.
    const target = addShape(reg, layer, { x: 0, y: 0, draggable: true }, 100, 100); // prettier-ignore
    const occluder = addShape(reg, layer, { x: 0, y: 0 }, 100, 100); // on top of target
    addShape(reg, layer, { x: 0, y: 0, hitTargetId: target }, 100, 100); // proxy on top
    const snap = reg.getSnapshot();

    // Drag/pinch (applyHitRedirect=true): the front-most proxy reports the
    // target it stands in for.
    expect(
      getHitNodeIdFromSnapshot(
        snap,
        NO_LIVE_TRANSFORM,
        stage,
        50,
        50,
        false,
        true
      )
    ).toBe(target);
    // Tap (applyHitRedirect=false, the default): the proxy is transparent, so
    // the physical shape under the finger — the occluder — wins.
    expect(
      getHitNodeIdFromSnapshot(snap, NO_LIVE_TRANSFORM, stage, 50, 50)
    ).toBe(occluder);
    expect(reg.getHitNodeId({ x: 50, y: 50 }, stage)).toBe(occluder);
  });

  it('applies accumulated container transforms to local hit-testing', () => {
    const reg = new NodeRegistry();
    const stage = addContainer(reg, null, 'stage');
    const group = addContainer(reg, stage, 'group', { x: 100, y: 100 });
    // shape local box (0,0)-(20,20), shifted to (100,100)-(120,120) on stage
    const shape = addShape(reg, group, { x: 0, y: 0 }, 20, 20);
    expect(reg.getHitNodeId({ x: 110, y: 110 }, stage)).toBe(shape);
    expect(reg.getHitNodeId({ x: 10, y: 10 }, stage)).toBeNull();
  });
});

describe('NodeRegistry tree queries', () => {
  it('builds the ancestor chain shape -> ... -> stage', () => {
    const reg = new NodeRegistry();
    const stage = addContainer(reg, null, 'stage');
    const layer = addContainer(reg, stage, 'layer');
    const group = addContainer(reg, layer, 'group');
    const shape = addShape(reg, group, {}, 10, 10);
    expect(reg.getAncestorChain(shape)).toEqual([shape, group, layer, stage]);
  });

  it('composes absolute matrices through the chain', () => {
    const reg = new NodeRegistry();
    const stage = addContainer(reg, null, 'stage');
    const group = addContainer(reg, stage, 'group', { x: 30, y: 40 });
    const shape = addShape(reg, group, { x: 5, y: 6 }, 10, 10);
    expect(reg.getAbsolutePosition(shape)).toEqual({ x: 35, y: 46 });
  });

  it('finds the nearest draggable ancestor', () => {
    const reg = new NodeRegistry();
    const stage = addContainer(reg, null, 'stage');
    const group = addContainer(reg, stage, 'group', { draggable: true });
    const shape = addShape(reg, group, {}, 10, 10);
    expect(reg.getDragTargetId(shape)).toBe(group);
    const plainStage = addContainer(reg, null, 'stage');
    const plainShape = addShape(reg, plainStage, {}, 10, 10);
    expect(reg.getDragTargetId(plainShape)).toBeNull();
  });
});

describe('NodeRegistry transformer support', () => {
  it('resolves selectors by id (#), name (.), and bare id', () => {
    const reg = new NodeRegistry();
    const stage = addContainer(reg, null, 'stage');
    const layer = addContainer(reg, stage, 'layer');
    const byId = addShape(reg, layer, { id: 'rect1' }, 10, 10);
    const byName = addShape(reg, layer, { name: 'pickme' }, 10, 10);
    expect(reg.findBySelector('#rect1')).toBe(byId);
    expect(reg.findBySelector('rect1')).toBe(byId);
    expect(reg.findBySelector('.pickme')).toBe(byName);
    expect(reg.findBySelector('#missing')).toBeNull();
  });

  it('returns a node self-rect from its descriptor', () => {
    const reg = new NodeRegistry();
    const stage = addContainer(reg, null, 'stage');
    const layer = addContainer(reg, stage, 'layer');
    const shape = addShape(reg, layer, { x: 0, y: 0 }, 40, 30);
    expect(reg.getSelfRect(shape)).toEqual({
      x: 0,
      y: 0,
      width: 40,
      height: 30,
    });
  });

  it('returns a client rect in absolute space through container transforms', () => {
    const reg = new NodeRegistry();
    const stage = addContainer(reg, null, 'stage');
    const group = addContainer(reg, stage, 'group', { x: 100, y: 100 });
    const shape = addShape(reg, group, { x: 0, y: 0 }, 20, 20);
    expect(reg.getClientRect(shape)).toEqual({
      x: 100,
      y: 100,
      width: 20,
      height: 20,
    });
  });

  it('unions child boxes for a container (group) self-rect', () => {
    const reg = new NodeRegistry();
    const stage = addContainer(reg, null, 'stage');
    const group = addContainer(reg, stage, 'group', { x: 0, y: 0 });
    addShape(reg, group, { x: 0, y: 0 }, 20, 20); // (0,0)-(20,20)
    addShape(reg, group, { x: 50, y: 30 }, 10, 40); // (50,30)-(60,70)
    expect(reg.getSelfRect(group)).toEqual({
      x: 0,
      y: 0,
      width: 60,
      height: 70,
    });
  });

  it('exposes a registered drag offset, undefined otherwise', () => {
    const reg = new NodeRegistry();
    const stage = addContainer(reg, null, 'stage');
    const shape = addShape(reg, stage, { x: 0, y: 0 }, 10, 10);
    expect(reg.getDragOffset(shape)).toBeUndefined();
    const offset: SharedValue<Vector2d> = createSharedValue({ x: 0, y: 0 });
    reg.registerDragOffset(shape, offset);
    expect(reg.getDragOffset(shape)).toBe(offset);
  });

  it('exposes the local matrix from config', () => {
    const reg = new NodeRegistry();
    const stage = addContainer(reg, null, 'stage');
    const shape = addShape(reg, stage, { x: 5, y: 7 }, 10, 10);
    const m = reg.getLocalMatrix(shape)!;
    expect(m).not.toBeNull();
    expect(m[4]).toBeCloseTo(5);
    expect(m[5]).toBeCloseTo(7);
  });
});

describe('NodeRegistry live scale channel', () => {
  it('folds a live scale factor into hit-testing', () => {
    const reg = new NodeRegistry();
    const stage = addContainer(reg, null, 'stage');
    const layer = addContainer(reg, stage, 'layer');
    // box (0,0)-(20,20), draggable so it carries live channels
    const shape = addShape(reg, layer, { x: 0, y: 0, draggable: true }, 20, 20);

    const scale: SharedValue<Vector2d> = createSharedValue({ x: 1, y: 1 });
    reg.registerScale(shape, scale);

    // Before scaling: (10,10) hits, (30,30) misses.
    expect(reg.getHitNodeId({ x: 10, y: 10 }, stage)).toBe(shape);
    expect(reg.getHitNodeId({ x: 30, y: 30 }, stage)).toBeNull();

    // Scale x2 live: the box now spans (0,0)-(40,40) for hit-testing.
    scale.value = { x: 2, y: 2 };
    expect(reg.getHitNodeId({ x: 30, y: 30 }, stage)).toBe(shape);
  });
});

describe('NodeRegistry live drag offset', () => {
  it('folds the live drag offset into position, handle, and hit-testing', () => {
    const reg = new NodeRegistry();
    const stage = addContainer(reg, null, 'stage');
    const group = addContainer(reg, stage, 'group', {
      x: 10,
      y: 20,
      draggable: true,
    });
    const shape = addShape(reg, group, { x: 0, y: 0 }, 20, 20);

    const offset: SharedValue<Vector2d> = createSharedValue({ x: 0, y: 0 });
    reg.registerDragOffset(group, offset);

    // Before dragging: group at (10,20), shape box at (10,20)-(30,40).
    expect(reg.getHandle(group).getX()).toBe(10);
    expect(reg.getAbsolutePosition(group)).toEqual({ x: 10, y: 20 });
    expect(reg.getHitNodeId({ x: 15, y: 25 }, stage)).toBe(shape);

    // Drag the group +40 in x: the offset is read live (no re-register needed).
    offset.value = { x: 40, y: 0 };
    expect(reg.getHandle(group).getX()).toBe(50); // config 10 + offset 40
    expect(reg.getHandle(group).getY()).toBe(20);
    expect(reg.getAbsolutePosition(group)).toEqual({ x: 50, y: 20 });
    // Original spot now misses; the shifted spot hits.
    expect(reg.getHitNodeId({ x: 15, y: 25 }, stage)).toBeNull();
    expect(reg.getHitNodeId({ x: 55, y: 25 }, stage)).toBe(shape);
  });
});
