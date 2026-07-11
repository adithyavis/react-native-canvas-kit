---
sidebar_position: 3
title: Shadows & Blend Modes
---

import Demo from '@site/src/components/Demo';

# Shadows & Blend Modes

## Opacity

Every node has an `opacity` from `0` to `1`. It cascades to children, so fading a
group fades everything inside it uniformly.

```tsx
<Group opacity={0.5}>
  <Rect x={0} y={0} width={100} height={100} fill="#8a2be2" />
  <Circle x={120} y={50} radius={40} fill="#ff5aa5" />
</Group>
```

<Demo name="styling-shadows-and-blend-1" title="Opacity cascades to children" height={340} />

## Shadows

| Prop | Type | Description |
| --- | --- | --- |
| `shadowColor` | `string` | Shadow color. |
| `shadowBlur` | `number` | Blur radius. |
| `shadowOffset` | `{ x: number; y: number }` | Offset; or use `shadowOffsetX` / `shadowOffsetY`. |
| `shadowOpacity` | `number` | Shadow alpha (`0`–`1`). |
| `shadowEnabled` | `boolean` | Set `false` to disable. |

```tsx
<Rect
  x={40}
  y={40}
  width={140}
  height={90}
  cornerRadius={12}
  fill="#ffffff"
  shadowColor="#000000"
  shadowBlur={16}
  shadowOffset={{ x: 0, y: 8 }}
  shadowOpacity={0.3}
/>
```

<Demo name="styling-shadows-and-blend-2" title="Drop shadow" height={340} />

## Blend modes

`globalCompositeOperation` controls how a shape blends with what's already been
drawn beneath it. The value names match the Canvas / CSS compositing operations
and map to Skia blend modes.

```tsx
<Circle x={100} y={100} radius={60} fill="#ff5aa5" />
<Circle
  x={150}
  y={100}
  radius={60}
  fill="#22d3ee"
  globalCompositeOperation="multiply"
/>
```

<Demo name="styling-shadows-and-blend-3" title="Multiply blend mode" height={340} />

### Available operations

**Porter-Duff compositing**

`source-over` (default) · `source-in` · `source-out` · `source-atop` ·
`destination-over` · `destination-in` · `destination-out` · `destination-atop` ·
`lighter` · `copy` · `xor`

**Separable & non-separable blends**

`multiply` · `screen` · `overlay` · `darken` · `lighten` · `color-dodge` ·
`color-burn` · `hard-light` · `soft-light` · `difference` · `exclusion` · `hue` ·
`saturation` · `color` · `luminosity`

### Common uses

- **`multiply`** darkens overlaps: good for translucent highlighter-style marks.
- **`destination-out`** erases what's beneath it: the basis of an eraser.
- **`screen`** / **`lighter`** brighten overlaps: good for glows.

> Blend modes composite against whatever is already painted in the same drawing
> surface. To scope an effect (for example, so an eraser only affects one set of
> strokes and not the background), isolate that content in its own group. The
> [`BrushLayer`](../brushes/overview.md) does exactly this for brush strokes.
