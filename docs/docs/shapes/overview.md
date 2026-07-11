---
sidebar_position: 1
title: Overview
---

import Demo from '@site/src/components/Demo';

# Shapes

Shapes are the drawable leaves of the tree. The library ships eight:

| Shape | Geometry props |
| --- | --- |
| [`Rect`](./rect.md) | `width`, `height`, `cornerRadius` |
| [`Circle`](./circle.md) | `radius` |
| [`Ellipse`](./ellipse.md) | `radiusX`, `radiusY` |
| [`Line`](./line.md) | `points`, `closed`, `tension` |
| [`RegularPolygon`](./regular-polygon.md) | `sides`, `radius` |
| [`Star`](./star.md) | `numPoints`, `innerRadius`, `outerRadius` |
| [`Text`](./text.md) | `text`, `font`, `fontSize`, … |
| [`Image`](./image.md) | `src` / `image`, `width`, `height`, `fit` |

## Shared props

Every shape accepts:

- All [transform & identity props](../core-concepts/nodes-and-transforms.md)
  (`x`, `y`, `scale`, `rotation`, `offset`, `opacity`, `visible`, `id`, …).
- All [styling props](../styling/fill-and-stroke.md): `fill`, `stroke`,
  `strokeWidth`, gradients, dashes, shadows, `lineCap` / `lineJoin`, and
  `globalCompositeOperation`.
- All [event handlers](../interactivity/events.md) and interaction flags
  (`draggable`, `listening`, …).

The pages in this section only document each shape's **geometry** props; assume
the shared props above are available everywhere.

## Fill vs. stroke

A shape with neither a `fill` nor a `stroke` draws nothing. Provide at least one:

```tsx
<Circle x={80} y={80} radius={40} fill="#8a2be2" />                 {/* filled */}
<Circle x={200} y={80} radius={40} stroke="#8a2be2" strokeWidth={6} /> {/* outlined */}
```

<Demo name="shapes-overview-1" title="Fill vs. stroke" height={340} />

## Local coordinates

Geometry is defined in the shape's **local space**; the node's `x`/`y` (and any
ancestor transforms) place it on screen. For example, a `Circle`'s center is its
local origin, while a `Rect` is laid out from its top-left corner. Each shape
page notes its origin.
