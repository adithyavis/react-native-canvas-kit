import { useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Image as RNImage,
  View,
  useWindowDimensions,
} from 'react-native';
import { Stage, BrushLayer, BRUSH_PATHS } from 'react-native-canvas-kit';
import { DrawerButton } from '../src/DrawerButton';
import { TOOLS, type DrawnStroke, type Tool } from '../src/constants';

export default function BrushesScreen() {
  const { width, height } = useWindowDimensions();
  const [tool, setTool] = useState<Tool>(null);
  const [strokes, setStrokes] = useState<DrawnStroke[]>([]);
  const strokeCounter = useRef(0);

  const toggleTool = (next: NonNullable<Tool>) => setTool(next);

  return (
    <View style={styles.root}>
      <Stage width={width} height={height} style={styles.stage}>
        <BrushLayer
          tool={tool}
          onStrokeEnd={({ points, tool: usedTool }) =>
            setStrokes((prev) => [
              ...prev,
              {
                id: `stroke-${strokeCounter.current++}`,
                points,
                tool: usedTool,
              },
            ])
          }
        >
          {strokes.map((s) => {
            const Brush = BRUSH_PATHS[s.tool];
            return <Brush key={s.id} points={s.points} />;
          })}
        </BrushLayer>
      </Stage>

      <View style={styles.toolbar} pointerEvents="box-none">
        {TOOLS.map(({ tool: t, icon }) => (
          <Pressable
            key={t}
            onPress={() => toggleTool(t)}
            style={[styles.fab, tool === t && styles.fabActive]}
          >
            <RNImage
              source={icon}
              style={styles.fabIcon}
              resizeMode="contain"
            />
          </Pressable>
        ))}
      </View>

      <DrawerButton />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  stage: { backgroundColor: '#f1d1ff' },
  toolbar: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  fabActive: {
    backgroundColor: '#ffd54a',
  },
  fabIcon: {
    width: 30,
    height: 30,
  },
});
