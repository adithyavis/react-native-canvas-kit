import { describe, it, expect } from '@jest/globals';
import {
  resolveAnchorTransform,
  type ActiveAnchorDrag,
  type TransformConstraints,
} from '../../components/transformer/utils';
import { buildAffineMatrixFromConfig } from '../matrix';

const IDENTITY = buildAffineMatrixFromConfig({});

const rightEdgeDrag: ActiveAnchorDrag = {
  anchor: 'middle-right',
  startPointer: { x: 100, y: 50 },
  rect: { x: 0, y: 0, width: 100, height: 100 },
  matrix: IDENTITY,
  cfgX: 0,
  cfgY: 0,
  cfgScaleX: 1,
  cfgScaleY: 1,
  cfgRotation: 0,
  offsetX: 0,
  offsetY: 0,
};

const baseConstraints: TransformConstraints = {
  keepRatio: false,
  centeredScaling: false,
  rotationSnapTolerance: 5,
  bounds: {},
};

describe('resolveAnchorTransform position snapping (resize)', () => {
  it('snaps the dragged edge to an xSnap by adjusting scale', () => {
    // Right edge dragged to x=148; snaps to the guide at 150 -> scaleX 1.5.
    const r = resolveAnchorTransform(
      rightEdgeDrag,
      { x: 148, y: 50 },
      { ...baseConstraints, xEdgeSnaps: [150], snapTolerance: 5 }
    );
    expect(r.scaleX).toBeCloseTo(1.5);
  });

  it('does not snap when the edge is outside the tolerance', () => {
    const r = resolveAnchorTransform(
      rightEdgeDrag,
      { x: 140, y: 50 },
      { ...baseConstraints, xEdgeSnaps: [150], snapTolerance: 5 }
    );
    expect(r.scaleX).toBeCloseTo(1.4);
  });

  it('snaps the center when it is closest to a guide', () => {
    // Left edge fixed at 0; pointer at x=148 -> center=74, within 5 of guide 75.
    // Center snaps to 75, so the right edge lands at 150 -> scaleX 1.5.
    const r = resolveAnchorTransform(
      rightEdgeDrag,
      { x: 148, y: 50 },
      { ...baseConstraints, xCenterSnaps: [75], snapTolerance: 5 }
    );
    expect(r.scaleX).toBeCloseTo(1.5);
  });
});
