import { describe, it, expect } from '@jest/globals';
import { snapAxis, snapResizeEdge, resolveNodeSnaps } from '../nodeSnaps';
import type { NodeConfig } from '../types';

describe('snapAxis', () => {
  it('returns zero delta when there are no snaps', () => {
    expect(snapAxis(0, 100, 50, undefined, undefined, 5)).toBe(0);
    expect(snapAxis(0, 100, 50, [], [], 5)).toBe(0);
  });

  it('snaps the left edge to edge snaps', () => {
    // left 98 within 5 of 100 -> delta +2
    expect(snapAxis(98, 198, 148, [100], undefined, 5)).toBe(2);
  });

  it('snaps the right edge to edge snaps', () => {
    // right 100 within 5 of 103 -> delta +3
    expect(snapAxis(0, 100, 50, [103], undefined, 5)).toBe(3);
  });

  it('snaps the center to center snaps', () => {
    // center 50 within 5 of 52 -> delta +2
    expect(snapAxis(0, 100, 50, undefined, [52], 5)).toBe(2);
  });

  it('does not snap the center to edge snaps (or vice versa)', () => {
    // center 50 is close to 52, but 52 is only an edge snap here -> no snap
    expect(snapAxis(0, 100, 50, [52], undefined, 5)).toBe(0);
  });

  it('snaps a rotated box using its true bounding edges', () => {
    // left edge -40 within 5 of -42 -> delta -2
    expect(snapAxis(-40, 60, 10, [-42], undefined, 5)).toBe(-2);
  });

  it('picks the closest reference across edge and center snaps', () => {
    // left 100 (dist 3 to edge 103), center 150 (dist 1 to center 151) -> delta +1
    expect(snapAxis(100, 200, 150, [103], [151], 5)).toBe(1);
  });
});

describe('snapResizeEdge', () => {
  it('snaps the dragged edge to edge snaps', () => {
    // edge 148 within 5 of 150 -> 150
    expect(snapResizeEdge(148, 0, true, [150], undefined, 5)).toBe(150);
  });

  it('snaps the center to center snaps by moving the edge twice as far', () => {
    // fixed 0, edge 148 -> center 74, within 5 of 75 -> edge shifts by 2*(75-74)
    expect(snapResizeEdge(148, 0, true, undefined, [75], 5)).toBe(150);
  });

  it('ignores center snaps when the resize is centered', () => {
    expect(snapResizeEdge(148, 0, false, undefined, [75], 5)).toBe(148);
  });
});

describe('resolveNodeSnaps', () => {
  it('picks the snap fields off a config and applies defaults', () => {
    const config: NodeConfig = {
      x: 10,
      draggable: true,
      xEdgeSnaps: [0, 100],
      xCenterSnaps: [50],
      rotationSnaps: [0, 90],
    };
    expect(resolveNodeSnaps(config)).toEqual({
      xEdgeSnaps: [0, 100],
      xCenterSnaps: [50],
      yEdgeSnaps: undefined,
      yCenterSnaps: undefined,
      snapTolerance: 10,
      rotationSnaps: [0, 90],
      rotationSnapTolerance: 5,
    });
  });
});
