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
  ImageFormat,
  Skia,
  useCanvasRef,
  type SkImage,
} from '@shopify/react-native-skia';
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
    const { gesture, activeGestureSV } = useStageGestures(
      registry,
      rootId,
      gestureEnabled,
      { pinchSensitivity, rotationSensitivity }
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
        width,
        height,
      }),
      [snapshotSV, getTransform, activeGestureSV, width, height]
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

      return {
        makeImageSnapshot: snapshot,
        toBase64: encode,
        toDataURL: async (options?: StageToImageOptions) => {
          const base64 = await encode(options);
          if (base64 == null) return null;
          return `data:${options?.mimeType ?? 'image/png'};base64,${base64}`;
        },
      };
    }, [canvasRef]);

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
                  <OrderedChildren>{children}</OrderedChildren>
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
        />
      </View>
    );
  })
);
Stage.displayName = 'Stage';
