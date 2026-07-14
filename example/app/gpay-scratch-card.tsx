import { useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text as RNText,
  View,
  useWindowDimensions,
} from 'react-native';
import { Asset } from 'expo-asset';
import { Stage, BrushLayer, Eraser, Image } from 'react-native-canvas-kit';
import { DrawerButton } from '../src/DrawerButton';
import { useTouchTracker, TouchRings } from '../src/TouchOverlay';

const FOIL = require('../src/assets/scratch/foil.png');
const FOIL_URI = Asset.fromModule(FOIL).uri;

interface ScratchStroke {
  id: string;
  points: number[];
}

const REVEAL_THRESHOLD = 0.42;
const SCRATCH_WIDTH = 48;

const CONFETTI = [
  { color: '#f6c445', angle: -100, distance: 150 },
  { color: '#4dabf7', angle: -60, distance: 180 },
  { color: '#ff6b6b', angle: -20, distance: 140 },
  { color: '#51cf66', angle: 20, distance: 175 },
  { color: '#845ef7', angle: 60, distance: 150 },
  { color: '#ff922b', angle: 100, distance: 185 },
  { color: '#22b8cf', angle: -140, distance: 160 },
  { color: '#f783ac', angle: 140, distance: 165 },
  { color: '#94d82d', angle: -160, distance: 130 },
  { color: '#ffd43b', angle: 160, distance: 155 },
];

function polylineLength(points: number[]): number {
  let total = 0;
  for (let i = 2; i < points.length; i += 2) {
    const dx = points[i]! - points[i - 2]!;
    const dy = points[i + 1]! - points[i - 1]!;
    total += Math.sqrt(dx * dx + dy * dy);
  }
  return total;
}

function GoogleG() {
  return (
    <View style={styles.googleG}>
      <RNText style={styles.googleGText}>G</RNText>
    </View>
  );
}

