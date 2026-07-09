import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import type { NodeRegistry } from '../../core/registry';
import type { Vector2d } from '../../core/types';
import { composeMatrix, matToRNTransform, multiply } from '../../core/matrix';
import { DEG_TO_RAD, type ResolvedTransform } from '../../core/transform';
import {
  EMPTY_SNAPSHOT,
  getAbsoluteMatrixFromSnapshot,
  type Snapshot,
  type TransformLookup,
} from '../../core/snapshot';

export type PortalPointerEvents = 'none' | 'auto' | 'box-none' | 'box-only';

export interface PortalEntry {
  id: number;
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  pointerEvents?: PortalPointerEvents;
  onLayout: (width: number, height: number) => void;
  resolvedTransform: SharedValue<ResolvedTransform>;
  dragOffset: SharedValue<Vector2d>;
  scale: SharedValue<Vector2d>;
  rotation: SharedValue<number>;
  children: ReactNode;
}

export interface PortalContextValue {
  registerPortal: (entry: PortalEntry) => () => void;
}

export const PortalContext = createContext<PortalContextValue | null>(null);

export function usePortal(): PortalContextValue | null {
  return useContext(PortalContext);
}

export function useTransformLookup(registry: NodeRegistry | null): {
  snapshotSV: SharedValue<Snapshot>;
  getTransform: TransformLookup;
} {
  const snapshotSV = useSharedValue<Snapshot>(EMPTY_SNAPSHOT);
  const dragMapSV = useSharedValue<Record<number, SharedValue<Vector2d>>>({});
  const scaleMapSV = useSharedValue<Record<number, SharedValue<Vector2d>>>({});
  const rotationMapSV = useSharedValue<Record<number, SharedValue<number>>>({});
  const versionRef = useRef(-1);

  useEffect(() => {
    if (!registry) return;
    const sync = () => {
      snapshotSV.value = registry.getSnapshot();
      if (registry.idToTransformMapVersion !== versionRef.current) {
        versionRef.current = registry.idToTransformMapVersion;
        dragMapSV.value = registry.getIdToDragOffsetMap();
        scaleMapSV.value = registry.getIdToScaleMap();
        rotationMapSV.value = registry.getIdToRotationMap();
      }
    };
    const unsubscribe = registry.subscribeToChanges(sync);
    sync();
    return unsubscribe;
  }, [registry, snapshotSV, dragMapSV, scaleMapSV, rotationMapSV]);

  const getTransform = useCallback<TransformLookup>(
    (id) => {
      'worklet';
      return {
        offset: dragMapSV.value[id]?.value ?? { x: 0, y: 0 },
        scale: scaleMapSV.value[id]?.value ?? { x: 1, y: 1 },
        rotation: rotationMapSV.value[id]?.value ?? 0,
      };
    },
    [dragMapSV, scaleMapSV, rotationMapSV]
  );

  return { snapshotSV, getTransform };
}

export function PortalHost({
  entries,
  snapshotSV,
  getTransform,
}: {
  entries: PortalEntry[];
  snapshotSV: SharedValue<Snapshot>;
  getTransform: TransformLookup;
}) {
  if (entries.length === 0) return null;
  const ordered = [...entries].sort((a, b) => a.id - b.id);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {ordered.map((entry) => (
        <PortalView
          key={entry.id}
          entry={entry}
          snapshotSV={snapshotSV}
          getTransform={getTransform}
        />
      ))}
    </View>
  );
}

function PortalView({
  entry,
  snapshotSV,
  getTransform,
}: {
  entry: PortalEntry;
  snapshotSV: SharedValue<Snapshot>;
  getTransform: TransformLookup;
}) {
  const {
    id,
    width,
    height,
    style,
    pointerEvents = 'none',
    onLayout,
    resolvedTransform,
    dragOffset,
    scale,
    rotation,
    children,
  } = entry;

  const viewRef = useRef<View>(null);

  useLayoutEffect(() => {
    viewRef.current?.measure((_x, _y, measuredWidth, measuredHeight) => {
      if (measuredWidth > 0 && measuredHeight > 0) {
        onLayout(measuredWidth, measuredHeight);
      }
    });
  }, [onLayout]);

  const animatedStyle = useAnimatedStyle(() => {
    const snapshot = snapshotSV.value;
    const node = snapshot.nodes[id];
    if (!node) return { opacity: 0 };

    const t = resolvedTransform.value;
    const off = dragOffset.value;
    const sc = scale.value;
    const rot = rotation.value;
    const localMatrix = composeMatrix({
      x: t.x + off.x,
      y: t.y + off.y,
      rotation: t.rotation + rot * DEG_TO_RAD,
      scaleX: t.scaleX * sc.x,
      scaleY: t.scaleY * sc.y,
      skewX: t.skewX,
      skewY: t.skewY,
      offsetX: t.offsetX,
      offsetY: t.offsetY,
    });
    const parentAbsoluteMatrix = getAbsoluteMatrixFromSnapshot(
      snapshot,
      getTransform,
      node.parentId
    );
    const m = multiply(parentAbsoluteMatrix, localMatrix);

    return {
      opacity: 1,
      transform: matToRNTransform(m),
    };
  });

  return (
    <Animated.View
      ref={viewRef}
      pointerEvents={pointerEvents}
      onLayout={(e) =>
        onLayout(e.nativeEvent.layout.width, e.nativeEvent.layout.height)
      }
      style={[styles.portal, { width, height }, style, animatedStyle]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  portal: {
    position: 'absolute',
    left: 0,
    top: 0,
    transformOrigin: '0% 0%',
  },
});
