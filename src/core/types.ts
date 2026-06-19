import type { ReactNode } from 'react';

export interface Vector2d {
  x: number;
  y: number;
}

export type LineCap = 'butt' | 'round' | 'square';

export type LineJoin = 'miter' | 'round' | 'bevel';

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

export type ColorStops = Array<number | string>;

export interface NodeHandle {
  id: number;
  attrId?: string;
  name?: string;
  getConfig: () => NodeConfig;
  getAbsolutePosition: () => Vector2d;
}

export interface KonvaEventObject<E = unknown> {
  type: string;
  target: NodeHandle;
  currentTarget: NodeHandle;
  evt: E;
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

export interface NodeConfig extends NodeEventHandlers {
  x?: number;
  y?: number;
  width?: number;
  height?: number;

  scale?: Vector2d;
  scaleX?: number;
  scaleY?: number;
  rotation?: number; // degrees, like Konva
  skewX?: number;
  skewY?: number;
  offset?: Vector2d;
  offsetX?: number;
  offsetY?: number;

  opacity?: number; // 0..1
  visible?: boolean;

  id?: string;
  name?: string;

  gestureEnabled?: boolean;
  draggable?: boolean;
  dragDistance?: number;
  listening?: boolean;

  children?: ReactNode;
}

export type FontStyle = string;

export interface ShapeConfig extends NodeConfig {
  fill?: string;
  fillEnabled?: boolean;

  fillLinearGradientStartPoint?: Vector2d;
  fillLinearGradientEndPoint?: Vector2d;
  fillLinearGradientColorStops?: ColorStops;

  fillRadialGradientStartPoint?: Vector2d;
  fillRadialGradientStartRadius?: number;
  fillRadialGradientEndPoint?: Vector2d;
  fillRadialGradientEndRadius?: number;
  fillRadialGradientColorStops?: ColorStops;

  stroke?: string;
  strokeWidth?: number;
  strokeEnabled?: boolean;
  lineCap?: LineCap;
  lineJoin?: LineJoin;
  hitStrokeWidth?: number;

  dash?: number[];
  dashOffset?: number;
  dashEnabled?: boolean;

  shadowColor?: string;
  shadowBlur?: number;
  shadowOffset?: Vector2d;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowOpacity?: number;
  shadowEnabled?: boolean;

  globalCompositeOperation?: GlobalCompositeOperation;

  perfectDrawEnabled?: boolean;
}
