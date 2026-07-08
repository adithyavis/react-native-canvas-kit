import { createContext, useContext } from 'react';
import type { SharedValue } from 'react-native-reanimated';
import type { ActiveGesture } from '../../core/types';
import type { Snapshot, TransformLookup } from '../../core/snapshot';

export interface GestureStateValue {
  snapshotSV: SharedValue<Snapshot>;
  getTransform: TransformLookup;
  activeGestureSV: SharedValue<ActiveGesture | null>;
  width: number;
  height: number;
}

export const GestureStateContext = createContext<GestureStateValue | null>(
  null
);

export function useGestureState(): GestureStateValue | null {
  return useContext(GestureStateContext);
}
