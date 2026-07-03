import { memo, useEffect, useRef, type ReactNode } from 'react';
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
  tool: BrushTool | 'off';
  onStrokeEnd?: (stroke: BrushStrokeEvent) => void;
  children?: ReactNode;
}

export const BrushLayer = memo(
  ({ tool, onStrokeEnd, children }: BrushLayerProps) => {
    const registry = useRegistry();
    const activePointsSV = useSharedValue<number[]>([]);

    const toolRef = useRef(tool);
    toolRef.current = tool;
    const onStrokeEndRef = useRef(onStrokeEnd);
    onStrokeEndRef.current = onStrokeEnd;

    const commitBrushStrokeRef = useRef((points: number[]) => {
      const currentTool = toolRef.current;
      if (currentTool !== 'off' && points.length >= 4) {
        onStrokeEndRef.current?.({ points, tool: currentTool });
      }

      const clear = () => {
        if (activePointsSV.value.length === points.length) {
          activePointsSV.value = [];
        }
      };
      requestAnimationFrame(() => requestAnimationFrame(clear));
    });

    useEffect(() => {
      if (!registry) return;
      if (tool === 'off') {
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

    const activeStyle = tool === 'off' ? null : BRUSHES[tool];
    const activeTension = activeStyle?.tension ?? 0.5;

    const activePath = useDerivedValue(
      () => buildBrushPath(activePointsSV.value, activeTension),
      [activePointsSV, activeTension]
    );

    return (
      <Group layer>
        {children}
        {activeStyle && (
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
