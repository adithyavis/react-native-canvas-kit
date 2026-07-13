import { useRef, useState } from 'react';
import {
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stage, BrushLayer, Pen } from 'react-native-canvas-kit';
import { DrawerButton } from '../src/DrawerButton';
import { useTouchTracker, TouchRings } from '../src/TouchOverlay';

interface SignatureStroke {
  id: string;
  points: number[];
  color: string;
}

const INK_COLORS: string[] = ['#1b1b1f', '#2f6bff', '#e5352b'];
const DEFAULT_INK = '#1b1b1f';

export default function DocuSignScreen() {
  const [strokes, setStrokes] = useState<SignatureStroke[]>([]);
  const [color, setColor] = useState<string>(DEFAULT_INK);
  const [pad, setPad] = useState({ width: 0, height: 0 });
  const strokeCounter = useRef(0);
  const colorRef = useRef(color);
  colorRef.current = color;
  const { gesture: touchGesture, touches } = useTouchTracker();

  const onPadLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setPad({ width, height });
  };

  const clear = () => setStrokes([]);
  const isEmpty = strokes.length === 0;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <View style={styles.tabs}>
          <View style={[styles.tab, styles.tabActive]}>
            <Text style={styles.tabTextActive}>Draw</Text>
          </View>
          <View style={styles.tab}>
            <Text style={styles.tabText}>Use Font</Text>
          </View>
          <View style={styles.tab}>
            <Text style={styles.tabText}>Take Photo</Text>
          </View>
        </View>
        <Pressable style={styles.create} disabled={isEmpty} hitSlop={12}>
          <Text style={[styles.createText, isEmpty && styles.createDisabled]}>
            Create
          </Text>
        </Pressable>
      </View>

      <View style={styles.padArea}>
        <View style={styles.pad} onLayout={onPadLayout}>
          <View style={styles.baseline} pointerEvents="none">
            <Text style={styles.baselineMark}>✕</Text>
            <View style={styles.baselineLine} />
            <Text style={styles.baselineMark}>Sign here</Text>
            <View style={styles.baselineLine} />
          </View>

          {pad.width > 0 && (
            <Stage
              width={pad.width}
              height={pad.height}
              style={styles.stage}
              simultaneousGesture={touchGesture}
            >
              <BrushLayer
                tool="pen"
                onStrokeEnd={({ points }) =>
                  setStrokes((prev) => [
                    ...prev,
                    {
                      id: `stroke-${strokeCounter.current++}`,
                      points,
                      color: colorRef.current,
                    },
                  ])
                }
              >
                {strokes.map((s) => (
                  <Pen key={s.id} points={s.points} color={s.color} />
                ))}
              </BrushLayer>
            </Stage>
          )}
          <TouchRings touches={touches} />
        </View>

        <View style={styles.controls}>
          <Pressable onPress={clear} hitSlop={8}>
            <Text style={styles.clear}>Clear</Text>
          </Pressable>
          <View style={styles.swatches}>
            {INK_COLORS.map((c) => (
              <Pressable
                key={c}
                onPress={() => setColor(c)}
                hitSlop={8}
                style={[
                  styles.swatch,
                  { backgroundColor: c },
                  color === c && styles.swatchActive,
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      <Text style={styles.legal}>
        By tapping Create, I agree that the signature will be the electronic
        representation of my signature for all purposes when I (or my agent) use
        them on documents, including legally binding contracts - just the same
        as a pen-and-paper signature.
      </Text>

      <DrawerButton />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 64,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerSpacer: {
    width: 56,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#eef0f4',
    borderRadius: 10,
    padding: 3,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    color: '#6b7280',
  },
  tabTextActive: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1b1b1f',
  },
  create: {
    width: 56,
    alignItems: 'flex-end',
  },
  createText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2f6bff',
  },
  createDisabled: {
    color: '#b8bcc4',
  },
  padArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  pad: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  stage: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  baseline: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: '22%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  baselineMark: {
    fontSize: 16,
    color: '#c2c6cf',
  },
  baselineLine: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: '#d5d8de',
    borderStyle: 'dashed',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  clear: {
    fontSize: 15,
    color: '#2f6bff',
    fontWeight: '500',
  },
  swatches: {
    flexDirection: 'row',
    gap: 14,
  },
  swatch: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  swatchActive: {
    borderWidth: 2,
    borderColor: '#1b1b1f',
  },
  legal: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    fontSize: 12,
    lineHeight: 18,
    color: '#6b7280',
  },
});
