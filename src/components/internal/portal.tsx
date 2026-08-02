import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  type ComponentRef,
  type ReactNode,
} from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle, HostInstance } from 'react-native';
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
  sceneOffsetSV,
  sceneScaleSV,
}: {
  entries: PortalEntry[];
  snapshotSV: SharedValue<Snapshot>;
  getTransform: TransformLookup;
  sceneOffsetSV: SharedValue<Vector2d>;
  sceneScaleSV: SharedValue<Vector2d>;
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
          sceneOffsetSV={sceneOffsetSV}
          sceneScaleSV={sceneScaleSV}
        />
      ))}
    </View>
  );
}

function PortalView({
  entry,
  snapshotSV,
  getTransform,
  sceneOffsetSV,
  sceneScaleSV,
}: {
  entry: PortalEntry;
  snapshotSV: SharedValue<Snapshot>;
  getTransform: TransformLookup;
  sceneOffsetSV: SharedValue<Vector2d>;
  sceneScaleSV: SharedValue<Vector2d>;
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

  const viewRef = useRef<ComponentRef<typeof Animated.View>>(null);

  useLayoutEffect(() => {
    const hostView = viewRef.current as unknown as HostInstance | null;
    hostView?.measure((_x, _y, measuredWidth, measuredHeight) => {
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
    const sceneOffset = sceneOffsetSV.value;
    const sceneScale = sceneScaleSV.value;
    const rootId = snapshot.rootId;
    const getTransformWithoutScene: TransformLookup = (lookupId) => {
      if (lookupId === rootId) {
        return { offset: { x: 0, y: 0 }, scale: { x: 1, y: 1 }, rotation: 0 };
      }
      return getTransform(lookupId);
    };
    const parentAbsoluteMatrix = getAbsoluteMatrixFromSnapshot(
      snapshot,
      getTransformWithoutScene,
      node.parentId
    );
    const sceneMatrix = composeMatrix({
      x: sceneOffset.x,
      y: sceneOffset.y,
      rotation: 0,
      scaleX: sceneScale.x,
      scaleY: sceneScale.y,
      skewX: 0,
      skewY: 0,
      offsetX: 0,
      offsetY: 0,
    });
    const m = multiply(
      sceneMatrix,
      multiply(parentAbsoluteMatrix, localMatrix)
    );

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
