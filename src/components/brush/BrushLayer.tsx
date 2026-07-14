import { memo, useEffect, useRef, type ReactNode } from 'react';
import {
  BlendMode,
  Group,
  Path,
  StrokeCap,
  StrokeJoin,
  type SkEnum,
} from '@shopify/react-native-skia';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { useRegistry } from '../internal/NodeContext';
import { buildBrushPath } from '../../core/brush';
import { BRUSHES, type BrushTool } from './brushes';

function runAfterNextPaint(callback: () => void) {
  requestAnimationFrame(() => requestAnimationFrame(callback));
}

export interface BrushStrokeEvent {
  points: number[];
  tool: BrushTool;
}

export interface BrushLayerProps {
  tool: BrushTool | null;
  strokeWidth?: number;
  strokeCap?: SkEnum<typeof StrokeCap>;
  strokeJoin?: SkEnum<typeof StrokeJoin>;
  opacity?: number;
  blendMode?: SkEnum<typeof BlendMode>;
  onStrokeEnd?: (stroke: BrushStrokeEvent) => void;
  children?: ReactNode;
}

export const BrushLayer = memo(
  ({
    tool,
    strokeWidth,
    strokeCap,
    strokeJoin,
    opacity,
    blendMode,
    onStrokeEnd,
    children,
  }: BrushLayerProps) => {
    const registry = useRegistry();
    const activePointsSV = useSharedValue<number[]>([]);

    const toolRef = useRef(tool);
    toolRef.current = tool;
    const onStrokeEndRef = useRef(onStrokeEnd);
    onStrokeEndRef.current = onStrokeEnd;

    const commitBrushStrokeRef = useRef((points: number[]) => {
      const currentTool = toolRef.current;
      if (currentTool !== null && points.length >= 2) {
        onStrokeEndRef.current?.({ points, tool: currentTool });
      }
      const committedLength = points.length;
      runAfterNextPaint(() => {
        if (activePointsSV.value.length === committedLength) {
          activePointsSV.value = [];
        }
      });
    });

    useEffect(() => {
      if (!registry) return;
      if (tool === null) {
        registry.unregisterBrushTool();
        activePointsSV.value = [];
        return;
      }
      registry.registerBrushTool({
        activePointsSV,
        commit: (points) => commitBrushStrokeRef.current(points),
      });
      return () => registry.unregisterBrushTool();
    }, [registry, tool, activePointsSV]);

    const activeBrush = tool === null ? null : BRUSHES[tool];
    const activeTension = activeBrush?.tension ?? 0.5;

    const activePath = useDerivedValue(
      () => buildBrushPath(activePointsSV.value, activeTension),
      [activePointsSV, activeTension]
    );

    return (
      <Group layer>
        {children}
        {activeBrush && (
          <Path
            path={activePath}
            style="stroke"
            color={activeBrush.color}
            strokeWidth={strokeWidth ?? activeBrush.strokeWidth}
            strokeCap={strokeCap ?? activeBrush.cap}
            strokeJoin={strokeJoin ?? activeBrush.join}
            opacity={opacity ?? activeBrush.opacity}
            blendMode={blendMode ?? activeBrush.blendMode}
          />
        )}
      </Group>
    );
  }
);
BrushLayer.displayName = 'BrushLayer';
