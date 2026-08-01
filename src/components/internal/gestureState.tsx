import { createContext, useContext } from 'react';
import type { SharedValue } from 'react-native-reanimated';
import type { ActiveGesture, Vector2d } from '../../core/types';
import type { Snapshot, TransformLookup } from '../../core/snapshot';

export interface GestureStateValue {
  snapshotSV: SharedValue<Snapshot>;
  getTransform: TransformLookup;
  activeGestureSV: SharedValue<ActiveGesture | null>;
  sceneOffsetSV: SharedValue<Vector2d>;
  sceneScaleSV: SharedValue<Vector2d>;
  width: number;
  height: number;
}

export const GestureStateContext = createContext<GestureStateValue | null>(
  null
);

export function useGestureState(): GestureStateValue | null {
  return useContext(GestureStateContext);
}

export interface SceneTransform {
  sceneOffsetSV: SharedValue<Vector2d>;
  sceneScaleSV: SharedValue<Vector2d>;
  width: number;
  height: number;
}

export function useSceneTransform(): SceneTransform | null {
  const state = useContext(GestureStateContext);
  if (!state) return null;
  return {
    sceneOffsetSV: state.sceneOffsetSV,
    sceneScaleSV: state.sceneScaleSV,
    width: state.width,
    height: state.height,
  };
}
