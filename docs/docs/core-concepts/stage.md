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

Attach a `ref` to the stage to snapshot the canvas to a Skia image, a base64
string, or a data URL. This is the equivalent of Konva's
[high-quality export](https://konvajs.org/docs/data_and_serialization/High-Quality-Export.html).

On the web a `<canvas>` is backed at 1x, which is why Konva needs an explicit
`pixelRatio` to export at retina quality. On React Native the Skia surface is
already backed at the device pixel ratio, so a snapshot is high-DPI by default:
a 300x300 stage on a 3x device exports a 900x900 image.

```tsx
import { useRef } from 'react';
import { Stage, Layer, Rect, type StageHandle } from 'react-native-canvas-kit';

function Scene() {
  const stageRef = useRef<StageHandle>(null);

  const handleExport = async () => {
    const dataUrl = await stageRef.current?.toDataURL();
    // dataUrl: "data:image/png;base64,..." - render in an <Image> or save it.

    const jpegBase64 = await stageRef.current?.toBase64({
      mimeType: 'image/jpeg',
      quality: 0.8,
    });

    const image = await stageRef.current?.makeImageSnapshot();
    // image: a Skia SkImage for further Skia processing.
  };

  return (
    <Stage ref={stageRef} width={300} height={300}>
      <Layer>
        <Rect x={20} y={20} width={100} height={100} fill="#8a2be2" />
      </Layer>
    </Stage>
  );
}
```

### Methods

| Method               | Returns                       | Description                                        |
| -------------------- | ----------------------------- | -------------------------------------------------- |
| `makeImageSnapshot`  | `Promise<SkImage \| null>`    | Raw Skia image for further processing.             |
| `toBase64`           | `Promise<string \| null>`     | Encoded image as a bare base64 string.             |
| `toDataURL`          | `Promise<string \| null>`     | Encoded image as a `data:<mime>;base64,...` URL.   |

### Options

All three methods accept an optional `StageToImageOptions`:

| Option     | Type                                            | Default       | Description                                                   |
| ---------- | ----------------------------------------------- | ------------- | ------------------------------------------------------------ |
| `mimeType` | `'image/png' \| 'image/jpeg' \| 'image/webp'`   | `'image/png'` | Output format (ignored by `makeImageSnapshot`).              |
| `quality`  | `number` (0-1)                                  | `1`           | Compression quality for JPEG/WebP.                           |
| `x`        | `number`                                        | `0`           | Crop origin x, in points.                                    |
| `y`        | `number`                                        | `0`           | Crop origin y, in points.                                    |
| `width`    | `number`                                        | Full width    | Crop width, in points. Pass with `height` to crop a region. |
| `height`   | `number`                                        | Full height   | Crop height, in points. Pass with `width` to crop a region. |

## Disabling interaction

- `listening={false}` turns the stage into a static, non-interactive drawing.
- `gestureEnabled={false}` keeps taps working but disables the gesture pipeline.

Both are useful when a stage is purely decorative or when another surface (like
a modal) should own touches temporarily.
