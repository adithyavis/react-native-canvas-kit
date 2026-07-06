---
sidebar_position: 4
title: Ellipse
---

# Ellipse

An ellipse centered on its origin, with independent horizontal and vertical
radii. `x`/`y` position the **center**.

```tsx
import { Ellipse } from 'react-native-canvas-kit';

<Ellipse x={140} y={120} radiusX={90} radiusY={50} fill="#8a2be2" />;
```

## Geometry props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `radiusX` | `number` | `0` | Horizontal radius. |
| `radiusY` | `number` | `0` | Vertical radius. |

Plus all [shared](../core-concepts/nodes-and-transforms.md) and
[styling](../styling/fill-and-stroke.md) props.

## Example

```tsx
<Ellipse
  x={160}
  y={160}
  radiusX={110}
  radiusY={60}
  fill="#22d3ee"
  stroke="#1b0030"
  strokeWidth={4}
/>
```

> A `Circle` is just an `Ellipse` with `radiusX === radiusY`. Use `Circle` when
> both radii are equal.