export default function ScratchCardScreen() {
  const { width } = useWindowDimensions();
  const size = Math.min(width * 0.75, 300);

  const [strokes, setStrokes] = useState<ScratchStroke[]>([]);
  const [revealed, setRevealed] = useState(false);
  const strokeCounter = useRef(0);
  const scratchedLength = useRef(0);
  const { gesture: touchGesture, touches } = useTouchTracker();

  const foilOpacity = useRef(new Animated.Value(1)).current;
  const rewardScale = useRef(new Animated.Value(0.9)).current;
  const burst = useRef(new Animated.Value(0)).current;
  const hintOpacity = useRef(new Animated.Value(1)).current;

  const revealBudget = size * size * REVEAL_THRESHOLD;

  const runReveal = () => {
    setRevealed(true);
    Animated.parallel([
      Animated.timing(foilOpacity, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(rewardScale, {
        toValue: 1,
        friction: 5,
        tension: 90,
        useNativeDriver: true,
      }),
      Animated.timing(burst, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onStrokeEnd = ({ points }: { points: number[] }) => {
    setStrokes((prev) => {
      if (prev.length === 0) {
        Animated.timing(hintOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
      return [...prev, { id: `scratch-${strokeCounter.current++}`, points }];
    });
    if (revealed) return;
    scratchedLength.current += polylineLength(points) * SCRATCH_WIDTH;
    if (scratchedLength.current >= revealBudget) {
      runReveal();
    }
  };

  const reset = () => {
    setStrokes([]);
    setRevealed(false);
    scratchedLength.current = 0;
    foilOpacity.setValue(1);
    rewardScale.setValue(0.9);
    burst.setValue(0);
    hintOpacity.setValue(1);
  };

  return (
    <View style={styles.root}>
      <View style={styles.backdrop} pointerEvents="none">
        <View style={styles.bgAvatar} />
        <View style={styles.bgRow}>
          <View style={styles.bgLabel} />
          <View style={styles.bgChevron} />
        </View>
        <View style={styles.bgCardsRow}>
          <View style={[styles.bgCard, styles.bgCardNavy]} />
          <View style={[styles.bgCard, styles.bgCardBrown]} />
        </View>
      </View>

      <View style={styles.topBar}>
        <View style={styles.iconSpacer} />
        <View style={styles.headerCenter}>
          <RNText style={styles.headerAmount}>₹360</RNText>
          <RNText style={styles.headerLabel}>Total rewards</RNText>
        </View>
        <Pressable style={styles.menuButton} hitSlop={10}>
          <RNText style={styles.menuDots}>⋮</RNText>
        </Pressable>
      </View>

      <View style={styles.cardArea}>
        <View style={styles.cardWrap}>
          {CONFETTI.map((piece, index) => {
            const radians = (piece.angle * Math.PI) / 180;
            const translateX = burst.interpolate({
              inputRange: [0, 1],
              outputRange: [0, Math.cos(radians) * piece.distance],
            });
            const translateY = burst.interpolate({
              inputRange: [0, 1],
              outputRange: [0, Math.sin(radians) * piece.distance],
            });
            const opacity = burst.interpolate({
              inputRange: [0, 0.7, 1],
              outputRange: [0, 1, 0],
            });
            const scale = burst.interpolate({
              inputRange: [0, 0.3, 1],
              outputRange: [0.2, 1, 0.6],
            });
            return (
              <Animated.View
                key={index}
                pointerEvents="none"
                style={[
                  styles.confetti,
                  {
                    backgroundColor: piece.color,
                    borderRadius: index % 2 === 0 ? 3 : 6,
                    opacity,
                    transform: [{ translateX }, { translateY }, { scale }],
                  },
                ]}
              />
            );
          })}

          <View style={[styles.card, { width: size, height: size }]}>
            <Animated.View
              style={[styles.reward, { transform: [{ scale: rewardScale }] }]}
            >
              <View style={styles.trophyCircle}>
                <RNText style={styles.trophy}>🏆</RNText>
              </View>
              <RNText style={styles.wonLabel}>You&apos;ve won</RNText>
              <RNText style={styles.wonAmount}>₹29</RNText>
              <RNText style={styles.wonSub}>Added to your rewards</RNText>
            </Animated.View>

            <Animated.View
              style={[StyleSheet.absoluteFill, { opacity: foilOpacity }]}
              pointerEvents={revealed ? 'none' : 'auto'}
            >
              <Stage
                width={size}
                height={size}
                style={styles.stage}
                simultaneousGesture={touchGesture}
              >
                <BrushLayer
                  tool={revealed ? null : 'eraser'}
                  strokeWidth={SCRATCH_WIDTH}
                  onStrokeEnd={onStrokeEnd}
                >
                  <Image src={FOIL_URI} width={size} height={size} />
                  {strokes.map((s) => (
                    <Eraser
                      key={s.id}
                      points={s.points}
                      strokeWidth={SCRATCH_WIDTH}
                    />
                  ))}
                </BrushLayer>
              </Stage>
            </Animated.View>

            <TouchRings touches={touches} />
          </View>
        </View>
      </View>

      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetRow}>
          <GoogleG />
          <RNText style={styles.sheetBrand}>Google Pay</RNText>
        </View>
        <RNText style={styles.sheetTitle}>Scratch Card</RNText>
        <RNText style={styles.sheetBody}>
          {revealed
            ? 'Nice! Your reward has been added to your account.'
            : 'Scratch the card above and you could earn rewards!'}
        </RNText>
        {revealed && (
          <Pressable style={styles.resetButton} onPress={reset} hitSlop={8}>
            <RNText style={styles.resetText}>Scratch again</RNText>
          </Pressable>
        )}
      </View>

      <DrawerButton />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#20242e',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 24,
    paddingTop: 150,
  },
  bgAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 34,
  },
  bgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  bgLabel: {
    width: 120,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  bgChevron: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  bgCardsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  bgCard: {
    flex: 1,
    height: 150,
    borderRadius: 14,
  },
  bgCardNavy: {
    backgroundColor: 'rgba(40,52,90,0.55)',
  },
  bgCardBrown: {
    backgroundColor: 'rgba(74,54,44,0.55)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 58,
    paddingHorizontal: 18,
  },
  iconSpacer: {
    width: 40,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.92)',
  },
  headerLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  menuButton: {
    width: 40,
    alignItems: 'flex-end',
  },
  menuDots: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.85)',
  },
  cardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 120,
  },
  cardWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  confetti: {
    position: 'absolute',
    width: 12,
    height: 12,
    zIndex: 10,
  },
  card: {
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
  },
  reward: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  trophyCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eaf0ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  trophy: {
    fontSize: 30,
  },
  wonLabel: {
    fontSize: 15,
    color: '#6b7280',
  },
  wonAmount: {
    fontSize: 40,
    fontWeight: '800',
    color: '#1b1b1f',
    marginTop: 2,
  },
  wonSub: {
    marginTop: 8,
    fontSize: 12,
    color: '#9aa1ac',
  },
  stage: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  hint: {
    position: 'absolute',
    right: -70,
    top: '40%',
    width: 140,
    height: 120,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  hintArc: {
    position: 'absolute',
    right: 20,
    top: 10,
    width: 110,
    height: 90,
    borderColor: '#ff8a3d',
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 90,
  },
  hintCoin: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e2e5ea',
    marginBottom: 18,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  googleG: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e5ea',
  },
  googleGText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4285f4',
  },
  sheetBrand: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3c4043',
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#202124',
  },
  sheetBody: {
    marginTop: 8,
    fontSize: 14,
    color: '#5f6368',
    lineHeight: 20,
  },
  resetButton: {
    marginTop: 18,
    alignSelf: 'flex-start',
    backgroundColor: '#4163dd',
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 24,
  },
  resetText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
