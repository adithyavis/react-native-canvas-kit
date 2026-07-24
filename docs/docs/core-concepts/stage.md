---
sidebar_position: 1
title: Stage
---

import Demo from '@site/src/components/Demo';

# Stage

The `Stage` is the root of every scene. It renders the underlying Skia canvas
(a native view) and owns gesture detection and event dispatch for everything
inside it.

```tsx
import { Stage, Layer, Rect } from 'react-native-canvas-kit';

<Stage width={360} height={640}>
  <Layer>
    <Rect x={20} y={20} width={100} height={100} fill="#8a2be2" />
  </Layer>
</Stage>;
```

A `Stage` must contain one or more [`Layer`](./layer.md) nodes; shapes live
inside layers (or [groups](./group.md) within layers).

## Props

| Prop                  | Type                   | Default | Description                                                  |
| --------------------- | ---------------------- | ------- | ------------------------------------------------------------ |
| `width`               | `number`               | None    | Canvas width, in points. **Required.**                       |
| `height`              | `number`               | None    | Canvas height, in points. **Required.**                      |
| `style`               | `StyleProp<ViewStyle>` | None    | Style for the canvas view (e.g. a `backgroundColor`).        |
| `listening`           | `boolean`              | `true`  | When `false`, the whole stage ignores pointer/gesture input. |
| `gestureEnabled`      | `boolean`              | `true`  | Enables the pan / pinch / rotate gesture pipeline.           |
| `pinchSensitivity`    | `number`               | `1`     | Multiplier on pinch-to-scale sensitivity.                    |
| `rotationSensitivity` | `number`               | `1`     | Multiplier on two-finger rotation sensitivity.               |
| `children`            | `ReactNode`            | None    | Layers and groups.                                           |

## Sizing the stage

The stage does not size itself; pass explicit `width` and `height`. To fill the
screen, use `useWindowDimensions`:

```tsx
import { useWindowDimensions } from 'react-native';

const { width, height } = useWindowDimensions();

<Stage width={width} height={height} style={{ backgroundColor: '#0b0b12' }}>
  {/* ... */}
</Stage>;
```

## Background color

The stage itself is transparent. Give it a background with `style`:

```tsx
<Stage width={width} height={height} style={{ backgroundColor: '#a441e1' }} />
```

## Exporting to an image

Attach a `ref` to the stage to snapshot the canvas to an image via
`toDataURL`, `toBase64`, or `makeImageSnapshot`. See
[Export to Image](../export/overview.md) for the full API and an interactive
demo.

## Disabling interaction

- `listening={false}` turns the stage into a static, non-interactive drawing.
- `gestureEnabled={false}` keeps taps working but disables the gesture pipeline.

Both are useful when a stage is purely decorative or when another surface (like
a modal) should own touches temporarily.
