import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Path, Skia } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import {
  Stage,
  Layer,
  Rect,
  Portal,
  Transformer,
  useSceneTransform,
  type StageHandle,
  type SceneState,
  type EventObject,
  type TransformEvent,
  type TransformResult,
} from 'react-native-canvas-kit';
import { DrawerButton } from '../src/DrawerButton';

const SCENE_SIZE = 6000;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;

const BASE_SPACING = 32;
const TARGET_SCREEN_SPACING = 24;
const DOT_SCREEN_RADIUS = 1.6;

const STICKY_SIZE = 180;
const STICKY_COLORS = [
  '#FEF3B0',
  '#D5F692',
  '#A6CCF5',
  '#F5A2C0',
  '#FFCE9E',
  '#C7A2F5',
];

interface Sticky {
  id: string;
  x: number;
  y: number;
  color: string;
  text: string;
}

const STICKIES: Sticky[] = [
  {
    id: 's1',
    x: 1720,
    y: 1680,
    color: STICKY_COLORS[0]!,
    text: 'Kickoff ideas',
  },
  { id: 's2', x: 1940, y: 1720, color: STICKY_COLORS[1]!, text: 'Ship v1' },
  {
    id: 's3',
    x: 1700,
    y: 1900,
    color: STICKY_COLORS[2]!,
    text: 'User research',
  },
  {
    id: 's4',
    x: 1930,
    y: 1940,
    color: STICKY_COLORS[3]!,
    text: 'Pinch to zoom',
  },
  { id: 's5', x: 2200, y: 1780, color: STICKY_COLORS[4]!, text: 'Drag to pan' },
  {
    id: 's6',
    x: 2180,
    y: 2010,
    color: STICKY_COLORS[5]!,
    text: 'Tap to select',
  },
  { id: 's7', x: 2460, y: 1860, color: STICKY_COLORS[0]!, text: 'Resize me' },
  { id: 's8', x: 1480, y: 1820, color: STICKY_COLORS[2]!, text: 'Comments' },
];

const sel = (id: string) => `#${id}`;

interface Transform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
}

function buildInitialTransforms(): Record<string, Transform> {
  const out: Record<string, Transform> = {};
  for (const sticky of STICKIES) {
    out[sel(sticky.id)] = {
      x: sticky.x,
      y: sticky.y,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
    };
  }
  return out;
}

const STICKY_CLUSTER = (() => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const sticky of STICKIES) {
    minX = Math.min(minX, sticky.x);
    minY = Math.min(minY, sticky.y);
    maxX = Math.max(maxX, sticky.x + STICKY_SIZE);
    maxY = Math.max(maxY, sticky.y + STICKY_SIZE);
  }
  return {
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
    width: maxX - minX,
    height: maxY - minY,
  };
})();

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

export default function InfiniteScreen() {
  const { width, height } = useWindowDimensions();
  const stageRef = useRef<StageHandle>(null);
  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [transforms, setTransforms] = useState(buildInitialTransforms);

  const fitScale = useMemo(() => {
    const padding = 80;
    const scale = Math.min(
      (width - padding) / STICKY_CLUSTER.width,
      (height - padding) / STICKY_CLUSTER.height
    );
    return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, scale));
  }, [width, height]);

  useEffect(() => {
    stageRef.current?.centerOn(
      STICKY_CLUSTER.centerX,
      STICKY_CLUSTER.centerY,
      fitScale
    );
  }, [fitScale]);

  const commit = (selector: string, t: TransformResult) =>
    setTransforms((prev) => ({
      ...prev,
      [selector]: {
        x: t.x,
        y: t.y,
        scaleX: t.scaleX,
        scaleY: t.scaleY,
        rotation: t.rotation,
      },
    }));

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
        <Layer>
          <Rect
            x={0}
            y={0}
            width={SCENE_SIZE}
            height={SCENE_SIZE}
            fill="#F5F5F4"
            onTap={() => setSelected(null)}
          />
          <DotGrid />

          {STICKIES.map((sticky) => {
            const t = transforms[sel(sticky.id)]!;
            return (
              <Portal
                key={sticky.id}
                id={sticky.id}
                x={t.x}
                y={t.y}
                scaleX={t.scaleX}
                scaleY={t.scaleY}
                rotation={t.rotation}
                width={STICKY_SIZE}
                height={STICKY_SIZE}
                draggable
                scalable
                onTap={(e: EventObject) => {
                  setSelected(sel(sticky.id));
                  e.cancelBubble = true;
                }}
                onTransformEnd={(e: EventObject) =>
                  commit(sel(sticky.id), e.evt as TransformResult)
                }
              >
                <View
                  style={[styles.sticky, { backgroundColor: sticky.color }]}
                >
                  <Text style={styles.stickyText}>{sticky.text}</Text>
                </View>
              </Portal>
            );
          })}

          <Transformer
            node={selected}
            keepRatio
            padding={12}
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
          <Text style={styles.zoomButtonText}>−</Text>
        </Pressable>
        <Pressable
          style={styles.zoomLabel}
          onPress={() =>
            stageRef.current?.centerOn(
              STICKY_CLUSTER.centerX,
              STICKY_CLUSTER.centerY,
              fitScale
            )
          }
        >
          <Text style={styles.zoomLabelText}>{Math.round(zoom * 100)}%</Text>
        </Pressable>
        <Pressable
          style={styles.zoomButton}
          onPress={() => stageRef.current?.zoomIn()}
        >
          <Text style={styles.zoomButtonText}>+</Text>
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
  sticky: {
    flex: 1,
    borderRadius: 4,
    padding: 14,
    justifyContent: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#00000014',
  },
  stickyText: {
    color: '#1f1f1f',
    fontSize: 20,
    fontWeight: '600',
  },
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
