import { memo, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Canvas } from '@shopify/react-native-skia';

export interface StageProps {
  width: number;
  height: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

export const Stage = memo(({ width, height, style, children }: StageProps) => {
  return <Canvas style={[{ width, height }, style]}>{children}</Canvas>;
});
Stage.displayName = 'Stage';
