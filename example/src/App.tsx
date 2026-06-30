import { useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';
import {
  Stage,
  Layer,
  Group,
  Rect,
  Image,
  Text,
  Transformer,
  useFont,
  type EventObject,
  type TransformEvent,
  type TransformResult,
} from 'react-native-canvas-kit';

configureReanimatedLogger({ level: ReanimatedLogLevel.warn, strict: false });

const FONT_URL =
  'https://cdn.jsdelivr.net/npm/@expo-google-fonts/inter/Inter_700Bold.ttf';

const LABEL = 'react-native-canvas-kit';
const FONT_SIZE = 20;
const PADDING = 10;

const CHIP = '#chip';
const STICKER_SIZE = 76;

interface NodeTransform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
}

interface Sticker {
  id: string;
  src: number;
  fx: number;
  fy: number;
  scale: number;
  rotation: number;
}

const STICKERS: Sticker[] = [
  { id: 'gem', src: require('./assets/stickers/gem.png'), fx: 0.14, fy: 0.08, scale: 1.2, rotation: -14 }, // prettier-ignore
  { id: 'crystal-ball', src: require('./assets/stickers/crystal-ball.png'), fx: 0.42, fy: 0.06, scale: 0.95, rotation: 16 }, // prettier-ignore
  { id: 'star', src: require('./assets/stickers/star.png'), fx: 0.066, fy: 0.1, scale: 0.8, rotation: 8 }, // prettier-ignore
  { id: 'unicorn', src: require('./assets/stickers/unicorn.png'), fx: 0.85, fy: 0.14, scale: 1.3, rotation: -10 }, // prettier-ignore
  { id: 'alien', src: require('./assets/stickers/alien.png'), fx: 0.1, fy: 0.26, scale: 1.1, rotation: 22 }, // prettier-ignore
  { id: 'robot', src: require('./assets/stickers/robot.png'), fx: 0.36, fy: 0.24, scale: 1.0, rotation: -20 }, // prettier-ignore
  { id: 'cat-love', src: require('./assets/stickers/cat-love.png'), fx: 0.6, fy: 0.28, scale: 1.25, rotation: 12 }, // prettier-ignore
  { id: 'rocket', src: require('./assets/stickers/rocket.png'), fx: 0.086, fy: 0.32, scale: 1.1, rotation: 30 }, // prettier-ignore
  { id: 'sparkles', src: require('./assets/stickers/sparkles.png'), fx: 0.16, fy: 0.44, scale: 0.9, rotation: -6 }, // prettier-ignore
  { id: 'ring', src: require('./assets/stickers/ring.png'), fx: 0.42, fy: 0.42, scale: 1.05, rotation: 18 }, // prettier-ignore
  { id: 'crown', src: require('./assets/stickers/crown.png'), fx: 0.66, fy: 0.46, scale: 1.15, rotation: -12 }, // prettier-ignore
  { id: 'fire', src: require('./assets/stickers/fire.png'), fx: 0.87, fy: 0.5, scale: 1.0, rotation: 10 }, // prettier-ignore
  { id: 'rainbow', src: require('./assets/stickers/rainbow.png'), fx: 0.012, fy: 0.62, scale: 1.1, rotation: -18 }, // prettier-ignore
  { id: 'fox', src: require('./assets/stickers/fox.png'), fx: 0.38, fy: 0.6, scale: 1.2, rotation: 14 }, // prettier-ignore
  { id: 'panda', src: require('./assets/stickers/panda.png'), fx: 0.63, fy: 0.64, scale: 1.25, rotation: -8 }, // prettier-ignore
  { id: 'ghost', src: require('./assets/stickers/ghost.png'), fx: 0.85, fy: 0.66, scale: 1.0, rotation: 20 }, // prettier-ignore
  { id: 'dragon', src: require('./assets/stickers/dragon.png'), fx: 0.15, fy: 0.75, scale: 1.3, rotation: -22 }, // prettier-ignore
  { id: 'balloon', src: require('./assets/stickers/balloon.png'), fx: 0.75, fy: 0.19, scale: 1.1, rotation: 24 }, // prettier-ignore
];

const sel = (id: string) => `#${id}`;

function buildInitialTransforms(
  w: number,
  h: number
): Record<string, NodeTransform> {
  const out: Record<string, NodeTransform> = {};
  for (const s of STICKERS) {
    out[sel(s.id)] = {
      x: Math.round(w * s.fx),
      y: Math.round(h * s.fy),
      scaleX: s.scale,
      scaleY: s.scale,
      rotation: s.rotation,
    };
  }
  out[CHIP] = {
    x: Math.round(w * 0.15),
    y: Math.round(h * 0.85),
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
  };
  return out;
}

export default function App() {
  const { width, height } = useWindowDimensions();
  const [selected, setSelected] = useState<string | null>(null);
  const [transforms, setTransforms] = useState(() =>
    buildInitialTransforms(width, height)
  );
  const font = useFont(FONT_URL, FONT_SIZE);

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

  const textWidth = font ? font.measureText(LABEL).width : 0;
  const metrics = font ? font.getMetrics() : null;
  const textHeight = metrics ? metrics.descent - metrics.ascent : FONT_SIZE;
  const chipWidth = textWidth + PADDING * 2;
  const chipHeight = textHeight + PADDING * 2;
  const chip = transforms[CHIP]!;

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.root}>
        <Stage width={width} height={height} style={styles.stage}>
          <Layer>
            {STICKERS.map((s) => {
              const t = transforms[sel(s.id)]!;
              return (
                <Image
                  key={s.id}
                  id={s.id}
                  src={s.src}
                  x={t.x}
                  y={t.y}
                  scaleX={t.scaleX}
                  scaleY={t.scaleY}
                  rotation={t.rotation}
                  width={STICKER_SIZE}
                  height={STICKER_SIZE}
                  gestureEnabled
                  draggable
                  onTap={() => setSelected(sel(s.id))}
                  onTransformEnd={(e: EventObject) =>
                    commit(sel(s.id), e.evt as TransformResult)
                  }
                />
              );
            })}

            {font && (
              <Group
                id="chip"
                x={chip.x}
                y={chip.y}
                scaleX={chip.scaleX}
                scaleY={chip.scaleY}
                rotation={chip.rotation}
                draggable
                onTap={() => setSelected(CHIP)}
                onTransformEnd={(e: EventObject) =>
                  commit(CHIP, e.evt as TransformResult)
                }
              >
                <Rect
                  x={0}
                  y={0}
                  width={chipWidth}
                  height={chipHeight}
                  cornerRadius={10}
                  fill="#1b0030"
                  gestureEnabled
                />
                <Text
                  text={LABEL}
                  x={PADDING}
                  y={PADDING}
                  font={font}
                  fill="#ffffff"
                />
              </Group>
            )}

            <Transformer
              node={selected}
              onTransformEnd={(e: TransformEvent) => {
                if (selected) commit(selected, e);
              }}
            />
          </Layer>
        </Stage>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  stage: {
    backgroundColor: '#a441e1',
  },
});
