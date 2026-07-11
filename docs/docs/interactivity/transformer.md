---
sidebar_position: 4
title: Transformer
---

import Demo from '@site/src/components/Demo';

# Transformer

The `Transformer` is an interactive selection box with resize and rotate handles.
Point it at a node and it draws a border plus anchors that let the user scale and
rotate that node directly.

```tsx
import { useState } from 'react';
import {
  Transformer,
  Rect,
  type TransformEvent,
} from 'react-native-canvas-kit';

function Editor() {
  const [selected, setSelected] = useState<string | null>(null);
  const [box, setBox] = useState({
    x: 60,
    y: 60,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
  });

  return (
    <Layer onTap={() => setSelected(null)} width={width} height={height}>
      <Rect
        id="box"
        x={box.x}
        y={box.y}
        scaleX={box.scaleX}
        scaleY={box.scaleY}
        rotation={box.rotation}
        width={160}
        height={110}
        fill="#22d3ee"
        draggable
        onTap={(e) => {
          setSelected('#box');
          e.cancelBubble = true;
        }}
      />

      <Transformer
        node={selected}
        onTransformEnd={(e: TransformEvent) =>
          setBox({
            x: e.x,
            y: e.y,
            scaleX: e.scaleX,
            scaleY: e.scaleY,
            rotation: e.rotation,
          })
        }
      />
    </Layer>
  );
}
```

<Demo name="interactivity-transformer-1" title="Transformer editor" height={460} />

## Attaching to a node

The `node` prop is a **selector string** for the target: its `id` prefixed with
`#` (or its `name` prefixed with `.`). Set it to `null` to hide the transformer.
Track the current selection in state and set it from each shape's `onTap`.

## Persisting transforms

While the user drags an anchor, the target updates live on the UI thread. When
they release, `onTransformEnd` fires with the final transform; write it back to
your state so it persists:

```tsx
<Transformer node={selected} onTransformEnd={(e) => commit(selected, e)} />
```

<Demo name="interactivity-transformer-2" title="Persisting transforms" height={460} />

`onTransformEnd` is a **node event**, so the same transform is delivered to both
the `Transformer` and the selected node. Put the handler wherever fits your code:
on the `Transformer`, or on the node itself alongside its `onDragEnd`. Both
receive the identical `TransformEvent` shown below.

The event carries the resolved transform:

```ts
interface TransformEvent {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number; // degrees
  targetId: number | null;
  anchor: AnchorId; // which handle was dragged
}
```

<Demo name="interactivity-transformer-3" title="The TransformEvent" height={460} />

`onTransformStart` and `onTransform` fire at the start of and during the gesture,
respectively.

## Props

### Behavior

| Prop                    | Type             | Default | Description                                                          |
| ----------------------- | ---------------- | ------- | -------------------------------------------------------------------- |
| `node`                  | `string \| null` | None    | Selector of the target node (`"#id"` or `".name"`); `null` disables. |
| `enabledAnchors`        | `AnchorId[]`     | all     | Which handles to show (see below).                                   |
| `keepRatio`             | `boolean`        | `false` | Lock aspect ratio while scaling.                                     |
| `centeredScaling`       | `boolean`        | `false` | Scale from the center instead of the opposite anchor.                |
| `padding`               | `number`         | `0`     | Extra space between the target's bounds and the border.              |
| `ignoreStroke`          | `boolean`        | `false` | Exclude stroke width from the measured bounds.                       |
| `rotationSnaps`         | `number[]`       | None    | Snap rotation to these angles (degrees).                             |
| `rotationSnapTolerance` | `number`         | `5`     | How close (degrees) before snapping engages.                         |
| `rotateAnchorOffset`    | `number`         | `50`    | Distance of the rotate handle from the shape.                        |

### Appearance

| Prop                | Type     | Default              | Description             |
| ------------------- | -------- | -------------------- | ----------------------- |
| `anchorFill`        | `string` | `'#ffffff'`          | Anchor handle fill.     |
| `anchorStroke`      | `string` | `'rgb(0, 161, 255)'` | Anchor handle border.   |
| `anchorStrokeWidth` | `number` | `1`                  | Anchor border width.    |
| `anchorSize`        | `number` | `10`                 | Anchor handle size.     |
| `borderStroke`      | `string` | `'rgb(0, 161, 255)'` | Selection border color. |
| `borderStrokeWidth` | `number` | `1`                  | Selection border width. |

### Events

| Prop               | Type                          | Description                            |
| ------------------ | ----------------------------- | -------------------------------------- |
| `onTransformStart` | `(e: TransformEvent) => void` | Gesture begins.                        |
| `onTransform`      | `(e: TransformEvent) => void` | Fires continuously during the gesture. |
| `onTransformEnd`   | `(e: TransformEvent) => void` | Gesture ends; persist here.            |

## Anchors

`AnchorId` values:

```
'top-left'    'top-center'    'top-right'
'middle-left'                 'middle-right'
'bottom-left' 'bottom-center' 'bottom-right'
'rotater'   // the rotation handle
```

Show only some handles, for example corners plus rotation for a
uniform-scaling image:

```tsx
<Transformer
  node={selected}
  keepRatio
  enabledAnchors={[
    'top-left',
    'top-right',
    'bottom-left',
    'bottom-right',
    'rotater',
  ]}
/>
```

<Demo name="interactivity-transformer-4" title="Limiting anchors" height={460} />

## Snapping rotation

Snap to 45° increments:

```tsx
<Transformer
  node={selected}
  rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
  rotationSnapTolerance={8}
/>
```

<Demo name="interactivity-transformer-5" title="Rotation snapping" height={460} />
