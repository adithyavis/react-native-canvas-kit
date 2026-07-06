import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

interface TouchPoint {
  x: number;
  y: number;
}

const MAX_TOUCHES = 6;
const RADIUS = 32;

export function useTouchTracker() {
  const touches = useSharedValue<TouchPoint[]>([]);

  const gesture = useMemo(
    () =>
      Gesture.Manual()
        .onTouchesDown((e) => {
          'worklet';
          const next: TouchPoint[] = [];
          for (let i = 0; i < e.allTouches.length; i++) {
            next.push({ x: e.allTouches[i]!.x, y: e.allTouches[i]!.y });
          }
          touches.value = next;
        })
        .onTouchesMove((e) => {
          'worklet';
          const next: TouchPoint[] = [];
          for (let i = 0; i < e.allTouches.length; i++) {
            next.push({ x: e.allTouches[i]!.x, y: e.allTouches[i]!.y });
          }
          touches.value = next;
        })
        .onTouchesUp((e) => {
          'worklet';
          const gone: number[] = [];
          for (let i = 0; i < e.changedTouches.length; i++) {
            gone.push(e.changedTouches[i]!.id);
          }
          const next: TouchPoint[] = [];
          for (let i = 0; i < e.allTouches.length; i++) {
            const t = e.allTouches[i]!;
            if (gone.indexOf(t.id) === -1) next.push({ x: t.x, y: t.y });
          }
          touches.value = next;
        })
        .onTouchesCancelled(() => {
          'worklet';
          touches.value = [];
        }),
    [touches]
  );

  return { gesture, touches };
}

export function TouchRings({
  touches,
  fill = 'rgba(146, 146, 146, 0.22)',
  ring = 'rgba(128, 128, 128, 0.9)',
}: {
  touches: SharedValue<TouchPoint[]>;
  fill?: string;
  ring?: string;
}) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: MAX_TOUCHES }).map((_, i) => (
        <TouchRing
          key={i}
          index={i}
          touches={touches}
          fill={fill}
          ring={ring}
        />
      ))}
    </View>
  );
}

function TouchRing({
  index,
  touches,
  fill,
  ring,
}: {
  index: number;
  touches: SharedValue<TouchPoint[]>;
  fill: string;
  ring: string;
}) {
  const posX = useSharedValue(0);
  const posY = useSharedValue(0);

  useAnimatedReaction(
    () => touches.value[index],
    (point) => {
      if (point != null) {
        posX.value = point.x;
        posY.value = point.y;
      }
    }
  );

  const style = useAnimatedStyle(() => {
    const active = touches.value[index] != null;
    return {
      opacity: withTiming(active ? 1 : 0, { duration: 120 }),
      transform: [
        { translateX: posX.value - RADIUS },
        { translateY: posY.value - RADIUS },
        { scale: withTiming(active ? 1 : 0.5, { duration: 120 }) },
      ],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.ring, { backgroundColor: fill, borderColor: ring }, style]}
    />
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: RADIUS * 2,
    height: RADIUS * 2,
    borderRadius: RADIUS,
    borderWidth: 2.5,
  },
});
