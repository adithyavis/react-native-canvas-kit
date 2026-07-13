import { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text as RNText,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  Stage,
  Layer,
  Rect,
  Portal,
  type EventObject,
  type TransformResult,
  SnapGrid,
} from 'react-native-canvas-kit';
import { DrawerButton } from '../src/DrawerButton';
import { useTouchTracker, TouchRings } from '../src/TouchOverlay';
import { type NodeTransform } from '../src/constants';

const CARD_WIDTH = 320;
const POLL_ID = 'poll';

const buildInitial = (w: number, h: number): Record<string, NodeTransform> => ({
  [POLL_ID]: {
    x: Math.round((w - CARD_WIDTH) / 2),
    y: Math.round(h * 0.4),
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
  },
});

const TOOLS = ['Aa', '☺', '♪', '⋯'];

type Choice = 'yes' | 'no';
type RevealState = 'hidden' | 'correct' | 'wrong' | 'neutral';

const RESULTS: Record<Choice, number> = { yes: 99, no: 1 };
const CORRECT: Choice = 'yes';

export default function PortalScreen() {
  const { width, height } = useWindowDimensions();
  const [picked, setPicked] = useState<Choice | null>(null);
  const [transforms, setTransforms] = useState(() =>
    buildInitial(width, height)
  );
  const { gesture: touchGesture, touches } = useTouchTracker();

  const revealed = picked !== null;

  const onOption = (choice: Choice) => setPicked(revealed ? null : choice);

  const revealStateFor = (choice: Choice): RevealState => {
    if (!revealed) return 'hidden';
    if (choice === CORRECT) return 'correct';
    return choice === picked ? 'wrong' : 'neutral';
  };

  const commit = (selector: string, t: TransformResult) =>
    setTransforms((prev) => ({
      ...prev,
      [selector.replace('#', '')]: {
        x: t.x,
        y: t.y,
        scaleX: t.scaleX,
        scaleY: t.scaleY,
        rotation: t.rotation,
      },
    }));

  const interactive = (id: string) => {
    const t = transforms[id]!;
    return {
      id,
      x: t.x,
      y: t.y,
      scaleX: t.scaleX,
      scaleY: t.scaleY,
      rotation: t.rotation,
      draggable: true,
      scalable: true,
      rotatable: true,
      onTap: (e: EventObject) => {
        e.cancelBubble = true;
      },
      onTransformEnd: (e: EventObject) =>
        commit(`#${id}`, e.evt as TransformResult),
    };
  };

  return (
    <View style={styles.root}>
      <Stage
        width={width}
        height={height}
        style={styles.stage}
        simultaneousGesture={touchGesture}
      >
        <Layer width={width} height={height} gestureEnabled>
          <Rect
            width={width}
            height={height}
            listening={false}
            fillLinearGradientStartPoint={{ x: 0, y: 0 }}
            fillLinearGradientEndPoint={{ x: width * 0.35, y: height }}
            fillLinearGradientColorStops={[
              0,
              '#FF6A00',
              0.5,
              '#FF9100',
              1,
              '#FFC400',
            ]}
          />

          <Portal
            {...interactive(POLL_ID)}
            xCenterSnaps={[width / 2]}
            yCenterSnaps={[height / 2]}
            pointerEvents="box-none"
          >
            <View style={styles.cardShadow} pointerEvents="box-none">
              <View style={styles.cardClip} pointerEvents="box-none">
                <View style={styles.header} pointerEvents="none">
                  <RNText style={styles.title}>Is this a RN component?</RNText>
                </View>
                <View style={styles.body} pointerEvents="box-none">
                  <PollOption
                    label="Yes"
                    percent={RESULTS.yes}
                    reveal={revealStateFor('yes')}
                    onPress={() => onOption('yes')}
                  />
                  <PollOption
                    label="No"
                    percent={RESULTS.no}
                    reveal={revealStateFor('no')}
                    onPress={() => onOption('no')}
                  />
                </View>
              </View>
            </View>
          </Portal>
          <SnapGrid dash={[6, 6]} stroke="white" />
        </Layer>
      </Stage>

      <TouchRings touches={touches} />

      <View style={styles.topBar} pointerEvents="box-none">
        <View style={styles.toolRow}>
          <View style={[styles.tool, styles.colorTool]} />
          {TOOLS.map((glyph) => (
            <Pressable key={glyph} style={styles.tool} hitSlop={4}>
              <RNText style={styles.toolGlyph}>{glyph}</RNText>
            </Pressable>
          ))}
        </View>
      </View>

      <DrawerButton />
    </View>
  );
}

function PollOption({
  label,
  percent,
  reveal,
  onPress,
}: {
  label: string;
  percent: number;
  reveal: RevealState;
  onPress: () => void;
}) {
  const revealed = reveal !== 'hidden';
  const fillStyle =
    reveal === 'correct'
      ? styles.fillCorrect
      : reveal === 'wrong'
        ? styles.fillWrong
        : styles.fillNeutral;

  const grow = useSharedValue(0);
  useEffect(() => {
    grow.value = withTiming(revealed ? percent : 0, {
      duration: 450,
      easing: Easing.out(Easing.cubic),
    });
  }, [grow, revealed, percent]);
  const fillWidth = useAnimatedStyle(() => ({ width: `${grow.value}%` }));

  return (
    <Pressable style={styles.option} onPress={onPress}>
      <Animated.View
        style={[fillStyle, styles.resultFill, fillWidth]}
        pointerEvents="none"
      />
      <View style={styles.optionRow} pointerEvents="none">
        <RNText style={styles.optionLabel}>{label}</RNText>
        {revealed ? (
          <View style={styles.optionRight}>
            {reveal === 'correct' ? (
              <View style={styles.checkBadge}>
                <RNText style={styles.checkGlyph}>✓</RNText>
              </View>
            ) : null}
            <RNText style={styles.optionPct}>{percent}%</RNText>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  stage: { backgroundColor: '#FF9100' },

  cardShadow: {
    width: CARD_WIDTH,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  cardClip: {
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#0A0A0A',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
    padding: 0,
    textAlign: 'center',
  },
  body: {
    padding: 12,
    gap: 10,
  },
  option: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#ECECEC',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  resultFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  fillCorrect: { backgroundColor: 'rgba(34,197,94,0.32)' },
  fillWrong: { backgroundColor: 'rgba(239,68,68,0.28)' },
  fillNeutral: { backgroundColor: 'rgba(0,0,0,0.08)' },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  optionLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111111',
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionPct: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkGlyph: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  topBar: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
  },
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tool: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorTool: {
    backgroundColor: '#FFB300',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  toolGlyph: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  bottomBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  audiencePill: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
  },
  starBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starGlyph: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  audienceText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  nextButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#FF2D87',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextGlyph: {
    color: '#111111',
    fontSize: 22,
    fontWeight: '700',
  },
});
