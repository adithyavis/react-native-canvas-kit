---
sidebar_position: 6
title: RegularPolygon
---

import Demo from '@site/src/components/Demo';

# RegularPolygon

An equal-sided polygon (triangle, pentagon, hexagon, …) centered on its origin.
`x`/`y` position the **center**; `radius` is the distance from the center to each
vertex.

```tsx
import { RegularPolygon } from 'react-native-canvas-kit';

<RegularPolygon x={120} y={120} sides={6} radius={70} fill="#8a2be2" />;
```

<Demo name="shapes-regular-polygon-1" title="Basic hexagon" height={340} />

## Geometry props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `sides` | `number` | `3` | Number of sides. |
| `radius` | `number` | `0` | Distance from center to each vertex. |

Plus all [shared](../core-concepts/nodes-and-transforms.md) and
[styling](../styling/fill-and-stroke.md) props.

## Examples

```tsx
<RegularPolygon x={80} y={100} sides={3} radius={60} fill="#22d3ee" />   {/* triangle */}
<RegularPolygon x={220} y={100} sides={5} radius={60} fill="#ff5aa5" />  {/* pentagon */}
```

<Demo name="shapes-regular-polygon-2" title="Triangle and pentagon" height={340} />

Rotate to change orientation:

```tsx
<RegularPolygon
  x={140}
  y={140}
  sides={6}
  radius={70}
  rotation={30}
  stroke="#1b0030"
  strokeWidth={4}
/>
```

<Demo name="shapes-regular-polygon-3" title="Rotated hexagon" height={340} />
