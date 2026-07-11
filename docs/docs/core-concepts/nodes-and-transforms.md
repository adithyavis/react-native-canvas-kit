---
sidebar_position: 4
title: Nodes & Transforms
---

import Demo from '@site/src/components/Demo';

# Nodes & Transforms

Every element in the tree (layers, groups, and shapes) is a **node**, and they
all share a common set of transform and identity props (the `NodeConfig`). Learn
these once and they apply everywhere.

## Position

| Prop | Type     | Default | Description                                           |
| ---- | -------- | ------- | ----------------------------------------------------- |
| `x`  | `number` | `0`     | Horizontal position in the parent's coordinate space. |
| `y`  | `number` | `0`     | Vertical position in the parent's coordinate space.   |

```tsx
<Rect x={40} y={80} width={100} height={60} fill="#8a2be2" />
```

## Scale

| Prop     | Type                       | Default | Description              |
| -------- | -------------------------- | ------- | ------------------------ |
| `scaleX` | `number`                   | `1`     | Horizontal scale factor. |
| `scaleY` | `number`                   | `1`     | Vertical scale factor.   |
| `scale`  | `{ x: number; y: number }` | None    | Shorthand for both axes. |

```tsx
<Circle x={100} y={100} radius={40} scaleX={1.5} scaleY={0.75} fill="#ff5aa5" />
```

## Rotation

| Prop       | Type     | Default | Description                         |
| ---------- | -------- | ------- | ----------------------------------- |
| `rotation` | `number` | `0`     | Rotation in **degrees**, clockwise. |

Rotation happens around the node's origin, which you can move with `offset`.

## Skew

| Prop    | Type     | Default | Description                   |
| ------- | -------- | ------- | ----------------------------- |
| `skewX` | `number` | `0`     | Horizontal shear, in degrees. |
| `skewY` | `number` | `0`     | Vertical shear, in degrees.   |

## Offset (pivot)

By default a node's origin is its top-left (`0,0` in local space). `offset` moves
that origin, which changes the pivot for rotation and scale.

| Prop      | Type                       | Default | Description                                |
| --------- | -------------------------- | ------- | ------------------------------------------ |
| `offsetX` | `number`                   | `0`     | Moves the origin right by this many units. |
| `offsetY` | `number`                   | `0`     | Moves the origin down by this many units.  |
| `offset`  | `{ x: number; y: number }` | None    | Shorthand for both.                        |

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

<Demo name="core-concepts-nodes-and-transforms-3" title="Rotate around a pivot" height={340} />

## Opacity & visibility

| Prop      | Type      | Default | Description                                                         |
| --------- | --------- | ------- | ------------------------------------------------------------------- |
| `opacity` | `number`  | `1`     | Alpha from `0` (transparent) to `1` (opaque). Cascades to children. |
| `visible` | `boolean` | `true`  | When `false`, the node and its children are not drawn.              |

## Identity

| Prop   | Type     | Default | Description                                                                                         |
| ------ | -------- | ------- | --------------------------------------------------------------------------------------------------- |
| `id`   | `string` | None    | Stable identifier. Reference it as `"#id"` from a [`Transformer`](../interactivity/transformer.md). |
| `name` | `string` | None    | Human-readable label; also selectable as `".name"`.                                                 |

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

| Prop             | Type      | Default  | Enables                                                     |
| ---------------- | --------- | -------- | ----------------------------------------------------------- |
| `listening`      | `boolean` | `true`   | All input for the node and its subtree.                     |
| `draggable`      | `boolean` | `false`  | One-finger drag.                                            |
| `dragDistance`   | `number`  | `3`      | Movement threshold before a drag starts.                    |
| `gestureEnabled` | `boolean` | `true`\* | The pan/pinch/rotate pipeline on the node.                  |
| `scalable`       | `boolean` | `false`  | Two-finger pinch-to-scale, plus transformer resize handles. |
| `rotatable`      | `boolean` | `false`  | Two-finger rotate, plus the transformer rotation handle.    |

<small>\* Defaults to `true` for shapes and groups.</small>

## Bounds

Set any of these to constrain how far a node can be dragged, scaled, or rotated.
Each is optional and independent; a bound that is unset is not enforced.

| Prop                          | Type     | Constrains              |
| ----------------------------- | -------- | ----------------------- |
| `minX` / `maxX`               | `number` | The node's `x`.         |
| `minY` / `maxY`               | `number` | The node's `y`.         |
| `minScaleX` / `maxScaleX`     | `number` | The effective `scaleX`. |
| `minScaleY` / `maxScaleY`     | `number` | The effective `scaleY`. |
| `minRotation` / `maxRotation` | `number` | Rotation, in degrees.   |

```tsx
<Rect
  x={100}
  y={100}
  width={80}
  height={80}
  draggable
  scalable
  rotatable
  minX={0}
  maxX={280}
  minY={0}
  maxY={600}
  minScaleX={0.5}
  maxScaleX={3}
  minRotation={-45}
  maxRotation={45}
/>
```

<Demo name="core-concepts-nodes-and-transforms-4" title="Bounded drag / scale / rotate" height={460} />

