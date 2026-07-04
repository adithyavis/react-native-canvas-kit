import { useCallback, useId, useRef, useSyncExternalStore } from 'react';
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
import { resolveTransform, type ResolvedTransform } from '../../core/transform';

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
  const transformerId = useId();
  return useCallback((h: AnchorId) => `${transformerId}-${h}`, [transformerId]);
};

export interface TransformerTarget {
  id: number;
  config: ResolvedTransform;
  scalable: boolean;
  rotatable: boolean;
  selfRect: Rect;
  matrix: Mat;
  dragOffsetSV?: SharedValue<Vector2d>;
  scaleSV?: SharedValue<Vector2d>;
  rotationSV?: SharedValue<number>;
  resolvedTransformSV?: SharedValue<ResolvedTransform>;
  anchorDragOffsets: Partial<Record<AnchorId, SharedValue<Vector2d>>>;
}

export function useTransformerTarget(
  registry: NodeRegistry | null,
  selector: string | null,
  ignoreStroke: boolean,
  enabledAnchors: AnchorId[],
  getHandleId: (h: AnchorId) => string
): TransformerTarget | null {
  const transformerTargetCacheRef = useRef<TransformerTarget | null>(null);
  const transformerTargetKeyRef = useRef<string | null>(null);

  const subscribe = useCallback(
    (onChange: () => void) =>
      registry ? registry.subscribeToChanges(onChange) : () => {},
    [registry]
  );

  const getSnapshot = useCallback((): TransformerTarget | null => {
    if (!registry || !selector) {
      transformerTargetCacheRef.current = null;
      transformerTargetKeyRef.current = null;
      return null;
    }
    const targetId = registry.findBySelector(selector);
    const rawConfig =
      targetId != null ? registry.getConfig(targetId) : undefined;
    const config = rawConfig ? resolveTransform(rawConfig) : null;
    const scalable = rawConfig?.scalable === true;
    const rotatable = rawConfig?.rotatable === true;
    const selfRect =
      targetId != null ? registry.getSelfRect(targetId, ignoreStroke) : null;
    const matrix = targetId != null ? registry.getLocalMatrix(targetId) : null;
    if (targetId == null || !config || !selfRect || !matrix) {
      transformerTargetCacheRef.current = null;
      transformerTargetKeyRef.current = null;
      return null;
    }

    const dragOffsetSV = registry.getDragOffset(targetId);
    const scaleSV = registry.getScale(targetId);
    const rotationSV = registry.getRotation(targetId);
    const resolvedTransformSV = registry.getResolvedTransform(targetId);

    const anchorDragOffsets: Partial<Record<AnchorId, SharedValue<Vector2d>>> =
      {};
    let handlePart = '';
    for (const h of enabledAnchors) {
      const anchorId = registry.findBySelector('#' + getHandleId(h));
      handlePart += (anchorId ?? '-') + ',';
      if (anchorId == null) continue;
      const anchorDragOffsetSV = registry.getDragOffset(anchorId);
      if (anchorDragOffsetSV) anchorDragOffsets[h] = anchorDragOffsetSV;
    }

    const transformerTargetKey =
      `${targetId};` +
      `${scalable ? 1 : 0}${rotatable ? 1 : 0};` +
      `${config.x},${config.y},${config.scaleX},${config.scaleY},` +
      `${config.rotation},${config.offsetX},${config.offsetY};` +
      `${selfRect.x},${selfRect.y},${selfRect.width},${selfRect.height};` +
      `${dragOffsetSV ? 1 : 0}${scaleSV ? 1 : 0}${rotationSV ? 1 : 0}` +
      `${resolvedTransformSV ? 1 : 0};` +
      handlePart;

    if (
      transformerTargetCacheRef.current &&
      transformerTargetKey === transformerTargetKeyRef.current
    ) {
      return transformerTargetCacheRef.current;
    }
    transformerTargetKeyRef.current = transformerTargetKey;
    const transformerTarget: TransformerTarget = {
      id: targetId,
      config,
      scalable,
      rotatable,
      selfRect,
      matrix,
      dragOffsetSV,
      scaleSV,
      rotationSV,
      resolvedTransformSV,
      anchorDragOffsets,
    };
    transformerTargetCacheRef.current = transformerTarget;
    return transformerTarget;
  }, [registry, selector, ignoreStroke, enabledAnchors, getHandleId]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
