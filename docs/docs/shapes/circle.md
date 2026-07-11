---
sidebar_position: 3
title: Circle
---

import Demo from '@site/src/components/Demo';

# Circle

A circle centered on its origin, so `x`/`y` position the **center**.

```tsx
import { Circle } from 'react-native-canvas-kit';

<Circle x={120} y={120} radius={60} fill="#8a2be2" />;
```

<Demo name="shapes-circle-1" title="A circle" height={340} />

## Geometry props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `radius` | `number` | `0` | Circle radius. |

Plus all [shared](../core-concepts/nodes-and-transforms.md) and
[styling](../styling/fill-and-stroke.md) props.

## Filled and outlined

```tsx
<Circle x={80} y={80} radius={50} fill="#22d3ee" />
<Circle x={200} y={80} radius={50} stroke="#1b0030" strokeWidth={6} />
```

<Demo name="shapes-circle-2" title="Filled and outlined" height={340} />

## A ring

Combine a stroke with no fill for a ring, or two circles for a donut:

```tsx
<Circle x={140} y={140} radius={60} stroke="#ff5aa5" strokeWidth={14} />
```

<Demo name="shapes-circle-3" title="A ring" height={340} />
