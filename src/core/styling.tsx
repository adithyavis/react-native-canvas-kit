import {
  Paint,
  LinearGradient,
  RadialGradient,
  Shadow,
  DashPathEffect,
  vec,
} from '@shopify/react-native-skia';
import type { ColorStops, ShapeConfig } from './types';
import { toSkiaBlendMode, type SkiaBlendMode } from './blend';

const DEFAULT_STROKE_WIDTH = 2;

export function hasFill(c: ShapeConfig): boolean {
  if (c.fillEnabled === false) {
    return false;
  }
  return (
    c.fill != null ||
    c.fillLinearGradientColorStops != null ||
    c.fillRadialGradientColorStops != null
  );
}

export function hasStroke(c: ShapeConfig): boolean {
  if (c.strokeEnabled === false) {
    return false;
  }
  return c.stroke != null && (c.strokeWidth ?? DEFAULT_STROKE_WIDTH) > 0;
}

/** Whether anything visible should be drawn at all. */
export function isPaintable(c: ShapeConfig): boolean {
  return hasFill(c) || hasStroke(c);
}

interface BasePaintProps {
  color?: string;
  style?: 'fill' | 'stroke';
  strokeWidth?: number;
  strokeJoin?: 'miter' | 'round' | 'bevel';
  strokeCap?: 'butt' | 'round' | 'square';
  blendMode?: SkiaBlendMode;
}

/**
 * Inline paint props for the primitive's first (base) pass. Returns the fill
 * when present, otherwise the stroke, otherwise `null` (draw nothing).
 */
export function basePaintProps(c: ShapeConfig): BasePaintProps | null {
  const blendMode = toSkiaBlendMode(c.globalCompositeOperation);
  if (hasFill(c)) {
    // For a gradient fill the `color` is overridden by the shader child; any
    // value works as a placeholder.
    return { color: c.fill ?? 'black', style: 'fill', blendMode };
  }
  if (hasStroke(c)) {
    return {
      color: c.stroke,
      style: 'stroke',
      strokeWidth: c.strokeWidth ?? DEFAULT_STROKE_WIDTH,
      strokeJoin: c.lineJoin,
      strokeCap: c.lineCap,
      blendMode,
    };
  }
  return null;
}

/** Parse a flat `[offset, color, ...]` array into Skia colors/positions. */
function parseColorStops(stops: ColorStops): {
  colors: string[];
  positions: number[];
} {
  const positions: number[] = [];
  const colors: string[] = [];
  for (let i = 0; i < stops.length - 1; i += 2) {
    positions.push(Number(stops[i]));
    colors.push(String(stops[i + 1]));
  }
  return { colors, positions };
}

function FillShader({ c }: { c: ShapeConfig }) {
  if (c.fillLinearGradientColorStops) {
    const { colors, positions } = parseColorStops(
      c.fillLinearGradientColorStops
    );
    const start = c.fillLinearGradientStartPoint ?? { x: 0, y: 0 };
    const end = c.fillLinearGradientEndPoint ?? { x: 0, y: 0 };
    return (
      <LinearGradient
        start={vec(start.x, start.y)}
        end={vec(end.x, end.y)}
        colors={colors}
        positions={positions}
      />
    );
  }
  if (c.fillRadialGradientColorStops) {
    const { colors, positions } = parseColorStops(
      c.fillRadialGradientColorStops
    );
    // Skia's RadialGradient is single-circle. v1 approximates using the end circle.
    const center = c.fillRadialGradientEndPoint ??
      c.fillRadialGradientStartPoint ?? { x: 0, y: 0 };
    const radius =
      c.fillRadialGradientEndRadius ?? c.fillRadialGradientStartRadius ?? 0;
    return (
      <RadialGradient
        c={vec(center.x, center.y)}
        r={radius}
        colors={colors}
        positions={positions}
      />
    );
  }
  return null;
}

function ShadowFilter({ c }: { c: ShapeConfig }) {
  if (c.shadowEnabled === false || c.shadowColor == null) {
    return null;
  }
  const dx = c.shadowOffsetX ?? c.shadowOffset?.x ?? 0;
  const dy = c.shadowOffsetY ?? c.shadowOffset?.y ?? 0;
  const blur = (c.shadowBlur ?? 0) / 2;
  return <Shadow dx={dx} dy={dy} blur={blur} color={c.shadowColor} />;
}

function Dash({ c }: { c: ShapeConfig }) {
  if (c.dashEnabled === false || !c.dash || c.dash.length === 0) {
    return null;
  }
  return <DashPathEffect intervals={c.dash} phase={c.dashOffset ?? 0} />;
}

/**
 * The paint children to nest inside a shape's primitive. Renders the fill
 * shader + shadow on the base pass, plus a stroke pass (or a bare dash when the
 * base pass is itself the stroke).
 */
export function ShapeDecorations({ c }: { c: ShapeConfig }) {
  const fill = hasFill(c);
  const stroke = hasStroke(c);
  return (
    <>
      {fill && <FillShader c={c} />}
      <ShadowFilter c={c} />
      {fill && stroke && (
        <Paint
          style="stroke"
          color={c.stroke}
          strokeWidth={c.strokeWidth ?? DEFAULT_STROKE_WIDTH}
          strokeJoin={c.lineJoin}
          strokeCap={c.lineCap}
        >
          <Dash c={c} />
        </Paint>
      )}
      {!fill && stroke && <Dash c={c} />}
    </>
  );
}
