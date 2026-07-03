import { memo, useEffect, useRef, useState, type ReactNode } from 'react';
import { Group, Path } from '@shopify/react-native-skia';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { useRegistry } from '../internal/NodeContext';
import { buildBrushPath } from '../../core/brush';
import { BRUSHES, type BrushTool } from './brushes';

export interface BrushStrokeEvent {
  points: number[];
  tool: BrushTool;
}

export interface BrushLayerProps {
  tool: BrushTool | null;
  onStrokeEnd?: (stroke: BrushStrokeEvent) => void;
  children?: ReactNode;
}

export const BrushLayer = memo(
  ({ tool, onStrokeEnd, children }: BrushLayerProps) => {
    const registry = useRegistry();
    const activePointsSV = useSharedValue<number[]>([]);
    const [liveVisible, setLiveVisible] = useState(true);

    const toolRef = useRef(tool);
    toolRef.current = tool;
    const onStrokeEndRef = useRef(onStrokeEnd);
    onStrokeEndRef.current = onStrokeEnd;

    const commitBrushStrokeRef = useRef((points: number[]) => {
      const currentTool = toolRef.current;
      if (currentTool !== null && points.length >= 2) {
        onStrokeEndRef.current?.({ points, tool: currentTool });
      }
      setLiveVisible(false);
      const committedLength = points.length;
      requestAnimationFrame(() => {
        if (activePointsSV.value.length === committedLength) {
          activePointsSV.value = [];
        }
        setLiveVisible(true);
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

    const activeStyle = tool === null ? null : BRUSHES[tool];
    const activeTension = activeStyle?.tension ?? 0.5;

    const activePath = useDerivedValue(
      () => buildBrushPath(activePointsSV.value, activeTension),
      [activePointsSV, activeTension]
    );

    return (
      <Group layer>
        {children}
        {liveVisible && activeStyle && (
          <Path
            path={activePath}
            style="stroke"
            color={activeStyle.color}
            strokeWidth={activeStyle.strokeWidth}
            strokeCap={activeStyle.cap}
            strokeJoin={activeStyle.join}
            opacity={activeStyle.opacity}
            blendMode={activeStyle.blendMode}
          />
        )}
      </Group>
    );
  }
);
BrushLayer.displayName = 'BrushLayer';
