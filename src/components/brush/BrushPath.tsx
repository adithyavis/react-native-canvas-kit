import { memo, useMemo } from 'react';
import { Path } from '@shopify/react-native-skia';
import { buildBrushPath } from '../../core/brush';
import { BRUSHES, type BrushTool } from './brushes';

export interface BrushProps {
  points: number[];
  color?: string;
  strokeWidth?: number;
  opacity?: number;
  tension?: number;
}

interface StyledBrushProps extends BrushProps {
  tool: BrushTool;
}

const StyledBrush = memo(
  ({
    tool,
    points,
    color,
    strokeWidth,
    opacity,
    tension,
  }: StyledBrushProps) => {
    const style = BRUSHES[tool];
    const resolvedTension = tension ?? style.tension;
    const path = useMemo(
      () => buildBrushPath(points, resolvedTension),
      [points, resolvedTension]
    );
    return (
      <Path
        path={path}
        style="stroke"
        color={color ?? style.color}
        strokeWidth={strokeWidth ?? style.strokeWidth}
        strokeCap={style.cap}
        strokeJoin={style.join}
        opacity={opacity ?? style.opacity}
        blendMode={style.blendMode}
      />
    );
  }
);
StyledBrush.displayName = 'StyledBrush';

export const Pen = memo((props: BrushProps) => (
  <StyledBrush tool="pen" {...props} />
));
export const Pencil = memo((props: BrushProps) => (
  <StyledBrush tool="pencil" {...props} />
));
export const Marker = memo((props: BrushProps) => (
  <StyledBrush tool="marker" {...props} />
));
export const Highlighter = memo((props: BrushProps) => (
  <StyledBrush tool="highlighter" {...props} />
));
export const Tape = memo((props: BrushProps) => (
  <StyledBrush tool="tape" {...props} />
));
export const Eraser = memo((props: BrushProps) => (
  <StyledBrush tool="eraser" {...props} />
));

export const BRUSH_PATHS: Record<
  BrushTool,
  React.MemoExoticComponent<(props: BrushProps) => JSX.Element>
> = {
  pen: Pen,
  pencil: Pencil,
  marker: Marker,
  highlighter: Highlighter,
  tape: Tape,
  eraser: Eraser,
};
