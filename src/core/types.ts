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
  getX: () => number;
  getY: () => number;
  getScaleX: () => number;
  getScaleY: () => number;
  getRotation: () => number;
  getAbsolutePosition: () => Vector2d;
}

export interface EventObject<E = unknown> {
  type: string;
  target: NodeHandle;
  currentTarget: NodeHandle;
  evt: E;
  cancelBubble: boolean;
}

export type EventListener<E = unknown> = (evt: EventObject<E>) => void;

export type AnchorId =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'rotater';

export interface TransformResult {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number; // degrees
}

export interface TransformEvent extends TransformResult {
  targetId: number | null;
  anchor: AnchorId;
}

export type TransformEventListener = (evt: TransformEvent) => void;

export interface NodeEventHandlers {
  onClick?: EventListener;
  onDblClick?: EventListener;
  onMouseDown?: EventListener;
  onMouseUp?: EventListener;
  onMouseEnter?: EventListener;
  onMouseLeave?: EventListener;
  onMouseMove?: EventListener;
  onMouseOver?: EventListener;
  onMouseOut?: EventListener;
  onWheel?: EventListener;
  onTap?: EventListener;
  onDblTap?: EventListener;
  onTouchStart?: EventListener;
  onTouchMove?: EventListener;
  onTouchEnd?: EventListener;
  onPointerDown?: EventListener;
  onPointerMove?: EventListener;
  onPointerUp?: EventListener;
  onPointerEnter?: EventListener;
  onPointerLeave?: EventListener;
  onDragStart?: EventListener;
  onDragMove?: EventListener;
  onDragEnd?: EventListener;
  onTransformStart?: EventListener;
  onTransform?: EventListener;
  onTransformEnd?: EventListener;
}

export interface NodeConfig extends NodeEventHandlers {
  x?: number;
  y?: number;
  width?: number;
  height?: number;

  scale?: Vector2d;
  scaleX?: number;
  scaleY?: number;
  rotation?: number; // degrees
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
  scalable?: boolean;
  rotatable?: boolean;
  dragDistance?: number;
  listening?: boolean;
  multiTouchEnabled?: boolean;
  hitTargetId?: number;

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
