import { Fragment, memo, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  useAnimatedReaction,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import { Rect } from '../shapes/Rect';
import { Circle } from '../shapes/Circle';
import { useRegistry } from '../internal/NodeContext';
import { applyTransformsToPoint } from '../../core/matrix';
import { inflateRect } from '../../core/bounds';
import { anchorLocalPoint } from '../../core/transformer';
import { TransformerBorder } from './TransformerBorder';
import { TransformerHandles } from './TransformerHandles';
import {
  DEG_TO_RAD,
  resolveAnchorTransform,
  resolveTransformerCfg,
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
import { useGetHandleId, useOnTransform } from './hooks';

export interface TransformerProps {
  node: string;
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
  const selector = node;
  const targetId =
    registry && selector != null ? registry.findBySelector(selector) : null;

  const targetDragSV =
    registry && targetId != null ? registry.getDragOffset(targetId) : undefined;
  const targetScaleSV =
    registry && targetId != null ? registry.getScale(targetId) : undefined;
  const targetRotationSV =
    registry && targetId != null ? registry.getRotation(targetId) : undefined;

  const activeAnchorSV = useSharedValue<ActiveAnchorDrag | null>(null);

  const getHandleId = useGetHandleId(registry, selector);

  const onTransform = useOnTransform(_onTransform);

  const anchorToDragOffsetMapRef = useRef<
    Record<AnchorId, NonNullable<typeof targetDragSV>>
  >({} as any);

  useEffect(() => {
    if (registry) {
      for (const h of enabledAnchors) {
        const anchorId = registry.findBySelector('#' + getHandleId(h));
        if (anchorId == null) continue;
        const dragOffsetSV = registry.getDragOffset(anchorId);
        if (dragOffsetSV) anchorToDragOffsetMapRef.current[h] = dragOffsetSV;
      }
    }
  }, [enabledAnchors, getHandleId, registry]);

  const config = useMemo(
    () => registry?.getConfig(targetId ?? -1),
    [registry, targetId]
  );
  const selfRect = useMemo(
    () =>
      registry && targetId != null
        ? registry.getSelfRect(targetId, ignoreStroke)
        : null,
    [registry, targetId, ignoreStroke]
  );
  const transformerConfig = useMemo(
    () => resolveTransformerCfg(config),
    [config]
  );

  const rect = useMemo(
    () => (selfRect ? inflateRect(selfRect, padding) : null),
    [selfRect, padding]
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
      if (!a) return null;
      const dragOffsetSV = anchorToDragOffsetMapRef.current[a.anchor];
      return dragOffsetSV ? dragOffsetSV.value : null;
    },
    (offset) => {
      if (!offset) return;
      const a = activeAnchorSV.value;
      if (!a || !targetDragSV || !targetScaleSV || !targetRotationSV) return;
      if (a.cfgScaleX === 0 || a.cfgScaleY === 0) return;
      const result = resolveAnchorTransform(
        a,
        { x: a.startPointer.x + offset.x, y: a.startPointer.y + offset.y },
        constraints
      );
      targetDragSV.value = { x: result.x - a.cfgX, y: result.y - a.cfgY };
      targetScaleSV.value = {
        x: result.scaleX / a.cfgScaleX,
        y: result.scaleY / a.cfgScaleY,
      };
      targetRotationSV.value = result.rotation - a.cfgRotation;
      runOnJS(onTransform)({ ...result, targetId, anchor: a.anchor });
    },
    [
      anchorToDragOffsetMapRef.current,
      targetDragSV,
      targetScaleSV,
      targetRotationSV,
      constraints,
      targetId,
    ]
  );

  const configMatrix = useMemo(() => {
    if (!targetId) return null;
    return registry?.getLocalMatrix(targetId) ?? null;
  }, [registry, targetId]);

  const handleCenterAnchor = useCallback(
    (h: AnchorId): Vector2d => {
      if (
        !configMatrix ||
        !registry ||
        targetId == null ||
        !config ||
        !transformerConfig ||
        !rect
      ) {
        return {} as Vector2d;
      }
      if (h === 'rotater') {
        const base = applyTransformsToPoint(
          configMatrix,
          anchorLocalPoint(rect, 'top-center')
        );
        return rotaterAnchorPoint(
          base,
          transformerConfig.rotation * DEG_TO_RAD,
          rotateAnchorOffset
        );
      }
      return applyTransformsToPoint(configMatrix, anchorLocalPoint(rect, h));
    },
    [
      transformerConfig,
      config,
      configMatrix,
      rect,
      registry,
      rotateAnchorOffset,
      targetId,
    ]
  );

  const onHandleDragStart = useCallback(
    (h: AnchorId) => (e: EventObject) => {
      if (!configMatrix || !transformerConfig || !rect) {
        return;
      }
      e.cancelBubble = true;
      activeAnchorSV.value = {
        anchor: h,
        startPointer: handleCenterAnchor(h),
        rect,
        matrix: configMatrix,
        cfgX: transformerConfig.x,
        cfgY: transformerConfig.y,
        cfgScaleX: transformerConfig.scaleX,
        cfgScaleY: transformerConfig.scaleY,
        cfgRotation: transformerConfig.rotation,
        offsetX: transformerConfig.offsetX,
        offsetY: transformerConfig.offsetY,
      };
      onTransformStart?.({ ...transformerConfig, targetId, anchor: h });
    },
    [
      activeAnchorSV,
      transformerConfig,
      configMatrix,
      handleCenterAnchor,
      onTransformStart,
      rect,
      targetId,
    ]
  );

  const onHandleDragEnd = useCallback(
    (h: AnchorId) => () => {
      const a = activeAnchorSV.value;
      activeAnchorSV.value = null;
      let result = { ...transformerConfig } as TransformResult;
      const dragOffsetSV = anchorToDragOffsetMapRef.current[h];
      if (a && dragOffsetSV) {
        const offset = dragOffsetSV.value;
        result = resolveAnchorTransform(
          a,
          { x: a.startPointer.x + offset.x, y: a.startPointer.y + offset.y },
          constraints
        );
      }
      onTransformEnd?.({ ...result, targetId, anchor: h });
    },
    [activeAnchorSV, transformerConfig, constraints, onTransformEnd, targetId]
  );

  if (
    !configMatrix ||
    !registry ||
    targetId == null ||
    !config ||
    !transformerConfig ||
    !rect
  )
    return null;

  return (
    <Fragment>
      <TransformerBorder
        rect={rect}
        transformerConfig={transformerConfig}
        dragSV={targetDragSV}
        scaleSV={targetScaleSV}
        rotationSV={targetRotationSV}
        showRotater={showRotater}
        rotateAnchorOffset={rotateAnchorOffset}
        stroke={borderStroke}
        strokeWidth={borderStrokeWidth}
      />
      <TransformerHandles
        rect={rect}
        transformerConfig={transformerConfig}
        dragSV={targetDragSV}
        scaleSV={targetScaleSV}
        rotationSV={targetRotationSV}
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
              draggable
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
            fill="transparent"
            draggable
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
