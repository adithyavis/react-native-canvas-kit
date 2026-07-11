---
sidebar_position: 2
title: Gradients
---

import Demo from '@site/src/components/Demo';

# Gradients

Instead of a solid `fill`, a shape can be filled with a **linear** or **radial**
gradient. Gradient stops are given as a flat array alternating position and
color: `[pos1, color1, pos2, color2, …]`, where each position is `0`–`1`.

## Linear gradient

| Prop | Type | Description |
| --- | --- | --- |
| `fillLinearGradientStartPoint` | `{ x: number; y: number }` | Start point (local coordinates). |
| `fillLinearGradientEndPoint` | `{ x: number; y: number }` | End point. |
| `fillLinearGradientColorStops` | `Array<number \| string>` | `[pos, color, …]`. |

```tsx
<Rect
  x={20}
  y={20}
  width={200}
  height={120}
  fillLinearGradientStartPoint={{ x: 0, y: 0 }}
  fillLinearGradientEndPoint={{ x: 200, y: 120 }}
  fillLinearGradientColorStops={[0, '#8a2be2', 1, '#22d3ee']}
/>
```

<Demo name="styling-gradients-1" title="Linear gradient" height={340} />

The start/end points define the gradient's direction and length in the shape's
local space.

## Radial gradient

| Prop | Type | Description |
| --- | --- | --- |
| `fillRadialGradientStartPoint` | `{ x: number; y: number }` | Center of the inner circle. |
| `fillRadialGradientStartRadius` | `number` | Inner radius. |
| `fillRadialGradientEndPoint` | `{ x: number; y: number }` | Center of the outer circle. |
| `fillRadialGradientEndRadius` | `number` | Outer radius. |
| `fillRadialGradientColorStops` | `Array<number \| string>` | `[pos, color, …]`. |

```tsx
<Circle
  x={120}
  y={120}
  radius={90}
  fillRadialGradientStartPoint={{ x: 0, y: 0 }}
  fillRadialGradientStartRadius={0}
  fillRadialGradientEndPoint={{ x: 0, y: 0 }}
  fillRadialGradientEndRadius={90}
  fillRadialGradientColorStops={[0, '#ffffff', 1, '#8a2be2']}
/>
```

<Demo name="styling-gradients-2" title="Radial gradient" height={340} />

## Multiple stops

Add as many stops as you like:

```tsx
fillLinearGradientColorStops={[0, '#ff5aa5', 0.5, '#8a2be2', 1, '#22d3ee']}
```

<Demo name="styling-gradients-3" title="Multiple color stops" height={340} />
