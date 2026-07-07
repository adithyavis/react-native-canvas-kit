---
sidebar_position: 1
title: Portal
---

# Portal

A `Portal` renders an ordinary React Native component as a node on the canvas.
It takes part in the same interaction model as shapes: it can be `draggable`,
`scalable`, and `rotatable`. This is how you place real RN
views (an image, a card, a live `TextInput`) into a scene and move them like any
other node.

```tsx
import { View, Text } from 'react-native';
import { Stage, Layer, Portal } from 'react-native-canvas-kit';

<Stage width={width} height={height}>
  <Layer width={width} height={height}>
    <Portal id="card" x={80} y={120} draggable scalable rotatable>
      <View
        style={{ padding: 16, borderRadius: 12, backgroundColor: '#1b0030' }}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>Drag me</Text>
      </View>
    </Portal>
  </Layer>
</Stage>;
```

## How it works

React Native views cannot be drawn inside the Skia canvas, so a `Portal` renders
its children in an `Animated.View` positioned over the canvas. Its transform is
computed from the same gesture pipeline as Skia shapes (base transform plus the
live drag, pinch, and rotate values), so the view tracks its node exactly, on the
UI thread, including any parent `Layer` or `Group` transforms.

Because the content lives above the canvas, a `Portal` always renders on top of
the entire scene. Its size (and therefore its draggable hit area) is measured
from the rendered content, so you usually do not pass `width` or `height`.

## Props

A `Portal` accepts every shared [node prop](../core-concepts/nodes-and-transforms.md):
`x`, `y`, `scale` / `scaleX` / `scaleY`, `rotation`, `offset`, `id`, `name`,
`listening`, `draggable`, `scalable`, `rotatable`, and the full set of
[event handlers](../interactivity/events.md). In addition:

| Prop            | Type                                           | Default  | Description                                    |
| --------------- | ---------------------------------------------- | -------- | ---------------------------------------------- |
| `width`         | `number`                                       | measured | Fixes the width. Omit to size to the content.  |
| `height`        | `number`                                       | measured | Fixes the height. Omit to size to the content. |
| `style`         | `StyleProp<ViewStyle>`                         | None     | Style for the wrapping `Animated.View`.        |
| `pointerEvents` | `'none' \| 'box-none' \| 'auto' \| 'box-only'` | `'none'` | How the view handles touches (see below).      |
| `children`      | `ReactNode`                                    | None     | The React Native content to render.            |

When `width` and `height` are omitted, the content is measured (via layout, plus
a synchronous pass when the platform allows it) and that size becomes the node's
hit area, so the draggable region and the transformer bounds match the content.

## Interactive content and `pointerEvents`

By default `pointerEvents` is `'none'`: the whole node is pass-through, so the
stage drags, pinches, and rotates it from anywhere on it.

To embed interactive content (a `TextInput`, a button), set `'box-none'`:
touches on interactive children are handled by them, while touches elsewhere fall
through to the stage. `box-none` only falls through where there is no child view,
so give every purely-visual child `pointerEvents="none"` too, otherwise it will
swallow drags:

```tsx
<Portal
  id="field"
  x={40}
  y={60}
  draggable
  scalable
  rotatable
  pointerEvents="box-none"
>
  <View style={styles.card} pointerEvents="box-none">
    <View pointerEvents="none">
      <Text>Label</Text>
    </View>
    <TextInput defaultValue="Edit me" />
  </View>
</Portal>
```

## Persisting transforms

Like shapes, a `Portal` updates live via shared values during a gesture. Commit
the final transform to state when the interaction ends, using `onTransformEnd`,
exactly as you would for a shape.

## Things to know

- A `Portal` renders **above the entire canvas**. RN views cannot be interleaved
  between Skia draw calls, so a portal cannot sit behind a shape.
- Dragging the portal itself is fully live. Dragging a parent `Group` that
  contains a portal moves the portal on commit rather than every frame.
