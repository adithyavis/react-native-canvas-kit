import type { ComponentType, ReactNode } from 'react';
import { useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Image as RNImage,
  Text as RNText,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  Stage,
  Layer,
  Portal,
  Transformer,
  BrushLayer,
  BRUSH_PATHS,
  Pen,
  Pencil,
  Marker,
  Highlighter,
  type BrushProps,
  type BrushStrokeEvent,
  type EventObject,
  type TransformEvent,
  type TransformResult,
} from 'react-native-canvas-kit';
import { TOOLS, type DrawnStroke, type Tool } from '../../src/scene';

function Toolbar({
  tool,
  setTool,
}: {
  tool: Tool | null;
  setTool: (next: Tool) => void;
}) {
  return (
    <View style={styles.toolbar} pointerEvents="box-none">
      {TOOLS.map(({ tool: candidate, icon }) => (
        <Pressable
          key={candidate}
          onPress={() => setTool(candidate)}
          style={[styles.fab, tool === candidate && styles.fabActive]}
        >
          <RNImage source={icon} style={styles.fabIcon} resizeMode="contain" />
        </Pressable>
      ))}
    </View>
  );
}

function BrushCanvas({
  tool,
  setTool,
  onStrokeEnd,
  children,
  overlay,
}: {
  tool: Tool | null;
  setTool?: (next: Tool) => void;
  onStrokeEnd?: (stroke: BrushStrokeEvent) => void;
  children?: ReactNode;
  overlay?: ReactNode;
}) {
  const { width, height } = useWindowDimensions();
  return (
    <View style={styles.root}>
      <Stage width={width} height={height} style={styles.stage}>
        <BrushLayer tool={tool} onStrokeEnd={onStrokeEnd}>
          {children}
        </BrushLayer>
      </Stage>
      {setTool ? <Toolbar tool={tool} setTool={setTool} /> : null}
      {overlay}
    </View>
  );
}

function useStrokes(initial: DrawnStroke[] = []) {
  const [strokes, setStrokes] = useState<DrawnStroke[]>(initial);
  const counter = useRef(initial.length);
  const addStroke = (stroke: BrushStrokeEvent) =>
    setStrokes((prev) => [
      ...prev,
      {
        id: `stroke-${counter.current++}`,
        points: stroke.points,
        tool: stroke.tool,
      },
    ]);
  return { strokes, addStroke };
}

function CommittedStrokes({ strokes }: { strokes: DrawnStroke[] }) {
  return (
    <>
      {strokes.map((stroke) => {
        const Brush = BRUSH_PATHS[stroke.tool];
        return <Brush key={stroke.id} points={stroke.points} />;
      })}
    </>
  );
}

const sampleLine = (y: number): number[] => [
  150,
  y,
  250,
  y - 16,
  350,
  y + 10,
  450,
  y - 8,
];

function StrokeEventDemo() {
  const [tool, setTool] = useState<Tool>('pen');
  const [last, setLast] = useState<BrushStrokeEvent | null>(null);
  const { strokes, addStroke } = useStrokes();
  return (
    <BrushCanvas
      tool={tool}
      setTool={setTool}
      onStrokeEnd={(stroke) => {
        setLast(stroke);
        addStroke(stroke);
      }}
      overlay={
        <View style={styles.badge} pointerEvents="none">
          <RNText style={styles.badgeText}>
            {last
              ? `${last.tool} · ${last.points.length / 2} points captured`
              : 'draw a stroke to capture it'}
          </RNText>
        </View>
      }
    >
      <CommittedStrokes strokes={strokes} />
    </BrushCanvas>
  );
}

const PATHS_SEED: DrawnStroke[] = [
  { id: 'seed-pen', points: [150, 80, 240, 50, 330, 90, 420, 55], tool: 'pen' },
  {
    id: 'seed-marker',
    points: [150, 160, 250, 130, 350, 170, 450, 135],
    tool: 'marker',
  },
  { id: 'seed-highlighter', points: [150, 235, 460, 235], tool: 'highlighter' },
];

function CommittedPathsDemo() {
  const { strokes } = useStrokes(PATHS_SEED);
  return (
    <BrushCanvas tool={null}>
      <CommittedStrokes strokes={strokes} />
    </BrushCanvas>
  );
}

function DirectBrushDemo() {
  const { strokes } = useStrokes();
  return (
    <BrushCanvas tool={null}>
      <Highlighter points={[140, 120, 460, 120]} />
      <Pen points={[140, 320, 240, 288, 340, 332, 440, 292]} />
      <CommittedStrokes strokes={strokes} />
    </BrushCanvas>
  );
}

