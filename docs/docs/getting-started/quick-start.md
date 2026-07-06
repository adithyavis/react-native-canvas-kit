---
sidebar_position: 2
title: Quick Start
---

# Quick Start

Let's build a small interactive canvas: a couple of shapes, a draggable one, and
a live selection box.

## A first canvas

```tsx
import { useWindowDimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stage, Layer, Rect, Circle } from 'react-native-canvas-kit';

export default function App() {
  const { width, height } = useWindowDimensions();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stage width={width} height={height}>
        <Layer>
          <Rect
            x={40}
            y={80}
            width={140}
            height={90}
            cornerRadius={16}
            fill="#8a2be2"
          />
          <Circle
            x={240}
            y={200}
            radius={60}
            fill="#ff5aa5"
            stroke="#1b0030"
            strokeWidth={6}
          />
        </Layer>
      </Stage>
    </GestureHandlerRootView>
  );
}
```

Every drawing lives inside a [`Stage`](../core-concepts/stage.md), which owns the
native drawing surface. Shapes go inside a [`Layer`](../core-concepts/layer.md).

## Make a shape draggable

Add the `draggable` prop and the node follows your finger. Positions update on
the UI thread, so dragging stays smooth:

```tsx
<Circle x={240} y={200} radius={60} fill="#ff5aa5" draggable />
```

Listen for drag lifecycle events:

```tsx
<Circle
  x={240}
  y={200}
  radius={60}
  fill="#ff5aa5"
  draggable
  onDragEnd={(e) => {
    const { x, y } = e.currentTarget.getAbsolutePosition();
    console.log('dropped at', x, y);
  }}
/>
```

## Select and transform

Give a shape an `id`, track which node is selected, and point a
[`Transformer`](../interactivity/transformer.md) at it:

```tsx
import { useState } from 'react';
import {
  Stage,
  Layer,
  Rect,
  Transformer,
  type TransformEvent,
} from 'react-native-canvas-kit';

function Editor() {
  const [selected, setSelected] = useState<string | null>(null);
  const [box, setBox] = useState({ x: 60, y: 60, scaleX: 1, scaleY: 1, rotation: 0 });

  return (
    <Stage width={360} height={640}>
      <Layer onTap={() => setSelected(null)} width={360} height={640}>
        <Rect
          id="box"
          x={box.x}
          y={box.y}
          scaleX={box.scaleX}
          scaleY={box.scaleY}
          rotation={box.rotation}
          width={160}
          height={110}
          cornerRadius={12}
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
    </Stage>
  );
}
```

Tap the rectangle to select it (handles appear), drag a handle to resize or
rotate, and tap the empty layer to deselect.

## Where to go next

- [Core Concepts](../core-concepts/stage.md): how `Stage`, `Layer`, and `Group`
  compose.
- [Shapes](../shapes/overview.md): the full shape catalog.
- [Interactivity](../interactivity/events.md): events, drag, gestures, and the
  transformer.
- [Brushes](../brushes/overview.md): drawing with `BrushLayer`.
