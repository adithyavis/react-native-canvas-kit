import { useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
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
import { DrawerButton } from '../src/DrawerButton';
import {
  CHIP,
  FONT_SIZE,
  FONT_URL,
  LABEL,
  PADDING,
  STICKER_SIZE,
  STICKERS,
  buildInitialTransforms,
  sel,
} from '../src/constants';

export default function ShapesScreen() {
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
  const chipInnerWidth = textWidth + PADDING * 4;
  const chipInnerHeight = textHeight + PADDING * 4;
  const chipWidth = chipInnerWidth + PADDING;
  const chipHeight = chipInnerHeight + PADDING;
  const chip = transforms[CHIP]!;

  return (
    <View style={styles.root}>
      <Stage width={width} height={height} style={styles.stage}>
        <Layer
          onTap={() => setSelected(null)}
          width={width}
          height={height}
          gestureEnabled
        >
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
                draggable
                onTap={(e) => {
                  setSelected(sel(s.id));
                  e.cancelBubble = true;
                }}
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
              onTap={(e) => {
                setSelected(CHIP);
                e.cancelBubble = true;
              }}
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
                fill="#fff"
              />
              <Rect
                x={0.5 * PADDING}
                y={0.5 * PADDING}
                width={chipInnerWidth}
                height={chipInnerHeight}
                cornerRadius={10}
                fill="#1b0030"
              />
              <Text
                text={LABEL}
                x={2.5 * PADDING}
                y={2.5 * PADDING}
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
      <DrawerButton />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  stage: { backgroundColor: '#e9ffc4' },
});