function OverrideBrushDemo() {
  const { strokes } = useStrokes();
  return (
    <BrushCanvas tool={null}>
      <Marker
        points={[150, 100, 250, 70, 350, 110, 450, 76]}
        color="#22d3ee"
        strokeWidth={24}
      />
      <Pencil
        points={[150, 190, 250, 160, 350, 200, 450, 166]}
        opacity={0.6}
        tension={0.2}
      />
      <CommittedStrokes strokes={strokes} />
    </BrushCanvas>
  );
}

const STYLE_SAMPLES: { tool: Tool; y: number }[] = [
  { tool: 'pen', y: 70 },
  { tool: 'pencil', y: 120 },
  { tool: 'marker', y: 175 },
  { tool: 'highlighter', y: 230 },
  { tool: 'tape', y: 290 },
];

function BrushStyleDemo() {
  const [tool, setTool] = useState<Tool>('pen');
  const { strokes, addStroke } = useStrokes();
  return (
    <BrushCanvas tool={tool} setTool={setTool} onStrokeEnd={addStroke}>
      {STYLE_SAMPLES.map(({ tool: sampleTool, y }) => {
        const Brush = BRUSH_PATHS[sampleTool];
        return <Brush key={sampleTool} points={sampleLine(y)} />;
      })}
      <CommittedStrokes strokes={strokes} />
    </BrushCanvas>
  );
}

function MarkerOverrideDemo() {
  const { strokes } = useStrokes();
  return (
    <BrushCanvas tool={null}>
      <Marker points={[150, 110, 250, 80, 350, 120, 450, 84]} />
      <Marker
        points={[150, 200, 250, 170, 350, 210, 450, 174]}
        color="#22d3ee"
        strokeWidth={24}
        opacity={0.8}
        tension={0.7}
      />
      <CommittedStrokes strokes={strokes} />
    </BrushCanvas>
  );
}

function Chalk({ points }: { points: number[] }) {
  return (
    <Pen
      points={points}
      color="#7fffd4"
      strokeWidth={18}
      opacity={0.5}
      tension={0.3}
    />
  );
}

function ChalkDemo() {
  const { strokes } = useStrokes();
  return (
    <BrushCanvas tool={null}>
      <Chalk points={[150, 110, 250, 80, 350, 120, 450, 84]} />
      <Chalk points={[150, 200, 260, 175, 370, 210, 460, 178]} />
      <CommittedStrokes strokes={strokes} />
    </BrushCanvas>
  );
}

const MY_BRUSHES: Record<string, ComponentType<BrushProps>> = {
  ...BRUSH_PATHS,
  chalk: Chalk,
};

interface MappedStroke {
  id: string;
  points: number[];
  tool: string;
}

const MAP_SEED: MappedStroke[] = [
  {
    id: 'chalk-1',
    points: [150, 110, 250, 80, 350, 120, 450, 84],
    tool: 'chalk',
  },
  {
    id: 'pen-1',
    points: [150, 200, 250, 170, 350, 210, 450, 174],
    tool: 'pen',
  },
];

function CustomMapDemo() {
  const [tool, setTool] = useState<Tool>('pen');
  const [strokes, setStrokes] = useState<MappedStroke[]>(MAP_SEED);
  const counter = useRef(MAP_SEED.length);
  return (
    <BrushCanvas
      tool={tool}
      setTool={setTool}
      onStrokeEnd={(stroke) =>
        setStrokes((prev) => [
          ...prev,
          {
            id: `stroke-${counter.current++}`,
            points: stroke.points,
            tool: stroke.tool,
          },
        ])
      }
    >
      {strokes.map((stroke) => {
        const Brush = MY_BRUSHES[stroke.tool];
        return Brush ? <Brush key={stroke.id} points={stroke.points} /> : null;
      })}
    </BrushCanvas>
  );
}

function SketchDemo() {
  const [tool, setTool] = useState<Tool>('pen');
  const { strokes, addStroke } = useStrokes();
  return (
    <BrushCanvas tool={tool} setTool={setTool} onStrokeEnd={addStroke}>
      <CommittedStrokes strokes={strokes} />
    </BrushCanvas>
  );
}

const TYPE_SEED: DrawnStroke[] = [
  { id: 'seed-pen', points: sampleLine(70), tool: 'pen' },
  { id: 'seed-pencil', points: sampleLine(115), tool: 'pencil' },
  { id: 'seed-marker', points: sampleLine(165), tool: 'marker' },
  { id: 'seed-highlighter', points: sampleLine(215), tool: 'highlighter' },
  { id: 'seed-tape', points: sampleLine(265), tool: 'tape' },
];

