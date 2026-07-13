import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { StyleSheet, View } from 'react-native';
import { Asset } from 'expo-asset';
import {
  Stage,
  Layer,
  Image,
  Text,
  Transformer,
  useFont,
  type EventObject,
  type TransformEvent,
  type TransformResult,
} from 'react-native-canvas-kit';
import { CanvaChrome } from '../src/CanvaChrome';
import { useTouchTracker, TouchRings } from '../src/TouchOverlay';
import { CROP_PHOTOS } from '../src/cropPhotos';
import { FONT_URL, sel, type NodeTransform } from '../src/constants';

const CANVA_PURPLE = '#8B3DFF';
const TITLE_ID = 'title';
const TITLE_TEXT = 'Canva';

const QUADRANTS = [
  { id: 'photo-top-left', src: CROP_PHOTOS[0]!.src, column: 0, row: 0 },
  { id: 'photo-top-right', src: CROP_PHOTOS[1]!.src, column: 1, row: 0 },
  { id: 'photo-bottom-left', src: CROP_PHOTOS[2]!.src, column: 0, row: 1 },
  { id: 'photo-bottom-right', src: CROP_PHOTOS[3]!.src, column: 1, row: 1 },
];

export default function CanvaScreen() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <CanvaChrome
      hasSelection={selected !== null}
      onConfirmSelection={() => setSelected(null)}
    >
      {({ width, height }) => (
        <CanvaBoard
          key={`${Math.round(width)}x${Math.round(height)}`}
          width={width}
          height={height}
          selected={selected}
          setSelected={setSelected}
        />
      )}
    </CanvaChrome>
  );
}

interface CanvaBoardProps {
  width: number;
  height: number;
  selected: string | null;
  setSelected: Dispatch<SetStateAction<string | null>>;
}

function CanvaBoard({ width, height, selected, setSelected }: CanvaBoardProps) {
  const quadrantWidth = width / 2;
  const quadrantHeight = height / 2;
  const font = useFont(FONT_URL, Math.round(width * 0.2));
  const { gesture: touchGesture, touches } = useTouchTracker();

  const [transforms, setTransforms] = useState<Record<string, NodeTransform>>(
    () => {
      const initial: Record<string, NodeTransform> = {};
      for (const quadrant of QUADRANTS) {
        initial[sel(quadrant.id)] = {
          x: quadrant.column * quadrantWidth,
          y: quadrant.row * quadrantHeight,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
        };
      }
      initial[sel(TITLE_ID)] = {
        x: width / 2,
        y: height / 2,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      };
      return initial;
    }
  );

  const commit = (selector: string, result: TransformResult) =>
    setTransforms((prev) => ({
      ...prev,
      [selector]: {
        x: result.x,
        y: result.y,
        scaleX: result.scaleX,
        scaleY: result.scaleY,
        rotation: result.rotation,
      },
    }));

  const titleOffset = useMemo(() => {
    if (!font) return null;
    const glyphWidths = font.getGlyphWidths(font.getGlyphIDs(TITLE_TEXT));
    const textWidth = glyphWidths.reduce((sum, value) => sum + value, 0);
    const metrics = font.getMetrics();
    const textHeight = metrics.descent - metrics.ascent;
    return { x: textWidth / 2, y: textHeight / 2 };
  }, [font]);

  const title = transforms[sel(TITLE_ID)]!;

  return (
    <View style={styles.board}>
      <Stage width={width} height={height} simultaneousGesture={touchGesture}>
        <Layer
          onTap={() => setSelected(null)}
          width={width}
          height={height}
          gestureEnabled
        >
          {QUADRANTS.map((quadrant) => {
            const t = transforms[sel(quadrant.id)]!;
            return (
              <Image
                key={quadrant.id}
                id={quadrant.id}
                src={Asset.fromModule(quadrant.src).uri}
                x={t.x}
                y={t.y}
                scaleX={t.scaleX}
                scaleY={t.scaleY}
                rotation={t.rotation}
                width={quadrantWidth}
                height={quadrantHeight}
                fit="cover"
                draggable
                scalable
                rotatable
                onTap={(e) => {
                  setSelected(sel(quadrant.id));
                  e.cancelBubble = true;
                }}
                onTransformEnd={(e: EventObject) =>
                  commit(sel(quadrant.id), e.evt as TransformResult)
                }
              />
            );
          })}

          {font && titleOffset && (
            <Text
              id={TITLE_ID}
              text={TITLE_TEXT}
              font={font}
              fill="#ffffff"
              stroke={CANVA_PURPLE}
              strokeWidth={8}
              x={title.x}
              y={title.y}
              offsetX={titleOffset.x}
              offsetY={titleOffset.y}
              scaleX={title.scaleX}
              scaleY={title.scaleY}
              rotation={title.rotation}
              draggable
              scalable
              rotatable
              onTap={(e) => {
                setSelected(sel(TITLE_ID));
                e.cancelBubble = true;
              }}
              onTransformEnd={(e: EventObject) =>
                commit(sel(TITLE_ID), e.evt as TransformResult)
              }
            />
          )}

          <Transformer
            node={selected}
            borderStroke={CANVA_PURPLE}
            borderStrokeWidth={2}
            anchorStroke={CANVA_PURPLE}
            anchorStrokeWidth={1.5}
            anchorFill="#ffffff"
            anchorSize={14}
            rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
            onTransformEnd={(e: TransformEvent) => {
              if (selected) commit(selected, e);
            }}
          />
        </Layer>
      </Stage>
      <TouchRings touches={touches} />
    </View>
  );
}

const styles = StyleSheet.create({
  board: { flex: 1 },
});
