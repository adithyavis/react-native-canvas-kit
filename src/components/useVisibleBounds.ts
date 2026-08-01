import {
  useAnimatedReaction,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { useSceneTransform } from './internal/gestureState';

export interface VisibleBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SampledScene {
  offsetX: number;
  offsetY: number;
  scale: number;
}

export function useRenderBounds(margin = 0): SharedValue<VisibleBounds | null> {
  const scene = useSceneTransform();
  const sceneOffsetSV = scene?.sceneOffsetSV;
  const sceneScaleSV = scene?.sceneScaleSV;
  const viewportWidth = scene?.width ?? 0;
  const viewportHeight = scene?.height ?? 0;

  const boundsSV = useSharedValue<VisibleBounds | null>(null);
  const lastSampleSV = useSharedValue<SampledScene | null>(null);

  useAnimatedReaction(
    () => {
      if (!sceneOffsetSV || !sceneScaleSV) return null;
      const offset = sceneOffsetSV.value;
      return {
        offsetX: offset.x,
        offsetY: offset.y,
        scale: sceneScaleSV.value.x || 1,
      };
    },
    (sample) => {
      if (!sample) return;
      const last = lastSampleSV.value;
      const threshold = Math.max(margin * 0.5, 16);
      const movedEnough =
        last == null ||
        Math.abs(sample.offsetX - last.offsetX) > threshold ||
        Math.abs(sample.offsetY - last.offsetY) > threshold ||
        Math.abs(sample.scale / last.scale - 1) > 0.02;
      if (!movedEnough) return;
      lastSampleSV.value = sample;

      const scale = sample.scale;
      const left = (-sample.offsetX - margin) / scale;
      const top = (-sample.offsetY - margin) / scale;
      const right = (viewportWidth - sample.offsetX + margin) / scale;
      const bottom = (viewportHeight - sample.offsetY + margin) / scale;
      boundsSV.value = {
        x: left,
        y: top,
        width: right - left,
        height: bottom - top,
      };
    },
    [sceneOffsetSV, sceneScaleSV, viewportWidth, viewportHeight, margin]
  );

  return boundsSV;
}

export function rectIntersectsBounds(
  x: number,
  y: number,
  width: number,
  height: number,
  bounds: VisibleBounds
): boolean {
  return (
    x < bounds.x + bounds.width &&
    x + width > bounds.x &&
    y < bounds.y + bounds.height &&
    y + height > bounds.y
  );
}
