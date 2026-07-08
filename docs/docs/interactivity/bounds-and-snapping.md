---
sidebar_position: 5
title: Bounds & Snapping
---

# Bounds & Snapping

Bounds and snapping are node-level constraints that shape how a node responds to
being dragged, scaled, or rotated. Both are applied **on interaction**: the drag /
pinch / rotate pipeline and an attached [`Transformer`](./transformer.md) enforce
them as you gesture, and the value reported by `onDragEnd` / `onTransformEnd` is
already constrained, so your committed state stays consistent.

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

Bounds are enforced **on interaction**: the drag / pinch / rotate pipeline and an
attached [`Transformer`](./transformer.md) clamp to them as you gesture, and the
value reported by `onDragEnd` / `onTransformEnd` is already clamped, so your
committed state stays in range. A value that is set outside its bounds is left
as-is until the first interaction, then snaps into range (it is not retroactively
moved on mount).

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

Edges and center have **separate** targets: the node's left / right edges snap to
`xEdgeSnaps`, its center snaps to `xCenterSnaps` (and likewise for y). Whichever
reference is closest to one of its targets (within `snapTolerance`) is aligned to
it, the way alignment guides work in a design tool. Edge references use the node's
**true bounding box**, so a rotated node snaps by whichever corner is actually
furthest out along the axis.

Snapping is applied **on interaction**, on top of any [bounds](#bounds), and the
snapped value is what `onDragEnd` / `onTransformEnd` reports.

**Rotation snaps and the transformer.** Rotation snaps set on a **node** apply to
both the two-finger rotate gesture **and** an attached
[`Transformer`](./transformer.md). Rotation snaps set on the `Transformer` itself
apply only to rotations performed through that transformer; a node's own
`rotationSnaps` take precedence over the transformer's when both are set.

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

## Visualizing a snap grid

Drop a `<SnapGrid />` inside a `Layer` to draw snap guide lines while a node is
being transformed. It takes no `node` prop: it follows whichever node is currently
being dragged, scaled, or rotated, and reads that node's snap config. Each guide
appears only when the node comes **within tolerance** of it (the way smart guides
work in a design tool). While rotating, the guides are drawn as lines through the
node's center at the snap angles.

```tsx
<Layer width={width} height={height}>
  {/* shapes with snaps... */}
  <SnapGrid stroke="#ff2d87" strokeWidth={1} dash={[6, 6]} />
</Layer>
```

| Prop                | Type       | Default              | Description                                              |
| ------------------- | ---------- | -------------------- | -------------------------------------------------------- |
| `stroke`            | `string`   | `'rgb(255, 25, 0)'`  | Line color.                                              |
| `strokeWidth`       | `number`   | `1`                  | Line width.                                              |
| `dash`              | `number[]` | None                 | Dash pattern (e.g. `[6, 6]`); omit for solid.            |
| `opacity`           | `number`   | `1`                  | Line opacity.                                            |
| `tolerance`         | `number`   | `10`                 | Extra margin, added to the node's `snapTolerance`, over which position guides stay visible. |
| `rotationTolerance` | `number`   | `5`                  | Extra margin, added to the node's `rotationSnapTolerance`, over which rotation guides stay visible. |

`tolerance` and `rotationTolerance` widen only the **visible** zone, not the
snap zone: with a node `rotationSnapTolerance` of `5` and a grid `rotationTolerance`
of `5`, the guide fades in within `10` degrees of the angle while the node still
snaps within `5`. This lets the guide appear as you approach and stay through the
snap.