Bounds are enforced **on interaction**: the drag / pinch / rotate pipeline and an
attached [`Transformer`](../interactivity/transformer.md) clamp to them as you
gesture, and the value reported by `onDragEnd` / `onTransformEnd` is already
clamped, so your committed state stays in range. A value that is set outside its
bounds is left as-is until the first interaction, then snaps into range (it is
not retroactively moved on mount).

Position bounds (`minX`, `maxX`, `minY`, `maxY`) apply to the node's `x` / `y` in
its parent's coordinate space, which is the stage's coordinate space for a
top-level node.

## Snapping

Set snap targets to make a gesture settle onto specific positions or angles when
it comes within a tolerance. Each is optional and independent.

| Prop                    | Type       | Default | Description                                              |
| ----------------------- | ---------- | ------- | -------------------------------------------------------- |
| `xEdgeSnaps`            | `number[]` | None    | x targets the node's **left / right** edges snap to.     |
| `xCenterSnaps`          | `number[]` | None    | x targets the node's **center** snaps to.                |
| `yEdgeSnaps`            | `number[]` | None    | y targets the node's **top / bottom** edges snap to.     |
| `yCenterSnaps`          | `number[]` | None    | y targets the node's **center** snaps to.                |
| `snapTolerance`         | `number`   | `10`    | Distance (in points) within which position snaps engage. |
| `rotationSnaps`         | `number[]` | None    | Rotation snap angles, in degrees.                        |
| `rotationSnapTolerance` | `number`   | `5`     | Degrees within which rotation snaps engage.              |

```tsx
<Rect
  x={40}
  y={40}
  width={120}
  height={80}
  draggable
  rotatable
  xEdgeSnaps={[0, 320]}
  xCenterSnaps={[160]}
  yEdgeSnaps={[0, 600]}
  rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
/>
```

<Demo name="core-concepts-nodes-and-transforms-5" title="Snap to edges & angles" height={460} />

Edges and center have **separate** targets: the node's left / right edges snap to
`xEdgeSnaps`, its center snaps to `xCenterSnaps` (and likewise for y). Whichever
reference is closest to one of its targets (within `snapTolerance`) is aligned to
it, the way alignment guides work in a design tool.

Snapping is applied **on interaction**, on top of any [bounds](#bounds), and the
snapped value is what `onDragEnd` / `onTransformEnd` reports.

**Rotation snaps and the transformer.** Rotation snaps set on a **node** apply to
both the two-finger rotate gesture **and** an attached
[`Transformer`](../interactivity/transformer.md). Rotation snaps set on the
`Transformer` itself apply only to rotations performed through that transformer;
a node's own `rotationSnaps` take precedence over the transformer's when both are
set.

Position snaps apply to every way of moving or sizing a node:

- **Dragging** snaps the node's left / right edges (and top / bottom) to the edge
  targets, and its center to the center targets.
- **Resizing with a transformer** snaps the dragged edge or corner to the edge
  targets, and the node's center to the center targets.
- **Two-finger pinch-to-scale** snaps whichever edge is closest to an edge
  target, adjusting the (uniform) scale so it lands there. Because a pinch scales
  around the node's center, the center stays fixed and center targets do not
  apply. Pinch snapping uses the node's own box, so it applies to a
  directly-`scalable` shape or `Portal`, not to a `scalable` group whose size
  comes from its children.

### Visualizing a snap grid

Drop a `<SnapGrid />` inside a `Layer` to draw a snap grid while a node is
being transformed. It takes no `node` prop: it follows whichever node is
currently being dragged, scaled, or rotated, and reads that node's snap config.
Each snap grid line appears only when the node comes **within tolerance** of it (the
way smart guides work in a design tool). While rotating, the guides are drawn as
lines through the node's center at the snap angles.

```tsx
<Layer width={width} height={height}>
  {/* shapes with snaps... */}
  <SnapGrid stroke="#ff2d87" strokeWidth={1} dash={[6, 6]} />
</Layer>
```

<Demo name="core-concepts-nodes-and-transforms-6" title="Visualize a snap grid" height={460} />

| Prop                | Type       | Default              | Description                                                      |
| ------------------- | ---------- | -------------------- | ---------------------------------------------------------------- |
| `stroke`            | `string`   | `'rgb(0, 161, 255)'` | Line color.                                                      |
| `strokeWidth`       | `number`   | `1`                  | Line width.                                                      |
| `dash`              | `number[]` | None                 | Dash pattern (e.g. `[6, 6]`); omit for solid.                    |
| `opacity`           | `number`   | `1`                  | Line opacity.                                                    |
| `tolerance`         | `number`   | `10`                 | When a shape moves within tolerance, a snap grid line appears.   |
| `rotationTolerance` | `number`   | `5`                  | When a shape rotates within tolerance, a snap grid line appears. |

## Composed transforms

A node's final on-screen transform is the composition of its own transform with
all of its ancestors'. Because transforms cascade, moving a group moves its
children, scaling a layer scales everything in it, and so on, so you rarely need to
compute absolute positions by hand. When you do, an event's
[`NodeHandle`](../interactivity/events.md) exposes `getAbsolutePosition()`.
