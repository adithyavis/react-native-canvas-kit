---
sidebar_position: 4
title: Nodes & Transforms
---

# Nodes & Transforms

Every element in the tree (layers, groups, and shapes) is a **node**, and they
all share a common set of transform and identity props (the `NodeConfig`). Learn
these once and they apply everywhere.

## Position

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `x` | `number` | `0` | Horizontal position in the parent's coordinate space. |
| `y` | `number` | `0` | Vertical position in the parent's coordinate space. |

```tsx
<Rect x={40} y={80} width={100} height={60} fill="#8a2be2" />
```

## Scale

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `scaleX` | `number` | `1` | Horizontal scale factor. |
| `scaleY` | `number` | `1` | Vertical scale factor. |
| `scale` | `{ x: number; y: number }` | None | Shorthand for both axes. |

```tsx
<Circle x={100} y={100} radius={40} scaleX={1.5} scaleY={0.75} fill="#ff5aa5" />
```

## Rotation

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `rotation` | `number` | `0` | Rotation in **degrees**, clockwise. |

Rotation happens around the node's origin, which you can move with `offset`.

## Skew

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `skewX` | `number` | `0` | Horizontal shear, in degrees. |
| `skewY` | `number` | `0` | Vertical shear, in degrees. |

## Offset (pivot)

By default a node's origin is its top-left (`0,0` in local space). `offset` moves
that origin, which changes the pivot for rotation and scale.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `offsetX` | `number` | `0` | Moves the origin right by this many units. |
| `offsetY` | `number` | `0` | Moves the origin down by this many units. |
| `offset` | `{ x: number; y: number }` | None | Shorthand for both. |

To rotate a `100 × 100` rectangle around its center:

```tsx
<Rect
  x={150}
  y={150}
  width={100}
  height={100}
  offsetX={50}
  offsetY={50}
  rotation={30}
  fill="#22d3ee"
/>
```

## Opacity & visibility

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `opacity` | `number` | `1` | Alpha from `0` (transparent) to `1` (opaque). Cascades to children. |
| `visible` | `boolean` | `true` | When `false`, the node and its children are not drawn. |

## Identity

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | None | Stable identifier. Reference it as `"#id"` from a [`Transformer`](../interactivity/transformer.md). |
| `name` | `string` | None | Human-readable label; also selectable as `".name"`. |

## Enabling interaction

A node renders but stays inert until you opt it into input. These props decide
what the node responds to, and, when a [`Transformer`](../interactivity/transformer.md)
is attached, what its handles are allowed to do:

- **`listening`** is the master switch. While it is `true` (the default) the node
  takes part in hit-testing; set it to `false` and the node and its entire
  subtree ignore every tap, drag, and gesture. Drawing is unaffected, so this is
  how you make a node purely decorative.
- **`draggable`** lets a single finger move the node (see
  [Drag & Drop](../interactivity/drag-and-drop.md)). **`dragDistance`** is how far
  the finger must travel first, so a small wobble during a tap is not mistaken
  for a drag.
- **`gestureEnabled`** gates the two-finger pan/pinch/rotate pipeline for the
  node. Leave it on to allow gestures; turn it off to keep taps and drags working
  while blocking pinch and rotate.
- **`scalable`** lets a two-finger pinch resize the node, and it is also what
  makes an attached transformer's **resize** handles do anything; without it a
  transformer just draws a box around the target.
- **`rotatable`** lets a two-finger twist rotate the node, and likewise enables
  the attached transformer's **rotation** handle.

| Prop | Type | Default | Enables |
| --- | --- | --- | --- |
| `listening` | `boolean` | `true` | All input for the node and its subtree. |
| `draggable` | `boolean` | `false` | One-finger drag. |
| `dragDistance` | `number` | `3` | Movement threshold before a drag starts. |
| `gestureEnabled` | `boolean` | `true`\* | The pan/pinch/rotate pipeline on the node. |
| `scalable` | `boolean` | `false` | Two-finger pinch-to-scale, plus transformer resize handles. |
| `rotatable` | `boolean` | `false` | Two-finger rotate, plus the transformer rotation handle. |

<small>\* Defaults to `true` for shapes and groups.</small>

## Composed transforms

A node's final on-screen transform is the composition of its own transform with
all of its ancestors'. Because transforms cascade, moving a group moves its
children, scaling a layer scales everything in it, and so on, so you rarely need to
compute absolute positions by hand. When you do, an event's
[`NodeHandle`](../interactivity/events.md) exposes `getAbsolutePosition()`.
