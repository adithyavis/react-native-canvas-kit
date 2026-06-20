import { describe, it, expect } from '@jest/globals';
import { NodeRegistry } from '../registry';
import { boxHitTestDescriptor } from '../hitTestDescriptor';
import type { NodeConfig, Vector2d } from '../types';
import type { SharedValue } from 'react-native-reanimated';
import { createSharedValue } from '../reanimated';

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
