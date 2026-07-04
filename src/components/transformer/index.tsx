import { Fragment, memo, useCallback, useMemo } from 'react';
import {
  useAnimatedReaction,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import { Rect } from '../shapes/Rect';
import { Circle } from '../shapes/Circle';
import { Group } from '../Group';
import { useRegistry } from '../internal/NodeContext';
import { applyTransformsToPoint } from '../../core/matrix';
import { inflateRect } from '../../core/bounds';
import { anchorLocalPoint } from '../../core/transformer';
import { TransformerBorder } from './TransformerBorder';
import { TransformerHandles } from './TransformerHandles';
import {
  resolveAnchorTransform,
  rotaterAnchorPoint,
  type ActiveAnchorDrag,
  type TransformConstraints,
} from './utils';
import type {
  AnchorId,
  EventObject,
  TransformEventListener,
  TransformResult,
  Vector2d,
} from '../../core/types';
import { ALL_ANCHORS } from './constants';
import { useGetHandleId, useOnTransform, useTransformerTarget } from './hooks';
import { DEG_TO_RAD } from '../../core/transform';

export interface TransformerProps {
  node: string | null;
  enabledAnchors?: AnchorId[];
  keepRatio?: boolean;
  centeredScaling?: boolean;
  padding?: number;
  rotationSnaps?: number[];
  rotationSnapTolerance?: number;
  rotateAnchorOffset?: number;
  ignoreStroke?: boolean;
  anchorFill?: string;
  anchorStroke?: string;
  anchorStrokeWidth?: number;
  anchorSize?: number;
  anchorCornerRadius?: number;
  borderStroke?: string;
  borderStrokeWidth?: number;
  onTransformStart?: TransformEventListener;
  onTransform?: TransformEventListener;
  onTransformEnd?: TransformEventListener;
}

export const Transformer = memo((props: TransformerProps) => {
  const {
    node,
    enabledAnchors = ALL_ANCHORS,
    keepRatio = false,
    centeredScaling = false,
    padding = 0,
    rotationSnaps,
    rotationSnapTolerance = 5,
    rotateAnchorOffset = 50,
    ignoreStroke = false,
    anchorFill = '#ffffff',
    anchorStroke = 'rgb(0, 161, 255)',
    anchorStrokeWidth = 1,
    anchorSize = 10,
    anchorCornerRadius = 0,
    borderStroke = 'rgb(0, 161, 255)',
    borderStrokeWidth = 1,
    onTransformStart,
    onTransform: _onTransform,
    onTransformEnd,
  } = props;

  const registry = useRegistry();
  const getHandleId = useGetHandleId();
  const target = useTransformerTarget(
    registry,
    node,
    ignoreStroke,
    enabledAnchors,
    getHandleId
  );

  const activeAnchorSV = useSharedValue<ActiveAnchorDrag | null>(null);

  const onTransform = useOnTransform(_onTransform);

  const rect = useMemo(
    () => (target ? inflateRect(target.selfRect, padding) : null),
    [target, padding]
  );

  const showRotater = enabledAnchors.indexOf('rotater') !== -1;

  const constraints = useMemo<TransformConstraints>(
    () => ({
      keepRatio,
      centeredScaling,
      rotationSnaps,
      rotationSnapTolerance,
    }),
    [keepRatio, centeredScaling, rotationSnaps, rotationSnapTolerance]
  );

  useAnimatedReaction(
    () => {
      const a = activeAnchorSV.value;
      if (!a || !target) return null;
      const dragOffsetSV = target.anchorDragOffsets[a.anchor];
      return dragOffsetSV ? dragOffsetSV.value : null;
    },
    (offset) => {
      if (!offset || !target) return;
      const { dragOffsetSV, scaleSV, rotationSV } = target;
      const a = activeAnchorSV.value;
      if (!a || !dragOffsetSV || !scaleSV || !rotationSV) return;
      if (a.cfgScaleX === 0 || a.cfgScaleY === 0) return;
      const result = resolveAnchorTransform(
        a,
        { x: a.startPointer.x + offset.x, y: a.startPointer.y + offset.y },
        constraints
      );
      dragOffsetSV.value = { x: result.x - a.cfgX, y: result.y - a.cfgY };
      scaleSV.value = {
        x: result.scaleX / a.cfgScaleX,
        y: result.scaleY / a.cfgScaleY,
      };
      rotationSV.value = result.rotation - a.cfgRotation;
      runOnJS(onTransform)({
        ...result,
        targetId: target.id,
        anchor: a.anchor,
      });
    },
    [target, constraints]
  );

  const handleCenterAnchor = useCallback(
    (h: AnchorId): Vector2d => {
      if (!target || !rect) {
        return {} as Vector2d;
      }
      if (h === 'rotater') {
        const base = applyTransformsToPoint(
          target.matrix,
          anchorLocalPoint(rect, 'top-center')
        );
        return rotaterAnchorPoint(
          base,
          target.config.rotation,
          rotateAnchorOffset
        );
      }
      return applyTransformsToPoint(target.matrix, anchorLocalPoint(rect, h));
    },
    [target, rect, rotateAnchorOffset]
  );

  const onHandleDragStart = useCallback(
    (h: AnchorId) => (e: EventObject) => {
      if (!target || !rect) {
        return;
      }
      e.cancelBubble = true;
      const { config } = target;
      const rotationDeg = config.rotation / DEG_TO_RAD;
      activeAnchorSV.value = {
        anchor: h,
        startPointer: handleCenterAnchor(h),
        rect,
        matrix: target.matrix,
        cfgX: config.x,
        cfgY: config.y,
        cfgScaleX: config.scaleX,
        cfgScaleY: config.scaleY,
        cfgRotation: rotationDeg,
        offsetX: config.offsetX,
        offsetY: config.offsetY,
      };
      onTransformStart?.({
        x: config.x,
        y: config.y,
        scaleX: config.scaleX,
        scaleY: config.scaleY,
        rotation: rotationDeg,
        targetId: target.id,
        anchor: h,
      });
    },
    [activeAnchorSV, target, handleCenterAnchor, onTransformStart, rect]
  );

  const onHandleDragEnd = useCallback(
    (h: AnchorId) => () => {
      if (!target) return;
      const a = activeAnchorSV.value;
      activeAnchorSV.value = null;
      let result: TransformResult = {
        x: target.config.x,
        y: target.config.y,
        scaleX: target.config.scaleX,
        scaleY: target.config.scaleY,
        rotation: target.config.rotation / DEG_TO_RAD,
      };
      const dragOffsetSV = target.anchorDragOffsets[h];
      if (a && dragOffsetSV) {
        const offset = dragOffsetSV.value;
        result = resolveAnchorTransform(
          a,
          { x: a.startPointer.x + offset.x, y: a.startPointer.y + offset.y },
          constraints
        );
      }
      onTransformEnd?.({ ...result, targetId: target.id, anchor: h });
    },
    [activeAnchorSV, target, constraints, onTransformEnd]
  );

  if (!registry || !target || !rect || !target.resolvedTransformSV) return null;

  return (
    <Fragment>
      <Group
        x={target.config.x}
        y={target.config.y}
        rotation={target.config.rotation / DEG_TO_RAD}
        scaleX={target.config.scaleX}
        scaleY={target.config.scaleY}
        skewX={target.config.skewX}
        skewY={target.config.skewY}
        offsetX={target.config.offsetX}
        offsetY={target.config.offsetY}
      >
        <Rect
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          fill="#000000"
          opacity={0}
          hitTargetId={target.id}
        />
      </Group>

      <TransformerBorder
        rect={rect}
        resolvedTransformSV={target.resolvedTransformSV}
        dragOffsetSV={target.dragOffsetSV}
        scaleSV={target.scaleSV}
        rotationSV={target.rotationSV}
        showRotater={showRotater}
        rotateAnchorOffset={rotateAnchorOffset}
        stroke={borderStroke}
        strokeWidth={borderStrokeWidth}
      />
      <TransformerHandles
        rect={rect}
        resolvedTransformSV={target.resolvedTransformSV}
        dragOffsetSV={target.dragOffsetSV}
        scaleSV={target.scaleSV}
        rotationSV={target.rotationSV}
        enabledAnchors={enabledAnchors}
        anchorSize={anchorSize}
        anchorCornerRadius={anchorCornerRadius}
        rotateAnchorOffset={rotateAnchorOffset}
        fill={anchorFill}
        stroke={anchorStroke}
        strokeWidth={anchorStrokeWidth}
      />

      {enabledAnchors.map((anchor) => {
        const c = handleCenterAnchor(anchor);
        if (anchor === 'rotater') {
          return (
            <Circle
              key={anchor}
              id={getHandleId(anchor)}
              x={c.x}
              y={c.y}
              radius={anchorSize / 2}
              fill="transparent"
              hitStrokeWidth={anchorSize * 2}
              draggable={target.rotatable}
              gestureEnabled
              onDragStart={onHandleDragStart(anchor)}
              onDragEnd={onHandleDragEnd(anchor)}
            />
          );
        }
        return (
          <Rect
            key={anchor}
            id={getHandleId(anchor)}
            x={c.x - anchorSize / 2}
            y={c.y - anchorSize / 2}
            width={anchorSize}
            height={anchorSize}
            hitStrokeWidth={anchorSize * 2}
            fill="transparent"
            draggable={target.scalable}
            gestureEnabled
            onDragStart={onHandleDragStart(anchor)}
            onDragEnd={onHandleDragEnd(anchor)}
          />
        );
      })}
    </Fragment>
  );
});
Transformer.displayName = 'Transformer';
