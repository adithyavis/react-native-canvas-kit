import { useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import {
  Stage,
  Layer,
  Image,
  Transformer,
  Portal,
  type EventObject,
  type TransformEvent,
  type TransformResult,
} from 'react-native-canvas-kit';
import { DrawerButton } from '../src/DrawerButton';
import {
  CHIP,
  LABEL,
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
                scalable
                rotatable
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

          <Portal
            x={chip.x}
            y={chip.y}
            scaleX={chip.scaleX}
            scaleY={chip.scaleY}
            rotation={chip.rotation}
            draggable
            scalable
            rotatable
            onTap={(e) => {
              setSelected(CHIP);
              e.cancelBubble = true;
            }}
            onTransformEnd={(e: EventObject) =>
              commit(CHIP, e.evt as TransformResult)
            }
          >
            <View style={styles.chipOuter}>
              <View style={styles.chipInner}>
                <Text numberOfLines={1} style={styles.chipLabel}>
                  {LABEL}
                </Text>
              </View>
            </View>
          </Portal>

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
  chipOuter: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
  },
  chipInner: {
    backgroundColor: '#1b0030',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chipLabel: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
});
