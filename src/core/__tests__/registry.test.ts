import { describe, it, expect } from '@jest/globals';
import { NodeRegistry } from '../registry';
import { buildAffineMatrixFromConfig } from '../matrix';
import type { NodeConfig, Vector2d } from '../types';

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
    getLocalMatrix: () => buildAffineMatrixFromConfig(cfg),
    hitTest: (p: Vector2d) => p.x >= 0 && p.x <= w && p.y >= 0 && p.y <= h,
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
    getLocalMatrix: () => buildAffineMatrixFromConfig(config),
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
    expect(reg.hitTest({ x: 50, y: 50 }, stage)).toBe(front);
    expect(back).not.toBe(front);
  });

  it('passes through non-opted shapes to interactive shapes below', () => {
    const reg = new NodeRegistry();
    const stage = addContainer(reg, null, 'stage');
    const layer = addContainer(reg, stage, 'layer');
    const interactive = addShape(reg, layer, { x: 0, y: 0 }, 100, 100);
    // transparent shape on top (no gestureEnabled)
    addShape(reg, layer, { gestureEnabled: false, x: 0, y: 0 }, 100, 100);
    expect(reg.hitTest({ x: 50, y: 50 }, stage)).toBe(interactive);
  });

  it('respects paint order set via setChildIndex (reorder)', () => {
    const reg = new NodeRegistry();
    const stage = addContainer(reg, null, 'stage');
    const layer = addContainer(reg, stage, 'layer');
    const a = addShape(reg, layer, { x: 0, y: 0 }, 100, 100);
    const b = addShape(reg, layer, { x: 0, y: 0 }, 100, 100);
    expect(reg.hitTest({ x: 10, y: 10 }, stage)).toBe(b); // b painted last
    // shuffle: a now painted last (front)
    reg.setChildIndex(a, 1);
    reg.setChildIndex(b, 0);
    expect(reg.hitTest({ x: 10, y: 10 }, stage)).toBe(a);
  });

  it('listening:false prunes the whole subtree', () => {
    const reg = new NodeRegistry();
    const stage = addContainer(reg, null, 'stage');
    const layer = addContainer(reg, stage, 'layer', { listening: false });
    addShape(reg, layer, { x: 0, y: 0 }, 100, 100);
    expect(reg.hitTest({ x: 50, y: 50 }, stage)).toBeNull();
  });

  it('misses when the point is outside every shape', () => {
    const reg = new NodeRegistry();
    const stage = addContainer(reg, null, 'stage');
    const layer = addContainer(reg, stage, 'layer');
    addShape(reg, layer, { x: 0, y: 0 }, 10, 10);
    expect(reg.hitTest({ x: 500, y: 500 }, stage)).toBeNull();
  });

  it('applies accumulated container transforms to local hit-testing', () => {
    const reg = new NodeRegistry();
    const stage = addContainer(reg, null, 'stage');
    const group = addContainer(reg, stage, 'group', { x: 100, y: 100 });
    // shape local box (0,0)-(20,20), shifted to (100,100)-(120,120) on stage
    const shape = addShape(reg, group, { x: 0, y: 0 }, 20, 20);
    expect(reg.hitTest({ x: 110, y: 110 }, stage)).toBe(shape);
    expect(reg.hitTest({ x: 10, y: 10 }, stage)).toBeNull();
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
    expect(reg.getDragTarget(shape)).toBe(group);
    const plainStage = addContainer(reg, null, 'stage');
    const plainShape = addShape(reg, plainStage, {}, 10, 10);
    expect(reg.getDragTarget(plainShape)).toBeNull();
  });
});
