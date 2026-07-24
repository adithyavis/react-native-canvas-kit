import type { ComponentType } from 'react';
import { useRef, useState } from 'react';
import {
  Image as RNImage,
  Pressable,
  StyleSheet,
  Text as RNText,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  Stage,
  Layer,
  Rect,
  Circle,
  Text,
  useFont,
  type StageHandle,
} from 'react-native-canvas-kit';
import { FONT_URL } from '../../src/scene';

function ExportToImage() {
  const { width, height } = useWindowDimensions();
  const font = useFont(FONT_URL, 30);
  const stageRef = useRef<StageHandle>(null);
  const [uri, setUri] = useState<string | null>(null);

  const handleExport = async () => {
    const dataUrl = await stageRef.current?.toDataURL({ mimeType: 'image/png' });
    if (dataUrl) setUri(dataUrl);
  };

  const centerX = width / 2;
  const centerY = height / 2;

  return (
    <View style={styles.root}>
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        style={styles.stage}
      >
        <Layer width={width} height={height} gestureEnabled>
          <Rect
            x={centerX - 130}
            y={centerY - 70}
            width={150}
            height={110}
            cornerRadius={16}
            fill="#8a2be2"
            draggable
          />
          <Circle x={centerX + 70} y={centerY} radius={54} fill="#22d3ee" draggable />
          {font && (
            <Text
              text="Drag, then Export"
              x={centerX - 120}
              y={centerY + 90}
              font={font}
              fill="#1b0030"
            />
          )}
        </Layer>
      </Stage>

      <Pressable style={styles.exportButton} onPress={handleExport} hitSlop={8}>
        <RNText style={styles.exportButtonText}>Export PNG</RNText>
      </Pressable>

      {uri && (
        <View style={styles.preview} pointerEvents="none">
          <RNText style={styles.previewLabel}>Exported image</RNText>
          <RNImage source={{ uri }} style={styles.previewImage} resizeMode="cover" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  stage: { backgroundColor: '#faf7ff' },
  exportButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#8a2be2',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
  },
  exportButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  preview: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5d5ff',
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6D28D9',
    marginBottom: 6,
  },
  previewImage: {
    width: 120,
    height: 90,
    borderRadius: 6,
    backgroundColor: '#faf7ff',
  },
});

export const exportDemos: Record<string, ComponentType> = {
  'export-overview-1': ExportToImage,
};
