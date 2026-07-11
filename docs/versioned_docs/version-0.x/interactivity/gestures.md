---
sidebar_position: 3
title: Multi-touch Gestures
---

import Demo from '@site/src/components/Demo';

# Multi-touch Gestures

Beyond one-finger dragging, nodes support **two-finger pinch-to-scale** and
**rotate**. These run entirely on the UI thread, so transforming a shape with
two fingers stays at native frame rates.

## Enabling rotation & scaling

Scaling and rotation are **opt-in per node** and independent of each other. Set
the flag for each gesture you want to allow:

| Prop | Default | Enables |
| --- | --- | --- |
| `scalable` | `false` | Two-finger pinch-to-scale. |
| `rotatable` | `false` | Two-finger rotate. |

`scalable` and `rotatable` are fully independent, so set whichever combination
you need. One-finger dragging is a separate flag, `draggable` (see
[Drag & Drop](./drag-and-drop.md)), and the node-level `gestureEnabled` master
switch (`true` by default for shapes and groups) can turn the whole pinch/rotate
pipeline off at once. A node you can drag, pinch, and twist declares all three:

```tsx
<Image
  src={require('./sticker.png')}
  x={120}
  y={160}
  width={120}
  height={120}
  draggable
  scalable
  rotatable
/>
```

<Demo name="interactivity-gestures-1" title="Drag, pinch & rotate" height={460} />

## Tuning sensitivity

Pinch and rotation sensitivity are configured once on the
[`Stage`](../core-concepts/stage.md) and apply to every node:

| Prop | Default | Description |
| --- | --- | --- |
| `pinchSensitivity` | `1` | Multiplier on scale response. `>1` scales faster. |
| `rotationSensitivity` | `1` | Multiplier on rotation response. |

```tsx
<Stage
  width={width}
  height={height}
  pinchSensitivity={1.2}
  rotationSensitivity={0.8}
>
  {/* ... */}
</Stage>
```

<Demo name="interactivity-gestures-2" title="Tuning sensitivity" height={460} />

## Persisting the result

Like dragging, gestures update the node live via shared values. Persist the
final transform to state when the interaction ends. `onTransformEnd` fires with
the resolved transform and can be read from **either** the
[`Transformer`](./transformer.md) or the node itself; you can also use the node's
drag/transform handlers to read `getScaleX()`, `getRotation()`, and
`getAbsolutePosition()` off the [`NodeHandle`](./events.md).

## Interaction with drawing

If you're using a [`BrushLayer`](../brushes/overview.md), a second finger
landing mid-stroke is treated as a pinch/rotate rather than drawing, and the
in-progress stroke is discarded so a two-finger gesture never leaves an
accidental mark.
