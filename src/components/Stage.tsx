import {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import {
  Canvas,
  Group as SkiaGroup,
  ImageFormat,
  Skia,
  useCanvasRef,
  type SkImage,
  type Transforms3d,
} from '@shopify/react-native-skia';
import { useDerivedValue, useAnimatedReaction } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import {
  zoomAroundPoint,
  DEFAULT_MIN_ZOOM,
  DEFAULT_MAX_ZOOM,
  type SceneState,
} from '../core/scene';
import { clampToBounds } from '../core/nodeBounds';
import {
  Gesture,
  GestureDetector,
  type ComposedGesture,
  type GestureType,
} from 'react-native-gesture-handler';
import { NodeRegistry } from '../core/registry';
import {
  RegistryContext,
  ParentContext,
  OrderedChildren,
} from './internal/NodeContext';
import {
  PortalContext,
  PortalHost,
  useTransformLookup,
  type PortalContextValue,
  type PortalEntry,
} from './internal/portal';
import {
  GestureStateContext,
  type GestureStateValue,
} from './internal/gestureState';
import { useStageGestures } from './internal/useStageGestures';

export interface StageToImageOptions {
  mimeType?: 'image/png' | 'image/jpeg' | 'image/webp';
  quality?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface StageHandle {
  makeImageSnapshot: (options?: StageToImageOptions) => Promise<SkImage | null>;
  toBase64: (options?: StageToImageOptions) => Promise<string | null>;
  toDataURL: (options?: StageToImageOptions) => Promise<string | null>;
  getScene: () => SceneState;
  zoomTo: (scale: number, focal?: { x: number; y: number }) => void;
  zoomIn: (step?: number) => void;
  zoomOut: (step?: number) => void;
  panTo: (x: number, y: number) => void;
  centerOn: (x: number, y: number, scale?: number) => void;
  resetView: () => void;
}

const MIME_TYPE_TO_IMAGE_FORMAT: Record<
  NonNullable<StageToImageOptions['mimeType']>,
  ImageFormat
> = {
  'image/png': ImageFormat.PNG,
  'image/jpeg': ImageFormat.JPEG,
  'image/webp': ImageFormat.WEBP,
};

export interface StageProps {
  width: number;
  height: number;
  style?: StyleProp<ViewStyle>;
  listening?: boolean;
  gestureEnabled?: boolean;
  infinite?: boolean;
  minZoom?: number;
  maxZoom?: number;
  onSceneChange?: (scene: SceneState) => void;
  pinchSensitivity?: number;
  rotationSensitivity?: number;
  simultaneousGesture?:
    | ComposedGesture
    | GestureType
    | Array<ComposedGesture | GestureType>;
  children?: ReactNode;
}

export const Stage = memo(
  forwardRef<StageHandle, StageProps>(function Stage(
    {
      width,
      height,
      style,
      listening = true,
      gestureEnabled: _gestureEnabled = true,
      infinite = false,
      minZoom = DEFAULT_MIN_ZOOM,
      maxZoom = DEFAULT_MAX_ZOOM,
      onSceneChange,
      pinchSensitivity,
      rotationSensitivity,
      simultaneousGesture,
      children,
    },
    ref
  ) {
    const canvasRef = useCanvasRef();

    const registryRef = useRef<NodeRegistry | null>(null);
    if (!registryRef.current) {
      registryRef.current = new NodeRegistry();
    }
    const registry = registryRef.current;

    const rootIdRef = useRef<number | null>(null);
    if (rootIdRef.current == null) {
      rootIdRef.current = registry.allocateId();
    }
    const rootId = rootIdRef.current;

    useLayoutEffect(() => {
      registry.register({
        id: rootId,
        parentId: null,
        type: 'stage',
        getConfig: () => ({}),
      });
      return () => registry.unregister(rootId);
    }, [registry, rootId]);

    const gestureEnabled = listening !== false && _gestureEnabled !== false;
    const { gesture, activeGestureSV, sceneOffsetSV, sceneScaleSV } =
      useStageGestures(registry, rootId, gestureEnabled, {
        pinchSensitivity,
        rotationSensitivity,
        infinite,
      });

    const sceneTransform = useDerivedValue<Transforms3d>(() => {
      const offset = sceneOffsetSV.value;
      const scale = sceneScaleSV.value;
      const out: Transforms3d = [];
      if (offset.x !== 0) out.push({ translateX: offset.x });
      if (offset.y !== 0) out.push({ translateY: offset.y });
      if (scale.x !== 1) out.push({ scaleX: scale.x });
      if (scale.y !== 1) out.push({ scaleY: scale.y });
      return out;
    }, []);

    const emitSceneChange = useCallback(
      (scene: SceneState) => {
        onSceneChange?.(scene);
      },
      [onSceneChange]
    );

    useAnimatedReaction(
      () => Math.round(sceneScaleSV.value.x * 100),
      (percent, previous) => {
        if (percent === previous) return;
        scheduleOnRN(emitSceneChange, {
          x: sceneOffsetSV.value.x,
          y: sceneOffsetSV.value.y,
          scale: sceneScaleSV.value.x,
        });
      }
    );

    const composedGesture = useMemo(() => {
      if (!simultaneousGesture) return gesture;
      const otherGestures = Array.isArray(simultaneousGesture)
        ? simultaneousGesture
        : [simultaneousGesture];
      return Gesture.Simultaneous(gesture, ...otherGestures);
    }, [gesture, simultaneousGesture]);

    const [portalEntries, setPortalEntries] = useState<PortalEntry[]>([]);
    const { snapshotSV, getTransform } = useTransformLookup(registry);

    const gestureState = useMemo<GestureStateValue>(
      () => ({
        snapshotSV,
        getTransform,
        activeGestureSV,
        sceneOffsetSV,
        sceneScaleSV,
        width,
        height,
      }),
      [
        snapshotSV,
        getTransform,
        activeGestureSV,
        sceneOffsetSV,
        sceneScaleSV,
        width,
        height,
      ]
    );

    const registerPortal = useCallback((entry: PortalEntry) => {
      setPortalEntries((prev) => [
        ...prev.filter((e) => e.id !== entry.id),
        entry,
      ]);
      return () => {
        setPortalEntries((prev) => prev.filter((e) => e.id !== entry.id));
      };
    }, []);

    const portalContext = useMemo<PortalContextValue>(
      () => ({ registerPortal }),
      [registerPortal]
    );

    useImperativeHandle(ref, () => {
      const snapshot = async (options?: StageToImageOptions) => {
        const canvasHandle = canvasRef.current;
        if (!canvasHandle) return null;
        const cropRect =
          options?.width != null && options?.height != null
            ? Skia.XYWHRect(
                options.x ?? 0,
                options.y ?? 0,
                options.width,
                options.height
              )
            : undefined;
        return canvasHandle.makeImageSnapshotAsync(cropRect);
      };

      const encode = async (options?: StageToImageOptions) => {
        const image = await snapshot(options);
        if (!image) return null;
        const format =
          MIME_TYPE_TO_IMAGE_FORMAT[options?.mimeType ?? 'image/png'];
        const quality = Math.round((options?.quality ?? 1) * 100);
        return image.encodeToBase64(format, quality);
      };

      const applyScene = (
        nextOffset: { x: number; y: number },
        next: number
      ) => {
        sceneOffsetSV.value = nextOffset;
        sceneScaleSV.value = { x: next, y: next };
        emitSceneChange({ x: nextOffset.x, y: nextOffset.y, scale: next });
      };

      const zoomTo = (scale: number, focal?: { x: number; y: number }) => {
        const current = sceneScaleSV.value.x;
        const next = clampToBounds(scale, minZoom, maxZoom);
        const point = focal ?? { x: width / 2, y: height / 2 };
        const offset = zoomAroundPoint(
          sceneOffsetSV.value,
          current,
          next,
          point.x,
          point.y
        );
        applyScene(offset, next);
      };

      return {
        makeImageSnapshot: snapshot,
        toBase64: encode,
        toDataURL: async (options?: StageToImageOptions) => {
          const base64 = await encode(options);
          if (base64 == null) return null;
          return `data:${options?.mimeType ?? 'image/png'};base64,${base64}`;
        },
        getScene: () => ({
          x: sceneOffsetSV.value.x,
          y: sceneOffsetSV.value.y,
          scale: sceneScaleSV.value.x,
        }),
        zoomTo,
        zoomIn: (step = 1.2) => zoomTo(sceneScaleSV.value.x * step),
        zoomOut: (step = 1.2) => zoomTo(sceneScaleSV.value.x / step),
        panTo: (x: number, y: number) =>
          applyScene({ x, y }, sceneScaleSV.value.x),
        centerOn: (x: number, y: number, scale?: number) => {
          const next = clampToBounds(
            scale ?? sceneScaleSV.value.x,
            minZoom,
            maxZoom
          );
          applyScene(
            { x: width / 2 - next * x, y: height / 2 - next * y },
            next
          );
        },
        resetView: () => applyScene({ x: 0, y: 0 }, 1),
      };
    }, [
      canvasRef,
      sceneOffsetSV,
      sceneScaleSV,
      emitSceneChange,
      minZoom,
      maxZoom,
      width,
      height,
    ]);

    const canvas = useMemo(
      () => (
        <Canvas
          ref={canvasRef}
          style={StyleSheet.flatten([{ width, height }, style])}
          pointerEvents={
            gestureEnabled || simultaneousGesture != null ? 'auto' : 'none'
          }
        >
          <RegistryContext.Provider value={registry}>
            <ParentContext.Provider value={rootId}>
              <PortalContext.Provider value={portalContext}>
                <GestureStateContext.Provider value={gestureState}>
                  {infinite ? (
                    <SkiaGroup transform={sceneTransform}>
                      <OrderedChildren>{children}</OrderedChildren>
                    </SkiaGroup>
                  ) : (
                    <OrderedChildren>{children}</OrderedChildren>
                  )}
                </GestureStateContext.Provider>
              </PortalContext.Provider>
            </ParentContext.Provider>
          </RegistryContext.Provider>
        </Canvas>
      ),
      [
        canvasRef,
        children,
        gestureEnabled,
        height,
        infinite,
        sceneTransform,
        portalContext,
        gestureState,
        registry,
        rootId,
        simultaneousGesture,
        style,
        width,
      ]
    );

    const canvasWithGestureDetector = useMemo(
      () =>
        !gestureEnabled && !simultaneousGesture ? (
          canvas
        ) : (
          <GestureDetector gesture={composedGesture}>{canvas}</GestureDetector>
        ),
      [canvas, composedGesture, gestureEnabled, simultaneousGesture]
    );

    return (
      <View style={{ width, height }}>
        {canvasWithGestureDetector}
        <PortalHost
          entries={portalEntries}
          snapshotSV={snapshotSV}
          getTransform={getTransform}
          sceneOffsetSV={sceneOffsetSV}
          sceneScaleSV={sceneScaleSV}
        />
      </View>
    );
  })
);
Stage.displayName = 'Stage';
