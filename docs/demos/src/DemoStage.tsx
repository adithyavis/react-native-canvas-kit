import type { ReactNode } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Stage, Layer, Group } from 'react-native-canvas-kit';

interface DemoStageProps {
  children: ReactNode;
  logicalWidth?: number;
  logicalHeight?: number;
  background?: string;
  gestureEnabled?: boolean;
  onTapEmpty?: () => void;
}

export function DemoStage({
  children,
  logicalWidth = 320,
  logicalHeight = 320,
  background = '#faf7ff',
  gestureEnabled = false,
  onTapEmpty,
}: DemoStageProps) {
  const { width, height } = useWindowDimensions();
  const offsetX = Math.round((width - logicalWidth) / 2);
  const offsetY = Math.round((height - logicalHeight) / 2);

  return (
    <View style={styles.root}>
      <Stage width={width} height={height} style={{ backgroundColor: background }}>
        <Layer
          width={width}
          height={height}
          gestureEnabled={gestureEnabled}
          onTap={onTapEmpty}
        >
          <Group x={offsetX} y={offsetY}>
            {children}
          </Group>
        </Layer>
      </Stage>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
