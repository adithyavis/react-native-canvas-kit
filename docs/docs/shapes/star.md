---
sidebar_position: 7
title: Star
---

import Demo from '@site/src/components/Demo';

# Star

A star with alternating inner and outer vertices, centered on its origin.

```tsx
import { Star } from 'react-native-canvas-kit';

<Star x={120} y={120} numPoints={5} innerRadius={30} outerRadius={70} fill="#8a2be2" />;
```

<Demo name="shapes-star-1" title="Basic star" height={340} />

## Geometry props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `numPoints` | `number` | `5` | Number of star points. |
| `innerRadius` | `number` | `0` | Radius of the inner vertices (the "valleys"). |
| `outerRadius` | `number` | `0` | Radius of the outer vertices (the "points"). |

Plus all [shared](../core-concepts/nodes-and-transforms.md) and
[styling](../styling/fill-and-stroke.md) props.

## Tuning the shape

The ratio of `innerRadius` to `outerRadius` controls how "spiky" the star looks:
a small inner radius makes sharp points, a large one makes a chunky star.

```tsx
<Star x={90} y={110} numPoints={5} innerRadius={16} outerRadius={70} fill="#ff5aa5" /> {/* spiky */}
<Star x={230} y={110} numPoints={6} innerRadius={45} outerRadius={70} fill="#22d3ee" /> {/* chunky */}
```

<Demo name="shapes-star-2" title="Spiky vs chunky" height={340} />
