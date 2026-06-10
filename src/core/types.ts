import type { ReactNode } from 'react';

export interface Vector2d {
  x: number;
  y: number;
}

/** `lineCap` values — identical to Skia `strokeCap`. */
export type LineCap = 'butt' | 'round' | 'square';

/** `lineJoin` values — identical to Skia `strokeJoin`. */
export type LineJoin = 'miter' | 'round' | 'bevel';

/**
 * HTML5 canvas composite operations. Mapped to
 * Skia `BlendMode` in core/blend.ts.
 */
export type GlobalCompositeOperation =
  | 'source-over'
  | 'source-in'
  | 'source-out'
  | 'source-atop'
  | 'destination-over'
  | 'destination-in'
  | 'destination-out'
  | 'destination-atop'
  | 'lighter'
  | 'copy'
  | 'xor'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

/**
 * flat color-stop array: `[offset0, color0, offset1, color1, ...]`.
 * e.g. `[0, 'red', 1, 'blue']`.
 */
export type ColorStops = Array<number | string>;

export interface KonvaEventObject<E = unknown> {
  type: string;
  // The shape the event originated on.
  target: unknown;
  // The shape the handler is currently attached to (for bubbling).
  currentTarget: unknown;
  // The underlying native/gesture event.
  evt: E;
  // Set to true inside a handler to stop the event from bubbling.
  cancelBubble: boolean;
}

export type KonvaEventListener<E = unknown> = (
  evt: KonvaEventObject<E>
) => void;

/**
 * Pointer/touch/mouse event handler props. Accepted but inert in v1 — they
 * exist so component signatures are stable when the event engine lands.
 */
export interface NodeEventHandlers {
  onClick?: KonvaEventListener;
  onDblClick?: KonvaEventListener;
  onMouseDown?: KonvaEventListener;
  onMouseUp?: KonvaEventListener;
  onMouseEnter?: KonvaEventListener;
  onMouseLeave?: KonvaEventListener;
  onMouseMove?: KonvaEventListener;
  onMouseOver?: KonvaEventListener;
  onMouseOut?: KonvaEventListener;
  onWheel?: KonvaEventListener;
  onTap?: KonvaEventListener;
  onDblTap?: KonvaEventListener;
  onTouchStart?: KonvaEventListener;
  onTouchMove?: KonvaEventListener;
  onTouchEnd?: KonvaEventListener;
  onPointerDown?: KonvaEventListener;
  onPointerMove?: KonvaEventListener;
  onPointerUp?: KonvaEventListener;
  onPointerEnter?: KonvaEventListener;
  onPointerLeave?: KonvaEventListener;
  onDragStart?: KonvaEventListener;
  onDragMove?: KonvaEventListener;
  onDragEnd?: KonvaEventListener;
}

/**
 * Attributes common to every node (containers and shapes). Names mirror
 * `Konva.Node` config.
 */
export interface NodeConfig extends NodeEventHandlers {
  x?: number;
  y?: number;
  width?: number;
  height?: number;

  // Transform
  scale?: Vector2d;
  scaleX?: number;
  scaleY?: number;
  rotation?: number; // degrees, like Konva
  skewX?: number;
  skewY?: number;
  offset?: Vector2d;
  offsetX?: number;
  offsetY?: number;

  // Appearance
  opacity?: number; // 0..1
  visible?: boolean;

  // Identity / selection (used by the future selector engine)
  id?: string;
  name?: string;

  // Interaction — accepted, no-op in v1
  listening?: boolean;
  draggable?: boolean;
  dragDistance?: number;

  children?: ReactNode;
}

/** Konva `fontStyle` accepts space-separated combos like `"italic bold"`. */
export type FontStyle = string;

/**
 * Attributes common to every drawable shape. Mirrors `Konva.Shape` config:
 * fills, strokes, dashes, shadows, gradients, and composite operation.
 */
export interface ShapeConfig extends NodeConfig {
  // Fill
  fill?: string;
  fillEnabled?: boolean;

  // Linear gradient fill
  fillLinearGradientStartPoint?: Vector2d;
  fillLinearGradientEndPoint?: Vector2d;
  fillLinearGradientColorStops?: ColorStops;

  // Radial gradient fill
  fillRadialGradientStartPoint?: Vector2d;
  fillRadialGradientStartRadius?: number;
  fillRadialGradientEndPoint?: Vector2d;
  fillRadialGradientEndRadius?: number;
  fillRadialGradientColorStops?: ColorStops;

  // Stroke
  stroke?: string;
  strokeWidth?: number;
  strokeEnabled?: boolean;
  lineCap?: LineCap;
  lineJoin?: LineJoin;

  // Dash
  dash?: number[];
  dashOffset?: number;
  dashEnabled?: boolean;

  // Shadow
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffset?: Vector2d;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowOpacity?: number;
  shadowEnabled?: boolean;

  // Composite
  globalCompositeOperation?: GlobalCompositeOperation;

  // Accepted for Konva parity, currently a no-op (Skia is always anti-aliased,
  // hit-testing isn't implemented yet).
  perfectDrawEnabled?: boolean;
}
