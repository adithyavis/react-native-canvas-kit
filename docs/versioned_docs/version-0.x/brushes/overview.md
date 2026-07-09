---
sidebar_position: 1
title: BrushLayer
---

# Brushes

The brush system adds **drawing** on top of the scene graph. A
`BrushLayer` captures pen/finger input as you draw, renders the in-progress
stroke live, and hands you the finished stroke to store however you like.

Stroke capture runs on the UI thread, so drawing stays smooth regardless of what
the JS thread is doing.

```tsx
import { useState, useRef } from 'react';
import {
  Stage,
  BrushLayer,
  BRUSH_PATHS,
  type BrushTool,
  type BrushStrokeEvent,
} from 'react-native-canvas-kit';

type Stroke = { id: string; points: number[]; tool: BrushTool };

function Sketch() {
  const [tool, setTool] = useState<BrushTool | null>('pen');
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const nextId = useRef(0);

  return (
    <Stage width={width} height={height}>
      <BrushLayer
        tool={tool}
        onStrokeEnd={({ points, tool }: BrushStrokeEvent) =>
          setStrokes((prev) => [
            ...prev,
            { id: `s${nextId.current++}`, points, tool },
          ])
        }
      >
        {strokes.map((s) => {
          const Brush = BRUSH_PATHS[s.tool];
          return <Brush key={s.id} points={s.points} />;
        })}
      </BrushLayer>
    </Stage>
  );
}
```

## How it works

1. Set `tool` to an active [brush](./brush-types.md) (`'pen'`, `'marker'`, …), or
   `null` to stop drawing.
2. As the user draws, the `BrushLayer` renders a **live preview** of the current
   stroke.
3. When the stroke ends, `onStrokeEnd` fires with the captured `points` and the
   `tool` used. Save it to your state.
4. Render your saved strokes as `BrushLayer` **children** using the matching
   [brush component](./brush-types.md) (the `BRUSH_PATHS` map makes this a
   one-liner).

The committed strokes are ordinary children of the layer, so they persist,
re-render efficiently, and stack in draw order.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `tool` | `BrushTool \| null` | The active brush, or `null` to disable drawing. |
| `onStrokeEnd` | `(stroke: BrushStrokeEvent) => void` | Called once when a stroke finishes. |
| `children` | `ReactNode` | Your committed strokes (and any other nodes). |

### `BrushStrokeEvent`

```ts
interface BrushStrokeEvent {
  points: number[]; // flat [x0, y0, x1, y1, …] in stage coordinates
  tool: BrushTool;  // which brush produced the stroke
}
```

## Erasing

The `eraser` tool doesn't delete stroke objects; it paints with a
`destination-out` blend so it **removes pixels** from the strokes beneath it,
like a real eraser. The `BrushLayer` renders its children inside an **isolated
layer**, which scopes erasing to the drawing only: erasing never punches through
to shapes or the background behind the `BrushLayer`.

Because an eraser stroke is just another stroke (with an erasing blend), you save
and render it exactly like any other: store it via `onStrokeEnd` and render it
with `BRUSH_PATHS['eraser']`.

## Two-finger safety

If a second finger lands while drawing, the gesture is treated as a
pinch/rotate rather than a stroke, and the in-progress mark is discarded, so a
multi-touch gesture never leaves an accidental line. See
[Multi-touch Gestures](../interactivity/gestures.md).

## Next

- [Brush Types](./brush-types.md): the built-in brushes and their looks.
- [Custom Brushes](./custom-brushes.md): override styles or define your own.
