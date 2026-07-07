import { assertReanimatedVersion } from './core/assertReanimatedVersion';
assertReanimatedVersion();

export { Stage } from './components/Stage';
export type { StageProps } from './components/Stage';
export { Layer } from './components/Layer';
export type { LayerProps } from './components/Layer';
export { Group } from './components/Group';
export type { GroupProps } from './components/Group';

export { Rect } from './components/shapes/Rect';
export type { RectProps } from './components/shapes/Rect';
export { Circle } from './components/shapes/Circle';
export type { CircleProps } from './components/shapes/Circle';
export { Ellipse } from './components/shapes/Ellipse';
export type { EllipseProps } from './components/shapes/Ellipse';
export { Line } from './components/shapes/Line';
export type { LineProps } from './components/shapes/Line';
export { RegularPolygon } from './components/shapes/RegularPolygon';
export type { RegularPolygonProps } from './components/shapes/RegularPolygon';
export { Star } from './components/shapes/Star';
export type { StarProps } from './components/shapes/Star';
export { Text } from './components/shapes/Text';
export type { TextProps } from './components/shapes/Text';
export { Image } from './components/shapes/Image';
export type { ImageProps } from './components/shapes/Image';
export { Transformer } from './components/transformer';
export type { TransformerProps } from './components/transformer';
export { Portal } from './components/Portal';
export type { PortalProps } from './components/Portal';

export {
  BrushLayer,
  Pen,
  Pencil,
  Marker,
  Highlighter,
  Tape,
  Eraser,
  BRUSH_PATHS,
  BRUSHES,
} from './components/brush';
export type {
  BrushLayerProps,
  BrushStrokeEvent,
  BrushProps,
  BrushTool,
  BrushStyle,
  StrokeCap,
  StrokeJoin,
} from './components/brush';

export type {
  Vector2d,
  NodeConfig,
  NodeBounds,
  ShapeConfig,
  LineCap,
  LineJoin,
  GlobalCompositeOperation,
  ColorStops,
  FontStyle,
  EventObject,
  EventListener,
  NodeEventHandlers,
  NodeHandle,
  AnchorId,
  TransformResult,
  TransformEvent,
  TransformEventListener,
} from './core/types';

// Convenience re-exports for loading assets (used with <Image> and <Text>).
export { useImage, useFont, matchFont } from '@shopify/react-native-skia';
