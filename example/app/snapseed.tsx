import { useCallback, useMemo, useRef, useState } from 'react';
import {
  type LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { Asset } from 'expo-asset';
import { ColorMatrix } from '@shopify/react-native-skia';
import { Stage, Layer, Image } from 'react-native-canvas-kit';
import { CROP_PHOTOS } from '../src/cropPhotos';
import { useTouchTracker, TouchRings } from '../src/TouchOverlay';
import {
  buildTuneMatrix,
  NEUTRAL_TUNE,
  TOOLS,
  TUNE_PARAMS,
  type TuneValues,
} from '../src/snapseed';

const PHOTO = CROP_PHOTOS[0]!;
const PHOTO_URI = Asset.fromModule(PHOTO.src).uri;

const ROW_HEIGHT = 42;
const HORIZONTAL_RANGE = 0.75;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const fmt = (value: number) => `${value > 0 ? '+' : ''}${Math.round(value)}`;

type Mode = 'home' | 'tune';
type Axis = 'horizontal' | 'vertical' | null;

export default function SnapseedScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [mode, setMode] = useState<Mode>('home');
  const [values, setValues] = useState<TuneValues>({ ...NEUTRAL_TUNE });

  const [paramIndex, setParamIndex] = useState(0);
  const [axis, setAxis] = useState<Axis>(null);
  const [hudVisible, setHudVisible] = useState(false);

  const [canvas, setCanvas] = useState({ width, height: height * 0.6 });
  const { gesture: touchGesture, touches } = useTouchTracker();

  const startValues = useRef<TuneValues>({ ...NEUTRAL_TUNE });
  const startIndex = useRef(0);
  const axisRef = useRef<Axis>(null);

  const matrix = useMemo(() => buildTuneMatrix(values), [values]);
  const activeParam = TUNE_PARAMS[paramIndex]!;

  const onCanvasLayout = useCallback((e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    setCanvas({ width: w, height: h });
  }, []);

  const beginGesture = useCallback(() => {
    startValues.current = { ...values };
    startIndex.current = paramIndex;
    axisRef.current = null;
    setAxis(null);
    setHudVisible(true);
  }, [values, paramIndex]);

  const updateGesture = useCallback(
    (dx: number, dy: number) => {
      if (axisRef.current === null) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        axisRef.current =
          Math.abs(dx) >= Math.abs(dy) ? 'horizontal' : 'vertical';
        setAxis(axisRef.current);
      }
      if (axisRef.current === 'vertical') {
        const delta = Math.round(dy / ROW_HEIGHT);
        const next = clamp(
          startIndex.current + delta,
          0,
          TUNE_PARAMS.length - 1
        );
        setParamIndex(next);
      } else {
        const key = TUNE_PARAMS[startIndex.current]!.key;
        const span = width * HORIZONTAL_RANGE;
        const delta = (dx / span) * 200;
        const next = clamp(
          Math.round(startValues.current[key]! + delta),
          -100,
          100
        );
        setValues((prev) =>
          prev[key] === next ? prev : { ...prev, [key]: next }
        );
      }
    },
    [width]
  );

  const endGesture = useCallback(() => {
    axisRef.current = null;
    setAxis(null);
    setHudVisible(false);
  }, []);

  const tuneGesture = useMemo(
    () =>
      Gesture.Pan()
        .onBegin(() => {
          'worklet';
          runOnJS(beginGesture)();
        })
        .onUpdate((e) => {
          'worklet';
          runOnJS(updateGesture)(e.translationX, e.translationY);
        })
        .onFinalize(() => {
          'worklet';
          runOnJS(endGesture)();
        }),
    [beginGesture, updateGesture, endGesture]
  );

  const resetTune = () => {
    setValues({ ...NEUTRAL_TUNE });
    setParamIndex(0);
  };

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  const hudValue = axis === 'horizontal' ? fmt(values[activeParam.key]!) : '';

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        {mode === 'home' ? (
          <>
            <Pressable hitSlop={10} onPress={openDrawer}>
              <Text style={styles.topIcon}>☰</Text>
            </Pressable>
            <Text style={styles.topTitle}>Snapseed</Text>
            <Pressable hitSlop={10}>
              <Text style={styles.topIcon}>⋮</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable hitSlop={10} onPress={() => setMode('home')}>
              <Text style={styles.topIcon}>✕</Text>
            </Pressable>
            <View style={styles.tuneTitleWrap}>
              <Text style={styles.topTitle}>Tune Image</Text>
            </View>
            <View style={styles.tuneActions}>
              <Pressable hitSlop={10} onPress={resetTune}>
                <Text style={styles.topIcon}>↺</Text>
              </Pressable>
              <Pressable hitSlop={10} onPress={() => setMode('home')}>
                <Text style={[styles.topIcon, styles.check]}>✓</Text>
              </Pressable>
            </View>
          </>
        )}
      </View>

      <View style={styles.canvasArea} onLayout={onCanvasLayout}>
        <Stage
          width={canvas.width}
          height={canvas.height}
          style={styles.stage}
          simultaneousGesture={touchGesture}
        >
          <Layer width={canvas.width} height={canvas.height}>
            <Image
              src={PHOTO_URI}
              x={0}
              y={0}
              width={canvas.width}
              height={canvas.height}
              fit="contain"
            >
              <ColorMatrix matrix={matrix} />
            </Image>
          </Layer>
        </Stage>

        <TouchRings touches={touches} />

        {mode === 'tune' && (
          <GestureDetector gesture={tuneGesture}>
            <View style={StyleSheet.absoluteFill} />
          </GestureDetector>
        )}

        {mode === 'tune' && hudVisible && (
          <View pointerEvents="none" style={styles.hud}>
            <View style={styles.hudPill}>
              <Text style={styles.hudLabel}>{activeParam.label}</Text>
              {axis === 'horizontal' && (
                <Text style={styles.hudValue}>{hudValue}</Text>
              )}
            </View>
            <View style={styles.hudTrack}>
              <View
                style={[
                  styles.hudFill,
                  {
                    width: `${((values[activeParam.key]! + 100) / 200) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>
        )}

        {mode === 'tune' && axis === 'vertical' && (
          <View pointerEvents="none" style={styles.paramMenu}>
            {TUNE_PARAMS.map((param, index) => {
              const active = index === paramIndex;
              return (
                <View
                  key={param.key}
                  style={[styles.paramRow, active && styles.paramRowActive]}
                >
                  <Text
                    style={[styles.paramText, active && styles.paramTextActive]}
                  >
                    {param.label}
                  </Text>
                  <Text
                    style={[styles.paramVal, active && styles.paramTextActive]}
                  >
                    {fmt(values[param.key]!)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {mode === 'tune' && !hudVisible && (
          <View pointerEvents="none" style={styles.gestureHint}>
            <Text style={styles.gestureHintText}>
              Swipe ↕ to pick · Swipe ↔ to adjust
            </Text>
          </View>
        )}
      </View>

      {mode === 'home' && (
        <View style={[styles.bottom, { paddingBottom: insets.bottom + 6 }]}>
          <ScrollView contentContainerStyle={styles.toolsGrid}>
            {TOOLS.map((tool) => {
              const enabled = tool.id === 'tune';
              return (
                <Pressable
                  key={tool.id}
                  style={[styles.toolCell, !enabled && styles.toolCellDisabled]}
                  disabled={!enabled}
                  onPress={() => setMode('tune')}
                >
                  <Text style={styles.toolIcon}>{tool.icon}</Text>
                  <Text style={styles.toolLabel} numberOfLines={2}>
                    {tool.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.tabBar}>
            <View style={styles.tab}>
              <Text style={[styles.tabText, styles.tabDisabled]}>STYLES</Text>
            </View>
            <View style={styles.tab}>
              <Text style={[styles.tabText, styles.tabActive]}>TOOLS</Text>
            </View>
            <View style={styles.tab}>
              <Text style={[styles.tabText, styles.tabDisabled]}>EXPORT</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const ACCENT = '#4c9bd6';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#111111' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 12,
    backgroundColor: '#1c1c1c',
  },
  topIcon: { color: '#e6e6e6', fontSize: 22, fontWeight: '400' },
  check: { color: ACCENT, fontSize: 24 },
  topTitle: { color: '#f2f2f2', fontSize: 17, fontWeight: '600' },
  tuneTitleWrap: { flex: 1, alignItems: 'center' },
  tuneActions: { flexDirection: 'row', alignItems: 'center', gap: 22 },
  canvasArea: { flex: 1, backgroundColor: '#111111' },
  stage: { flex: 1, backgroundColor: '#111111' },
  hud: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hudPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(0,0,0,0.62)',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  hudLabel: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  hudValue: { color: ACCENT, fontSize: 15, fontWeight: '700' },
  hudTrack: {
    marginTop: 10,
    width: '60%',
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  hudFill: { height: 3, backgroundColor: ACCENT },
  paramMenu: {
    position: 'absolute',
    top: '50%',
    left: 20,
    transform: [{ translateY: -TUNE_PARAMS.length * (ROW_HEIGHT / 2) }],
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 12,
    paddingVertical: 6,
  },
  paramRow: {
    height: ROW_HEIGHT,
    minWidth: 190,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  paramRowActive: { backgroundColor: 'rgba(255,255,255,0.14)' },
  paramText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 15,
    fontWeight: '500',
  },
  paramVal: { color: 'rgba(255,255,255,0.5)', fontSize: 15, fontWeight: '500' },
  paramTextActive: { color: '#ffffff', fontWeight: '700' },
  gestureHint: {
    position: 'absolute',
    bottom: 18,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  gestureHintText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    fontWeight: '500',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  bottom: { backgroundColor: '#1c1c1c' },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingTop: 14,
    paddingBottom: 4,
  },
  toolCell: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  toolCellDisabled: { opacity: 0.32 },
  toolIcon: { fontSize: 22, color: '#dcdcdc', marginBottom: 6 },
  toolLabel: {
    color: '#b8b8b8',
    fontSize: 11,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#333333',
    paddingTop: 12,
  },
  tab: { flex: 1, alignItems: 'center' },
  tabText: {
    color: '#8a8a8a',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },
  tabActive: { color: ACCENT },
  tabDisabled: { color: '#4a4a4a' },
});
