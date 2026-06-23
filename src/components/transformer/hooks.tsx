import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react';
import type { SharedValue } from 'react-native-reanimated';
import type {
  AnchorId,
  TransformEvent,
  TransformEventListener,
  Vector2d,
} from '../../core/types';
import type { NodeRegistry } from '../../core/registry';
import type { Mat } from '../../core/matrix';
import type { Rect } from '../../core/bounds';
import { resolveTransformerCfg, type TransformerCfg } from './utils';

let nextTargetTransformerId = 0;

export const useOnTransform = (
  onTransform: TransformEventListener | undefined
) => {
  const onTransformRef = useRef(onTransform);
  onTransformRef.current = onTransform;
  const handleTransform = useRef((e: TransformEvent) => {
    onTransformRef.current?.(e);
  }).current;

  return handleTransform;
};

export const useGetHandleId = () => {
  const transformerIdRef = useRef(-1);
  if (transformerIdRef.current < 0)
    transformerIdRef.current = nextTargetTransformerId++;
  return useCallback((h: AnchorId) => `${transformerIdRef.current}-${h}`, []);
};

export interface TransformerTarget {
  id: number;
  config: TransformerCfg;
  selfRect: Rect;
  matrix: Mat;
  dragSV?: SharedValue<Vector2d>;
  scaleSV?: SharedValue<Vector2d>;
  rotationSV?: SharedValue<number>;
  anchorDragOffsets: Partial<Record<AnchorId, SharedValue<Vector2d>>>;
}

const UNSET = Symbol('unset');

export function useTransformerTarget(
  registry: NodeRegistry | null,
  selector: string,
  ignoreStroke: boolean,
  enabledAnchors: AnchorId[],
  getHandleId: (h: AnchorId) => string
): TransformerTarget | null {
  const transformerTargetCacheRef = useRef<
    TransformerTarget | null | typeof UNSET
  >(UNSET);
  const transformerTargetKeyRef = useRef<string>('');
  const lastSnapshotRef = useRef<unknown>(UNSET);
  const lastIgnoreStrokeRef = useRef(ignoreStroke);
  const anchorsKey = useMemo(() => enabledAnchors.join(','), [enabledAnchors]);
  const lastAnchorsKeyRef = useRef(anchorsKey);

  const subscribe = useCallback(
    (onChange: () => void) =>
      registry ? registry.subscribeToChanges(onChange) : () => {},
    [registry]
  );

  const getSnapshot = useCallback((): TransformerTarget | null => {
    if (!registry) {
      transformerTargetCacheRef.current = null;
      return null;
    }

    const snapshot = registry.getSnapshot();
    if (
      transformerTargetCacheRef.current !== UNSET &&
      snapshot === lastSnapshotRef.current &&
      ignoreStroke === lastIgnoreStrokeRef.current &&
      anchorsKey === lastAnchorsKeyRef.current
    ) {
      return transformerTargetCacheRef.current;
    }
    lastSnapshotRef.current = snapshot;
    lastIgnoreStrokeRef.current = ignoreStroke;
    lastAnchorsKeyRef.current = anchorsKey;

    const targetId = registry.findBySelector(selector);
    if (targetId == null) {
      transformerTargetCacheRef.current = null;
      return null;
    }
    const config = resolveTransformerCfg(registry.getConfig(targetId));
    const selfRect = registry.getSelfRect(targetId, ignoreStroke);
    const matrix = registry.getLocalMatrix(targetId);
    if (!config || !selfRect || !matrix) {
      transformerTargetCacheRef.current = null;
      return null;
    }

    const dragSV = registry.getDragOffset(targetId);
    const scaleSV = registry.getScale(targetId);
    const rotationSV = registry.getRotation(targetId);

    const anchorDragOffsets: Partial<Record<AnchorId, SharedValue<Vector2d>>> =
      {};
    let handlePart = '';
    for (const h of enabledAnchors) {
      const anchorId = registry.findBySelector('#' + getHandleId(h));
      handlePart += (anchorId ?? '-') + ',';
      if (anchorId == null) continue;
      const dragOffsetSV = registry.getDragOffset(anchorId);
      if (dragOffsetSV) anchorDragOffsets[h] = dragOffsetSV;
    }

    const transformerTargetKey =
      `${targetId};` +
      `${config.x},${config.y},${config.scaleX},${config.scaleY},` +
      `${config.rotation},${config.offsetX},${config.offsetY};` +
      `${selfRect.x},${selfRect.y},${selfRect.width},${selfRect.height};` +
      `${dragSV ? 1 : 0}${scaleSV ? 1 : 0}${rotationSV ? 1 : 0};` +
      handlePart;

    if (
      transformerTargetCacheRef.current !== UNSET &&
      transformerTargetCacheRef.current &&
      transformerTargetKey === transformerTargetKeyRef.current
    ) {
      return transformerTargetCacheRef.current;
    }
    transformerTargetKeyRef.current = transformerTargetKey;
    const transformerTarget: TransformerTarget = {
      id: targetId,
      config,
      selfRect,
      matrix,
      dragSV,
      scaleSV,
      rotationSV,
      anchorDragOffsets,
    };
    transformerTargetCacheRef.current = transformerTarget;
    return transformerTarget;
  }, [
    registry,
    selector,
    ignoreStroke,
    enabledAnchors,
    anchorsKey,
    getHandleId,
  ]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
