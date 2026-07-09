---
sidebar_position: 1
title: Fill & Stroke
---

# Fill & Stroke

Every shape shares the same paint model: an optional **fill** and an optional
**stroke**. A shape with neither draws nothing.

## Fill

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `fill` | `string` | None | Fill color (any CSS color string, e.g. `'#8a2be2'`, `'rgb(…)'`, `'tomato'`). |
| `fillEnabled` | `boolean` | `true` | Set `false` to temporarily disable the fill without removing it. |

```tsx
<Rect x={20} y={20} width={120} height={80} fill="#8a2be2" />
```

## Stroke

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `stroke` | `string` | None | Stroke color. |
| `strokeWidth` | `number` | `2` | Stroke width in points. |
| `strokeEnabled` | `boolean` | `true` | Set `false` to disable the stroke. |
| `lineCap` | `'butt' \| 'round' \| 'square'` | None | How open line ends are drawn. |
| `lineJoin` | `'miter' \| 'round' \| 'bevel'` | None | How corners are drawn. |
| `hitStrokeWidth` | `number` | `strokeWidth` | Stroke width used for hit-testing (make thin lines easier to tap). |

```tsx
<Rect
  x={20}
  y={20}
  width={120}
  height={80}
  fill="#fff"
  stroke="#1b0030"
  strokeWidth={4}
/>
```

A shape can have both: the fill is painted first, then the stroke on top.

## Line caps and joins

`lineCap` shapes the ends of open paths; `lineJoin` shapes the corners. They
matter most for thick `Line` strokes:

```tsx
<Line points={pts} stroke="#22d3ee" strokeWidth={16} lineCap="round" lineJoin="round" />
<Line points={pts} stroke="#ff5aa5" strokeWidth={16} lineCap="butt"  lineJoin="miter" />
```

## Dashed strokes

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `dash` | `number[]` | None | Dash pattern `[on, off, on, off, …]` in points. |
| `dashOffset` | `number` | `0` | Starting offset into the pattern. |
| `dashEnabled` | `boolean` | `true` | Set `false` to disable dashing. |

```tsx
<Rect
  x={20}
  y={20}
  width={140}
  height={90}
  stroke="#8a2be2"
  strokeWidth={3}
  dash={[12, 8]}
/>
```

## See also

- [Gradients](./gradients.md): fill with linear or radial gradients.
- [Shadows & Blend Modes](./shadows-and-blend.md): drop shadows, opacity, and
  compositing.