function BrushTypesDemo() {
  const { strokes } = useStrokes(TYPE_SEED);
  return (
    <BrushCanvas tool={null}>
      <CommittedStrokes strokes={strokes} />
    </BrushCanvas>
  );
}

function PortalBasicDemo() {
  const { width, height } = useWindowDimensions();
  return (
    <View style={styles.root}>
      <Stage width={width} height={height} style={styles.portalStage}>
        <Layer width={width} height={height} gestureEnabled>
          <Portal
            x={Math.round(width / 2) - 90}
            y={Math.round(height / 2) - 30}
            width={180}
            height={60}
            draggable
            pointerEvents="box-none"
          >
            <View style={styles.rnCard} pointerEvents="box-none">
              <View pointerEvents="none">
                <RNText style={styles.rnEmoji}>🖼️</RNText>
              </View>
              <TextInput
                style={styles.rnInput}
                defaultValue="Drag me"
                placeholder="Type…"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </Portal>
        </Layer>
      </Stage>
      <View style={styles.hintWrap} pointerEvents="none">
        <RNText style={styles.hint}>
          A Portal wrapping a react native component
        </RNText>
      </View>
    </View>
  );
}

function PortalFieldDemo() {
  const { width, height } = useWindowDimensions();
  const [selected, setSelected] = useState<string | null>(null);
  const [transform, setTransform] = useState({
    x: Math.round(width / 2) - 115,
    y: Math.round(height / 2) - 32,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
  });
  return (
    <View style={styles.root}>
      <Stage width={width} height={height} style={styles.portalStage}>
        <Layer
          width={width}
          height={height}
          gestureEnabled
          onTap={() => setSelected(null)}
        >
          <Portal
            id="field"
            x={transform.x}
            y={transform.y}
            scaleX={transform.scaleX}
            scaleY={transform.scaleY}
            rotation={transform.rotation}
            width={230}
            height={64}
            draggable
            scalable
            rotatable
            pointerEvents="box-none"
            onTap={(event: EventObject) => {
              setSelected('#field');
              event.cancelBubble = true;
            }}
            onTransformEnd={(event: EventObject) => {
              const result = event.evt as TransformResult;
              setTransform({
                x: result.x,
                y: result.y,
                scaleX: result.scaleX,
                scaleY: result.scaleY,
                rotation: result.rotation,
              });
            }}
          >
            <View style={styles.rnCard} pointerEvents="box-none">
              <View pointerEvents="none">
                <RNText style={styles.rnEmoji}>✍️</RNText>
              </View>
              <TextInput
                style={styles.rnInput}
                defaultValue="Edit me"
                placeholder="Type…"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </Portal>
          <Transformer
            node={selected}
            onTransformEnd={(event: TransformEvent) => {
              if (!selected) return;
              setTransform({
                x: event.x,
                y: event.y,
                scaleX: event.scaleX,
                scaleY: event.scaleY,
                rotation: event.rotation,
              });
            }}
          />
        </Layer>
      </Stage>
      <View style={styles.hintWrap} pointerEvents="none">
        <RNText style={styles.hint}>This is a Portal rendered TextInput</RNText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  stage: { backgroundColor: '#f1d1ff' },
  portalStage: { backgroundColor: '#FBFAFF' },
  toolbar: {
    position: 'absolute',
    bottom: 24,
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
  fabActive: { backgroundColor: '#ffd54a' },
  fabIcon: { width: 30, height: 30 },
  badge: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6D28D9',
    backgroundColor: '#ffffffcc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  hintWrap: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hint: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#6D28D9',
  },
  rnCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#0B1020',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  rnEmoji: { fontSize: 26 },
  rnInput: {
    minWidth: 0,
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 5,
    color: '#E5E7EB',
    fontSize: 16,
    fontWeight: '700',
    paddingVertical: 8,
  },
});

export const brushesPortalDemos: Record<string, ComponentType> = {
  'brushes-overview-1': SketchDemo,
  'brushes-overview-2': StrokeEventDemo,
  'brushes-brush-types-1': BrushTypesDemo,
  'portal-overview-1': PortalBasicDemo,
  'brushes-brush-types-2': CommittedPathsDemo,
  'brushes-brush-types-3': DirectBrushDemo,
  'brushes-brush-types-4': OverrideBrushDemo,
  'brushes-custom-brushes-1': BrushStyleDemo,
  'brushes-custom-brushes-2': MarkerOverrideDemo,
  'brushes-custom-brushes-3': ChalkDemo,
  'brushes-custom-brushes-4': CustomMapDemo,
  'portal-overview-2': PortalFieldDemo,
};
