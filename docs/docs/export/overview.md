---
sidebar_position: 1
title: Export to Image
---

import Demo from '@site/src/components/Demo';

# Export to Image

Attach a `ref` to a [`Stage`](../core-concepts/stage.md) to snapshot the canvas
to a Skia image, a base64 string, or a data URL. This is the equivalent of
Konva's
[high-quality export](https://konvajs.org/docs/data_and_serialization/High-Quality-Export.html).

<Demo name="export-overview-1" title="Drag the shapes, then tap Export" />

Drag the shapes around, tap **Export PNG**, and the exported snapshot appears in
the corner: it captures the canvas exactly as drawn.

## Why it is high quality by default

On the web a `<canvas>` is backed at 1x, which is why Konva needs an explicit
`pixelRatio` to export at retina quality. On React Native the Skia surface is
already backed at the device pixel ratio, so a snapshot is high-DPI by default:
a 300x300 stage on a 3x device exports a 900x900 image.

## Usage

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

## Methods

| Method               | Returns                       | Description                                        |
| -------------------- | ----------------------------- | -------------------------------------------------- |
| `makeImageSnapshot`  | `Promise<SkImage \| null>`    | Raw Skia image for further processing.             |
| `toBase64`           | `Promise<string \| null>`     | Encoded image as a bare base64 string.             |
| `toDataURL`          | `Promise<string \| null>`     | Encoded image as a `data:<mime>;base64,...` URL.   |

## Options

All three methods accept an optional `StageToImageOptions`:

| Option     | Type                                            | Default       | Description                                                   |
| ---------- | ----------------------------------------------- | ------------- | ------------------------------------------------------------ |
| `mimeType` | `'image/png' \| 'image/jpeg' \| 'image/webp'`   | `'image/png'` | Output format (ignored by `makeImageSnapshot`).              |
| `quality`  | `number` (0-1)                                  | `1`           | Compression quality for JPEG/WebP.                           |
| `x`        | `number`                                        | `0`           | Crop origin x, in points.                                    |
| `y`        | `number`                                        | `0`           | Crop origin y, in points.                                    |
| `width`    | `number`                                        | Full width    | Crop width, in points. Pass with `height` to crop a region. |
| `height`   | `number`                                        | Full height   | Crop height, in points. Pass with `width` to crop a region. |

## Cropping a region

Pass `x`, `y`, `width`, and `height` (in points) to export just part of the
stage. This is how a square crop or a fixed-aspect thumbnail is produced from a
larger canvas:

```tsx
const thumbnail = await stageRef.current?.toDataURL({
  x: 40,
  y: 40,
  width: 200,
  height: 200,
});
```
