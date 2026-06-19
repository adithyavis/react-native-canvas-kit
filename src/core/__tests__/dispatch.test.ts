import { describe, it, expect, jest } from '@jest/globals';
import { NodeRegistry } from '../registry';
import { dispatch, GestureController, type DragHost } from '../dispatch';
import { buildAffineMatrixFromConfig } from '../matrix';
import type { EventObject, NodeConfig, Vector2d } from '../types';

function shape(
  reg: NodeRegistry,
  parentId: number,
  config: NodeConfig,
  w = 100,
  h = 100
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

function container(
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

const noHost: DragHost = { setDragOffset: () => {} };

describe('dispatch bubbling', () => {
  it('bubbles shape -> group -> layer -> stage', () => {
    const reg = new NodeRegistry();
    const log: string[] = [];
    const stage = container(reg, null, 'stage', {
      onClick: () => log.push('stage'),
    });
    const layer = container(reg, stage, 'layer', {
      onClick: () => log.push('layer'),
    });
    const group = container(reg, layer, 'group', {
      onClick: () => log.push('group'),
    });
    const sh = shape(reg, group, { onClick: () => log.push('shape') });
    dispatch(reg, 'click', sh, {});
    expect(log).toEqual(['shape', 'group', 'layer', 'stage']);
  });

  it('stops at cancelBubble', () => {
    const reg = new NodeRegistry();
    const log: string[] = [];
    const stage = container(reg, null, 'stage', {
      onClick: () => log.push('stage'),
    });
    const group = container(reg, stage, 'group', {
      onClick: (e: EventObject) => {
        log.push('group');
        e.cancelBubble = true;
      },
    });
    const sh = shape(reg, group, { onClick: () => log.push('shape') });
    dispatch(reg, 'click', sh, {});
    expect(log).toEqual(['shape', 'group']);
  });

  it('keeps target constant while currentTarget advances', () => {
    const reg = new NodeRegistry();
    const seen: Array<[number, number]> = [];
    const stage = container(reg, null, 'stage', {
      onClick: (e: EventObject) => seen.push([e.target.id, e.currentTarget.id]),
    });
    const sh = shape(reg, stage, {
      onClick: (e: EventObject) => seen.push([e.target.id, e.currentTarget.id]),
    });
    dispatch(reg, 'click', sh, {});
    expect(seen).toEqual([
      [sh, sh],
      [sh, stage],
    ]);
  });
});

describe('GestureController tap synthesis', () => {
  it('fires click+tap on a clean down/up on the same shape', () => {
    const reg = new NodeRegistry();
    const log: string[] = [];
    const stage = container(reg, null, 'stage');
    const sh = shape(reg, stage, {
      onClick: () => log.push('click'),
      onTap: () => log.push('tap'),
    });
    const ctl = new GestureController(reg, stage, noHost);
    ctl.pointerDown({ x: 10, y: 10 }, {}, 0);
    ctl.pointerUp({ x: 11, y: 11 }, {}, 50);
    expect(log).toEqual(['click', 'tap']);
    expect(sh).toBeGreaterThan(0);
  });

  it('suppresses tap when travel exceeds the slop', () => {
    const reg = new NodeRegistry();
    const log: string[] = [];
    const stage = container(reg, null, 'stage');
    shape(reg, stage, { onTap: () => log.push('tap') });
    const ctl = new GestureController(reg, stage, noHost);
    ctl.pointerDown({ x: 10, y: 10 }, {}, 0);
    ctl.pointerUp({ x: 90, y: 90 }, {}, 50);
    expect(log).toEqual([]);
  });

  it('fires dbltap on a second tap within the window', () => {
    const reg = new NodeRegistry();
    const log: string[] = [];
    const stage = container(reg, null, 'stage');
    shape(reg, stage, {
      onTap: () => log.push('tap'),
      onDblTap: () => log.push('dbltap'),
    });
    const ctl = new GestureController(reg, stage, noHost);
    ctl.pointerDown({ x: 10, y: 10 }, {}, 0);
    ctl.pointerUp({ x: 10, y: 10 }, {}, 20);
    ctl.pointerDown({ x: 10, y: 10 }, {}, 100);
    ctl.pointerUp({ x: 10, y: 10 }, {}, 120);
    expect(log).toEqual(['tap', 'tap', 'dbltap']);
  });
});

describe('GestureController drag', () => {
  it('starts/moves/ends a draggable node and suppresses tap', () => {
    const reg = new NodeRegistry();
    const log: string[] = [];
    const offsets: Array<[number, number]> = [];
    const host: DragHost = {
      setDragOffset: (_id, x, y) => offsets.push([x, y]),
    };
    const stage = container(reg, null, 'stage');
    const group = container(reg, stage, 'group', {
      draggable: true,
      onDragStart: () => log.push('dragstart'),
      onDragMove: () => log.push('dragmove'),
      onDragEnd: () => log.push('dragend'),
    });
    shape(reg, group, { onTap: () => log.push('tap') });
    const ctl = new GestureController(reg, stage, host);
    ctl.pointerDown({ x: 20, y: 20 }, {}, 0);
    ctl.pointerMove({ x: 60, y: 25 }, {}); // beyond 3px threshold
    ctl.pointerUp({ x: 60, y: 25 }, {}, 50);
    expect(log).toEqual(['dragstart', 'dragmove', 'dragend']);
    expect(offsets).toEqual([[40, 5]]); // parent-space delta
  });

  it('does not drag a non-draggable node (fires tap instead)', () => {
    const reg = new NodeRegistry();
    const log: string[] = [];
    const setDragOffset = jest.fn();
    const stage = container(reg, null, 'stage');
    shape(reg, stage, { onTap: () => log.push('tap') });
    const ctl = new GestureController(reg, stage, { setDragOffset });
    ctl.pointerDown({ x: 20, y: 20 }, {}, 0);
    ctl.pointerMove({ x: 22, y: 21 }, {});
    ctl.pointerUp({ x: 22, y: 21 }, {}, 30);
    expect(log).toEqual(['tap']);
    expect(setDragOffset).not.toHaveBeenCalled();
  });

  it('continues a re-drag from the previous drop offset', () => {
    const reg = new NodeRegistry();
    const offsets: Array<[number, number]> = [];
    const host: DragHost = {
      setDragOffset: (_id, x, y) => offsets.push([x, y]),
    };
    const stage = container(reg, null, 'stage');
    const group = container(reg, stage, 'group', { draggable: true });
    shape(reg, group, {});
    const ctl = new GestureController(reg, stage, host);
    // first drag: move +40 in x
    ctl.pointerDown({ x: 20, y: 20 }, {}, 0);
    ctl.pointerMove({ x: 60, y: 20 }, {});
    ctl.pointerUp({ x: 60, y: 20 }, {}, 50);
    // second drag: move +10 more in x; should land at 50, not 10
    ctl.pointerDown({ x: 60, y: 20 }, {}, 100);
    ctl.pointerMove({ x: 70, y: 20 }, {});
    ctl.pointerUp({ x: 70, y: 20 }, {}, 150);
    expect(offsets).toEqual([
      [40, 0],
      [50, 0],
    ]);
  });
});
