import { useMemo, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Image as RNImage,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  Canvas,
  Fill,
  Points,
  vec,
  type SkPoint,
} from '@shopify/react-native-skia';
import { Stage, BrushLayer, BRUSH_PATHS } from 'react-native-canvas-kit';
import { DrawerButton } from '../src/DrawerButton';
import { useTouchTracker, TouchRings } from '../src/TouchOverlay';
import { TOOLS, type DrawnStroke, type Tool } from '../src/constants';

const DOT_SPACING = 24;
const DOT_SIZE = 2.5;
const BG_COLOR = '#F7F6F3';
const DOT_COLOR = 'rgba(0,0,0,0.13)';

function DotGrid({ width, height }: { width: number; height: number }) {
  const dots = useMemo<SkPoint[]>(() => {
    const points: SkPoint[] = [];
    for (let x = DOT_SPACING; x < width; x += DOT_SPACING) {
      for (let y = DOT_SPACING; y < height; y += DOT_SPACING) {
        points.push(vec(x, y));
      }
    }
    return points;
  }, [width, height]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Canvas style={styles.flex1}>
        <Fill color={BG_COLOR} />
        <Points
          points={dots}
          mode="points"
          color={DOT_COLOR}
          style="stroke"
          strokeWidth={DOT_SIZE}
          strokeCap="round"
        />
      </Canvas>
    </View>
  );
}

export default function BrushesScreen() {
  const { width, height } = useWindowDimensions();
  const [tool, setTool] = useState<Tool>(TOOLS[0].tool);
  const [strokes, setStrokes] = useState<DrawnStroke[]>([]);
  const strokeCounter = useRef(0);
  const { gesture: touchGesture, touches } = useTouchTracker();

  const toggleTool = (next: NonNullable<Tool>) => setTool(next);

  return (
    <View style={styles.root}>
      <DotGrid width={width} height={height} />
      <Stage
        width={width}
        height={height}
        style={styles.stage}
        simultaneousGesture={touchGesture}
      >
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

      <TouchRings touches={touches} />

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
  flex1: { flex: 1 },
  stage: { backgroundColor: 'transparent' },
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
