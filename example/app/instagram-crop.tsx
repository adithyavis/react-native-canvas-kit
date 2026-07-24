import { useEffect, useRef, useState } from 'react';
import {
  Image as RNImage,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { Asset } from 'expo-asset';
import {
  Stage,
  Layer,
  Image,
  type EventObject,
  type StageHandle,
  type TransformResult,
} from 'react-native-canvas-kit';
import { CROP_PHOTOS } from '../src/cropPhotos';
import { CropOverlay } from '../src/CropOverlay';
import { useTouchTracker, TouchRings } from '../src/TouchOverlay';

const MIN_SCALE = 1;
const MAX_SCALE = 4;

const PAN_MARGIN = 48;
const SCALE_MARGIN = 0.25;
const BOUNCE_DURATION = 280;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

interface CropTransform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
}

const IDENTITY: CropTransform = {
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

function clampToViewport(t: TransformResult, size: number): CropTransform {
  const scaleX = clamp(t.scaleX, MIN_SCALE, MAX_SCALE);
  const scaleY = clamp(t.scaleY, MIN_SCALE, MAX_SCALE);
  const scaledWidth = size * scaleX;
  const scaledHeight = size * scaleY;
  return {
    x: clamp(t.x, size - scaledWidth, 0),
    y: clamp(t.y, size - scaledHeight, 0),
    scaleX,
    scaleY,
    rotation: 0,
  };
}

export default function InstagramCropScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const cropSize = width;
  const radius = width / 2;

  const [selectedId, setSelectedId] = useState(CROP_PHOTOS[0]!.id);
  const [transforms, setTransforms] = useState<Record<string, CropTransform>>(
    {}
  );
  const [croppedUri, setCroppedUri] = useState<string | null>(null);
  const stageRef = useRef<StageHandle>(null);
  const { gesture: touchGesture, touches } = useTouchTracker();

  const handleDone = async () => {
    const dataUrl = await stageRef.current?.toDataURL({
      mimeType: 'image/png',
    });
    if (dataUrl) setCroppedUri(dataUrl);
  };

  const transform = transforms[selectedId] ?? IDENTITY;
  const selected = CROP_PHOTOS.find((p) => p.id === selectedId)!;

  const bounceRef = useRef<number | null>(null);

  const cancelBounce = () => {
    if (bounceRef.current != null) {
      cancelAnimationFrame(bounceRef.current);
      bounceRef.current = null;
    }
  };

  useEffect(() => cancelBounce, [selectedId]);

  const animateBounce = (
    id: string,
    from: CropTransform,
    to: CropTransform
  ) => {
    cancelBounce();
    let startTs: number | null = null;
    const step = (ts: number) => {
      if (startTs == null) startTs = ts;
      const progress = Math.min((ts - startTs) / BOUNCE_DURATION, 1);
      const eased = easeOutCubic(progress);
      const lerp = (a: number, b: number) => a + (b - a) * eased;
      setTransforms((prev) => ({
        ...prev,
        [id]: {
          x: lerp(from.x, to.x),
          y: lerp(from.y, to.y),
          scaleX: lerp(from.scaleX, to.scaleX),
          scaleY: lerp(from.scaleY, to.scaleY),
          rotation: 0,
        },
      }));
      if (progress < 1) {
        bounceRef.current = requestAnimationFrame(step);
      } else {
        bounceRef.current = null;
      }
    };
    bounceRef.current = requestAnimationFrame(step);
  };

  const commit = (id: string, result: TransformResult) => {
    const from: CropTransform = {
      x: result.x,
      y: result.y,
      scaleX: result.scaleX,
      scaleY: result.scaleY,
      rotation: 0,
    };
    const to = clampToViewport(result, cropSize);
    const overshoot =
      Math.abs(from.x - to.x) > 0.5 ||
      Math.abs(from.y - to.y) > 0.5 ||
      Math.abs(from.scaleX - to.scaleX) > 0.001 ||
      Math.abs(from.scaleY - to.scaleY) > 0.001;
    setTransforms((prev) => ({ ...prev, [id]: from }));
    if (overshoot) {
      animateBounce(id, from, to);
    }
  };

  const minX = cropSize * (1 - transform.scaleX) - PAN_MARGIN;
  const minY = cropSize * (1 - transform.scaleY) - PAN_MARGIN;

  const thumbSize = width / 4;

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable
          hitSlop={8}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <Text style={styles.close}>✕</Text>
        </Pressable>
        <Pressable style={styles.title} hitSlop={8}>
          <Text style={styles.titleText}>Recents</Text>
          <Text style={styles.caret}>⌄</Text>
        </Pressable>
        <Pressable hitSlop={8} onPress={handleDone}>
          <Text style={styles.done}>Done</Text>
        </Pressable>
      </View>

      <View style={[styles.cropArea, { height: cropSize }]}>
        <Stage
          key={selectedId}
          ref={stageRef}
          width={cropSize}
          height={cropSize}
          style={styles.stage}
          simultaneousGesture={touchGesture}
        >
          <Layer width={cropSize} height={cropSize} gestureEnabled>
            <Image
              id={selectedId}
              src={Asset.fromModule(selected.src).uri}
              x={transform.x}
              y={transform.y}
              scaleX={transform.scaleX}
              scaleY={transform.scaleY}
              width={cropSize}
              height={cropSize}
              fit="cover"
              draggable
              scalable
              minX={minX}
              maxX={PAN_MARGIN}
              minY={minY}
              maxY={PAN_MARGIN}
              minScaleX={MIN_SCALE - SCALE_MARGIN}
              minScaleY={MIN_SCALE - SCALE_MARGIN}
              maxScaleX={MAX_SCALE + SCALE_MARGIN}
              maxScaleY={MAX_SCALE + SCALE_MARGIN}
              onTransformStart={cancelBounce}
              onTransformEnd={(e: EventObject) =>
                commit(selectedId, e.evt as TransformResult)
              }
            />
          </Layer>
        </Stage>
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <CropOverlay size={cropSize} radius={radius} />
        </View>
        <TouchRings touches={touches} />
      </View>

      <ScrollView
        style={styles.grid}
        contentContainerStyle={styles.gridContent}
      >
        {CROP_PHOTOS.map((photo) => {
          const active = photo.id === selectedId;
          return (
            <Pressable
              key={photo.id}
              onPress={() => setSelectedId(photo.id)}
              style={[styles.thumb, { width: thumbSize, height: thumbSize }]}
            >
              <RNImage source={photo.src} style={styles.thumbImage} />
              {active ? <View style={styles.thumbActive} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>

      <Modal
        visible={croppedUri !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setCroppedUri(null)}
      >
        <Pressable
          style={styles.previewBackdrop}
          onPress={() => setCroppedUri(null)}
        >
          <Text style={styles.previewTitle}>Cropped photo</Text>
          {croppedUri && (
            <RNImage
              source={{ uri: croppedUri }}
              style={[
                styles.previewImage,
                { width: width * 0.6, height: width * 0.6 },
              ]}
              resizeMode="cover"
            />
          )}
          <Text style={styles.previewHint}>Tap anywhere to close</Text>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  close: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '400',
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  caret: {
    color: '#ffffff',
    fontSize: 14,
    marginLeft: 6,
    marginTop: -6,
  },
  done: {
    color: '#3897f0',
    fontSize: 16,
    fontWeight: '600',
  },
  cropArea: {
    width: '100%',
    backgroundColor: '#000000',
  },
  stage: {
    backgroundColor: '#000000',
  },
  grid: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gridContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  thumb: {
    padding: 1,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbActive: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderColor: '#3897f0',
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  previewTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  previewImage: {
    borderRadius: 9999,
    borderWidth: 3,
    borderColor: '#ffffff',
    backgroundColor: '#111111',
  },
  previewHint: {
    color: '#8e8e93',
    fontSize: 12,
    marginTop: 20,
  },
});
