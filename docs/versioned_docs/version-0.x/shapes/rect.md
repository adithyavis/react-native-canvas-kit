---
sidebar_position: 2
title: Rect
---

# Rect

A rectangle, optionally with rounded corners. Its origin is the **top-left**
corner, so `x`/`y` position that corner.

```tsx
import { Rect } from 'react-native-canvas-kit';

<Rect x={20} y={20} width={160} height={100} cornerRadius={16} fill="#8a2be2" />;
```

## Geometry props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `width` | `number` | `0` | Rectangle width. |
| `height` | `number` | `0` | Rectangle height. |
| `cornerRadius` | `number \| number[]` | None | Corner radius. A single number rounds all corners uniformly. |

Plus all [shared](../core-concepts/nodes-and-transforms.md) and
[styling](../styling/fill-and-stroke.md) props.

## Rounded corners

```tsx
<Rect x={20} y={20} width={140} height={90} cornerRadius={20} fill="#22d3ee" />
```

## Outlined rectangle

```tsx
<Rect
  x={20}
  y={140}
  width={140}
  height={90}
  cornerRadius={8}
  stroke="#1b0030"
  strokeWidth={4}
/>
```

## Centered rotation

Use `offset` to rotate around the center rather than the corner:

```tsx
<Rect
  x={160}
  y={160}
  width={120}
  height={80}
  offsetX={60}
  offsetY={40}
  rotation={20}
  fill="#ff5aa5"
/>
```
