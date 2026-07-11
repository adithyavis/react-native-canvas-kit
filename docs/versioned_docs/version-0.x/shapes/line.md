---
sidebar_position: 5
title: Line
---

import Demo from '@site/src/components/Demo';

# Line

A polyline or curve through a list of points. Optionally closed into a polygon,
and optionally smoothed with `tension`.

```tsx
import { Line } from 'react-native-canvas-kit';

<Line
  points={[0, 0, 80, 60, 160, 20, 240, 90]}
  stroke="#8a2be2"
  strokeWidth={4}
/>;
```

<Demo name="shapes-line-1" title="A polyline" height={340} />

## Geometry props

| Prop      | Type       | Default | Description                                                                |
| --------- | ---------- | ------- | -------------------------------------------------------------------------- |
| `points`  | `number[]` | `[]`    | Flat list of alternating coordinates: `[x1, y1, x2, y2, …]`.               |
| `closed`  | `boolean`  | `false` | When `true`, connects the last point back to the first.                    |
| `tension` | `number`   | `0`     | Curve smoothing. `0` = straight segments; higher values round the corners. |

Plus all [shared](../core-concepts/nodes-and-transforms.md) and
[styling](../styling/fill-and-stroke.md) props.

## Points format

Points are a single flat array of numbers, not an array of `{x, y}` objects:

```tsx
// three points: (0,0), (50,80), (100,0)
<Line points={[0, 0, 50, 80, 100, 0]} stroke="#22d3ee" strokeWidth={3} />
```

<Demo name="shapes-line-2" title="Points format" height={340} />

## Smoothing with tension

`tension` rounds the path through the points. Compare a jagged path to a smooth
one:

```tsx
<Line points={pts} stroke="#1b0030" strokeWidth={3} />              {/* angular */}
<Line points={pts} stroke="#ff5aa5" strokeWidth={3} tension={0.5} /> {/* smooth */}
```

<Demo name="shapes-line-3" title="Smoothing with tension" height={340} />

## Closed shapes

Set `closed` and add a `fill` to make a filled polygon from arbitrary points:

```tsx
<Line
  points={[60, 0, 120, 90, 0, 90]}
  closed
  fill="#8a2be2"
  stroke="#1b0030"
  strokeWidth={2}
/>
```

<Demo name="shapes-line-4" title="Closed polygon" height={340} />

## Line caps and joins

Control how ends and corners are drawn with
[`lineCap` and `lineJoin`](../styling/fill-and-stroke.md#line-caps-and-joins):

```tsx
<Line {/*...*/} lineCap="round" lineJoin="round" />
<Line {/*...*/} lineCap="meter" lineJoin="butt" />
```

<Demo name="shapes-line-5" title="Line caps and joins" height={340} />
