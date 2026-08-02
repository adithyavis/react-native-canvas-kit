import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text as RNText,
  View,
  useWindowDimensions,
} from 'react-native';
import { Path, Skia, useFont, type SkFont } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import {
  Stage,
  Layer,
  Group,
  Rect,
  Text,
  Transformer,
  useSceneTransform,
  type StageHandle,
  type SceneState,
  type EventObject,
  type TransformEvent,
  type TransformResult,
} from 'react-native-canvas-kit';
import { DrawerButton } from '../src/DrawerButton';
import { FONT_URL } from '../src/constants';

const SCENE_SIZE = 12000;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;

const BASE_SPACING = 32;
const TARGET_SCREEN_SPACING = 24;
const DOT_SCREEN_RADIUS = 1.6;

const NOTE_SIZE = 180;
const NOTE_GAP = 300;
const NOTE_GRID = 24;
const NOTE_COLORS = [
  '#FEF3B0',
  '#D5F692',
  '#A6CCF5',
  '#F5A2C0',
  '#FFCE9E',
  '#C7A2F5',
];
const NOTE_TEXTS = [
  'Idea',
  'To do',
  'Ship it',
  'Research',
  'Design',
  'Review',
  'Later',
  'Bug',
  'Follow up',
  'Draft',
];

interface Note {
  id: string;
  x: number;
  y: number;
  color: string;
  text: string;
}

const NOTES: Note[] = (() => {
  const out: Note[] = [];
  let index = 0;
  for (let gx = 0; gx < NOTE_GRID; gx++) {
    for (let gy = 0; gy < NOTE_GRID; gy++) {
      out.push({
        id: `n${gx}-${gy}`,
        x: 300 + gx * NOTE_GAP,
        y: 300 + gy * NOTE_GAP,
        color: NOTE_COLORS[index % NOTE_COLORS.length]!,
        text: NOTE_TEXTS[index % NOTE_TEXTS.length]!,
      });
      index++;
    }
  }
  return out;
})();

const NOTE_BY_ID: Record<string, Note> = Object.fromEntries(
  NOTES.map((note) => [note.id, note])
);

const FIELD_CENTER = {
  x: 300 + ((NOTE_GRID - 1) * NOTE_GAP) / 2,
  y: 300 + ((NOTE_GRID - 1) * NOTE_GAP) / 2,
};

interface Transform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
}

type Overrides = Record<string, Transform>;

function noteTransform(id: string, overrides: Overrides): Transform {
  const override = overrides[id];
  if (override) return override;
  const note = NOTE_BY_ID[id]!;
  return { x: note.x, y: note.y, scaleX: 1, scaleY: 1, rotation: 0 };
}

function DotGrid() {
  const scene = useSceneTransform();
  const sceneOffsetSV = scene?.sceneOffsetSV;
  const sceneScaleSV = scene?.sceneScaleSV;
  const viewportWidth = scene?.width ?? 0;
  const viewportHeight = scene?.height ?? 0;

  const gridPath = useDerivedValue(() => {
    const path = Skia.Path.Make();
    if (!sceneOffsetSV || !sceneScaleSV) return path;
    const scale = sceneScaleSV.value.x || 1;
    const offset = sceneOffsetSV.value;

    const left = -offset.x / scale;
    const top = -offset.y / scale;
    const right = (viewportWidth - offset.x) / scale;
    const bottom = (viewportHeight - offset.y) / scale;

    let spacing = BASE_SPACING;
    while (spacing * scale < TARGET_SCREEN_SPACING) spacing *= 2;
    while (spacing * scale >= TARGET_SCREEN_SPACING * 2) spacing /= 2;
    const radius = DOT_SCREEN_RADIUS / scale;

    const startX = Math.floor(left / spacing) * spacing;
    const startY = Math.floor(top / spacing) * spacing;
    for (let x = startX; x <= right; x += spacing) {
      for (let y = startY; y <= bottom; y += spacing) {
        path.addCircle(x, y, radius);
      }
    }
    return path;
  }, [sceneOffsetSV, sceneScaleSV, viewportWidth, viewportHeight]);

  return <Path path={gridPath} color="#0000002e" style="fill" />;
}

