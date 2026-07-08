import { memo, useCallback } from 'react';
import { Path, Skia, DashPathEffect } from '@shopify/react-native-skia';
import {
  useAnimatedReaction,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import { applyTransformsToPoint } from '../core/matrix';
import { getAbsoluteMatrixFromSnapshot } from '../core/snapshot';
import { getHitTestDescriptorRect } from '../core/hitTestDescriptor';
import { DEG_TO_RAD, RAD_TO_DEG } from '../core/transform';
import { DEFAULT_SNAP_TOLERANCE } from '../core/nodeSnaps';
import { useGestureState } from './internal/gestureState';

export interface SnapGridProps {
  stroke?: string;
  strokeWidth?: number;
  dash?: number[];
  opacity?: number;
  tolerance?: number;
  rotationTolerance?: number;
}

export const SnapGrid = memo(
  ({
    stroke = 'rgb(255, 25, 0)',
    strokeWidth = 1,
    dash,
    opacity = 1,
    tolerance = 10,
    rotationTolerance = 5,
  }: SnapGridProps) => {
    const gestureState = useGestureState();
    const snapshotSV = gestureState?.snapshotSV;
    const getTransform = gestureState?.getTransform;
    const activeGestureSV = gestureState?.activeGestureSV;
    const width = gestureState?.width ?? 0;
    const height = gestureState?.height ?? 0;

    const nodeWithActiveGestureSV = useDerivedValue(() => {
      return activeGestureSV?.value ?? null;
    });

    const frameTickSV = useSharedValue(0);
    const frameCallback = useFrameCallback(() => {
      'worklet';
      frameTickSV.value = frameTickSV.value + 1;
    }, false);

    const setFrameActive = useCallback(
      (active: boolean) => frameCallback.setActive(active),
      [frameCallback]
    );
    useAnimatedReaction(
      () => nodeWithActiveGestureSV.value != null,
      (isActive, wasActive) => {
        if (isActive === wasActive) return;
        runOnJS(setFrameActive)(isActive);
      }
    );

    const gridPath = useDerivedValue(() => {
      const tick = frameTickSV.value;
      const path = Skia.Path.Make();
      const active = nodeWithActiveGestureSV.value;
      if (!active || tick < 0 || !snapshotSV || !getTransform) return path;
      const snapshot = snapshotSV.value;
      const node = snapshot.nodes[active.nodeId];
      if (!node || !node.hitTestDescriptor) return path;
      const snaps = node.snaps;

      const absMatrix = getAbsoluteMatrixFromSnapshot(
        snapshot,
        getTransform,
        active.nodeId
      );
      const rect = getHitTestDescriptorRect(node.hitTestDescriptor);
      const c1 = applyTransformsToPoint(absMatrix, { x: rect.x, y: rect.y });
      const c2 = applyTransformsToPoint(absMatrix, {
        x: rect.x + rect.width,
        y: rect.y,
      });
      const c3 = applyTransformsToPoint(absMatrix, {
        x: rect.x,
        y: rect.y + rect.height,
      });
      const c4 = applyTransformsToPoint(absMatrix, {
        x: rect.x + rect.width,
        y: rect.y + rect.height,
      });
      const left = Math.min(c1.x, c2.x, c3.x, c4.x);
      const right = Math.max(c1.x, c2.x, c3.x, c4.x);
      const top = Math.min(c1.y, c2.y, c3.y, c4.y);
      const bottom = Math.max(c1.y, c2.y, c3.y, c4.y);
      const centerX = (left + right) / 2;
      const centerY = (top + bottom) / 2;

      if (active.canShowDragGridLines || active.canShowScalingGridLines) {
        const posTolerance =
          (snaps.snapTolerance ?? DEFAULT_SNAP_TOLERANCE) + tolerance;
        const xe = snaps.xEdgeSnaps;
        if (xe) {
          for (let i = 0; i < xe.length; i++) {
            const s = xe[i]!;
            if (
              Math.abs(left - s) <= posTolerance ||
              Math.abs(right - s) <= posTolerance
            ) {
              path.moveTo(s, 0);
              path.lineTo(s, height);
            }
          }
        }
        const xc = snaps.xCenterSnaps;
        if (xc) {
          for (let i = 0; i < xc.length; i++) {
            const s = xc[i]!;
            if (Math.abs(centerX - s) <= posTolerance) {
              path.moveTo(s, 0);
              path.lineTo(s, height);
            }
          }
        }
        const ye = snaps.yEdgeSnaps;
        if (ye) {
          for (let i = 0; i < ye.length; i++) {
            const s = ye[i]!;
            if (
              Math.abs(top - s) <= posTolerance ||
              Math.abs(bottom - s) <= posTolerance
            ) {
              path.moveTo(0, s);
              path.lineTo(width, s);
            }
          }
        }
        const yc = snaps.yCenterSnaps;
        if (yc) {
          for (let i = 0; i < yc.length; i++) {
            const s = yc[i]!;
            if (Math.abs(centerY - s) <= posTolerance) {
              path.moveTo(0, s);
              path.lineTo(width, s);
            }
          }
        }
      }

      if (active.canShowRotationGridLines && snaps.rotationSnaps) {
        const live = getTransform(active.nodeId);
        const rotationDeg =
          node.transform.rotation * RAD_TO_DEG + live.rotation;
        const rotTolerance =
          (snaps.rotationSnapTolerance ?? 5) + rotationTolerance;
        const normalized = ((rotationDeg % 360) + 360) % 360;
        const length = (width + height) * 2;
        for (let i = 0; i < snaps.rotationSnaps.length; i++) {
          const angle = ((snaps.rotationSnaps[i]! % 360) + 360) % 360;
          let diff = Math.abs(normalized - angle);
          diff = Math.min(diff, 360 - diff);
          if (diff <= rotTolerance) {
            const rad = snaps.rotationSnaps[i]! * DEG_TO_RAD;
            const dx = Math.cos(rad) * length;
            const dy = Math.sin(rad) * length;
            path.moveTo(centerX - dx, centerY - dy);
            path.lineTo(centerX + dx, centerY + dy);
          }
        }
      }

      return path;
    });

    if (!gestureState) return null;

    return (
      <Path
        path={gridPath}
        style="stroke"
        color={stroke}
        strokeWidth={strokeWidth}
        opacity={opacity}
      >
        {dash ? <DashPathEffect intervals={dash} /> : null}
      </Path>
    );
  }
);
SnapGrid.displayName = 'SnapGrid';
