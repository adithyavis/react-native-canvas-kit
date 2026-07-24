import {
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react';
import {
  Image as RNImage,
  Modal,
  Pressable,
  StyleSheet,
  Text as RNText,
  View,
} from 'react-native';
import { Asset } from 'expo-asset';
import {
  Stage,
  Layer,
  Image,
  Text,
  Transformer,
  useFont,
  type EventObject,
  type StageHandle,
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
  const [exportedUri, setExportedUri] = useState<string | null>(null);
  const stageRef = useRef<StageHandle>(null);

  const handleExport = async () => {
    const dataUrl = await stageRef.current?.toDataURL({
      mimeType: 'image/png',
    });
    if (dataUrl) setExportedUri(dataUrl);
  };

  return (
    <>
      <CanvaChrome
        hasSelection={selected !== null}
        onConfirmSelection={() => setSelected(null)}
        onExport={handleExport}
      >
        {({ width, height }) => (
          <CanvaBoard
            key={`${Math.round(width)}x${Math.round(height)}`}
            stageRef={stageRef}
            width={width}
            height={height}
            selected={selected}
            setSelected={setSelected}
            onExport={handleExport}
          />
        )}
      </CanvaChrome>
      <ExportPreview uri={exportedUri} onClose={() => setExportedUri(null)} />
    </>
  );
}

function ExportPreview({
  uri,
  onClose,
}: {
  uri: string | null;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={uri !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.previewBackdrop} onPress={onClose}>
        <View style={styles.previewCard}>
          <RNText style={styles.previewTitle}>Exported image</RNText>
          {uri && (
            <RNImage
              source={{ uri }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          )}
          <RNText style={styles.previewHint}>Tap anywhere to close</RNText>
        </View>
      </Pressable>
    </Modal>
  );
}

interface CanvaBoardProps {
  width: number;
  height: number;
  selected: string | null;
  setSelected: Dispatch<SetStateAction<string | null>>;
  stageRef: RefObject<StageHandle | null>;
  onExport: () => void;
}

function CanvaBoard({
  width,
  height,
  selected,
  setSelected,
  stageRef,
  onExport,
}: CanvaBoardProps) {
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
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        simultaneousGesture={touchGesture}
      >
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
      <Pressable style={styles.exportButton} onPress={onExport} hitSlop={8}>
        <RNText style={styles.exportButtonText}>Export</RNText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  board: { flex: 1 },
  exportButton: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: CANVA_PURPLE,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  exportButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  previewCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  previewTitle: {
    color: '#1b1b1f',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  previewImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#f0f0f3',
  },
  previewHint: {
    color: '#9a9aa2',
    fontSize: 12,
    marginTop: 12,
  },
});