interface NotesLayerProps {
  overrides: Overrides;
  selected: string | null;
  font: SkFont | null;
  onSelect: (id: string) => void;
  onCommit: (id: string, t: TransformResult) => void;
}

const NotesLayer = memo(function NotesLayer({
  overrides,
  selected,
  font,
  onSelect,
  onCommit,
}: NotesLayerProps) {
  return (
    <>
      {NOTES.map((note) => {
        const t = noteTransform(note.id, overrides);
        const isSelected = note.id === selected;
        return (
          <Group
            key={note.id}
            id={note.id}
            x={t.x}
            y={t.y}
            scaleX={t.scaleX}
            scaleY={t.scaleY}
            rotation={t.rotation}
            draggable={isSelected}
            scalable={isSelected}
            onTap={(e: EventObject) => {
              onSelect(note.id);
              e.cancelBubble = true;
            }}
            onTransformEnd={(e: EventObject) =>
              onCommit(note.id, e.evt as TransformResult)
            }
          >
            <Rect
              width={NOTE_SIZE}
              height={NOTE_SIZE}
              cornerRadius={6}
              fill={note.color}
              stroke="rgba(0,0,0,0.1)"
              strokeWidth={1}
            />
            <Text x={16} y={20} text={note.text} font={font} fill="#1f1f1f" />
          </Group>
        );
      })}
    </>
  );
});

export default function InfiniteScreen() {
  const { width, height } = useWindowDimensions();
  const stageRef = useRef<StageHandle>(null);
  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Overrides>({});

  const font = useFont(FONT_URL, 20);

  useEffect(() => {
    stageRef.current?.centerOn(FIELD_CENTER.x, FIELD_CENTER.y, 0.7);
  }, []);

  const commit = useCallback((id: string, t: TransformResult) => {
    setOverrides((prev) => ({
      ...prev,
      [id]: {
        x: t.x,
        y: t.y,
        scaleX: t.scaleX,
        scaleY: t.scaleY,
        rotation: t.rotation,
      },
    }));
  }, []);

  return (
    <View style={styles.root}>
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        style={styles.stage}
        infinite
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        onSceneChange={(scene: SceneState) => setZoom(scene.scale)}
      >
        <Layer
          width={SCENE_SIZE}
          height={SCENE_SIZE}
          gestureEnabled
          onTap={() => setSelected(null)}
        >
          <DotGrid />
          <NotesLayer
            overrides={overrides}
            selected={selected}
            font={font}
            onSelect={setSelected}
            onCommit={commit}
          />

          <Transformer
            node={selected ? `#${selected}` : null}
            keepRatio
            padding={8}
            onTransformEnd={(e: TransformEvent) => {
              if (selected) commit(selected, e);
            }}
          />
        </Layer>
      </Stage>

      <View style={styles.zoomBar} pointerEvents="box-none">
        <Pressable
          style={styles.zoomButton}
          onPress={() => stageRef.current?.zoomOut()}
        >
          <RNText style={styles.zoomButtonText}>−</RNText>
        </Pressable>
        <Pressable
          style={styles.zoomLabel}
          onPress={() =>
            stageRef.current?.centerOn(FIELD_CENTER.x, FIELD_CENTER.y, 0.7)
          }
        >
          <RNText style={styles.zoomLabelText}>
            {Math.round(zoom * 100)}%
          </RNText>
        </Pressable>
        <Pressable
          style={styles.zoomButton}
          onPress={() => stageRef.current?.zoomIn()}
        >
          <RNText style={styles.zoomButtonText}>+</RNText>
        </Pressable>
      </View>

      <DrawerButton />
    </View>
  );
}

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.12,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 3 },
  elevation: 4,
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  stage: { backgroundColor: '#F5F5F4' },
  countPill: {
    position: 'absolute',
    top: 52,
    alignSelf: 'center',
    backgroundColor: '#1b0030cc',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  countText: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
  zoomBar: {
    position: 'absolute',
    right: 20,
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 2,
    ...CARD_SHADOW,
  },
  zoomButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomButtonText: { fontSize: 24, color: '#1f1f1f', fontWeight: '500' },
  zoomLabel: {
    minWidth: 58,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomLabelText: { fontSize: 15, color: '#1f1f1f', fontWeight: '600' },
});
