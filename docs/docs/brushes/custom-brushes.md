---
sidebar_position: 3
title: Custom Brushes
---

import Demo from '@site/src/components/Demo';

# Custom Brushes

Every brush is defined by a small **style object**, and the geometry is built by
a single path function. That makes brushes easy to tweak or extend.

## Brush styles

The `BRUSHES` record maps each tool to its style:

```ts
import { BRUSHES, type BrushStyle } from 'react-native-canvas-kit';

interface BrushStyle {
  color: string;
  strokeWidth: number;
  opacity: number;
  blendMode?: SkiaBlendMode; // e.g. 'multiply', 'dstOut'
  cap: 'butt' | 'round' | 'square';
  join: 'miter' | 'round' | 'bevel';
  tension: number; // 0 = angular, 1 = very smooth
}
```

Each field is a lever on the brush's look:

- **`color` / `strokeWidth` / `opacity`**: the obvious ones.
- **`blendMode`**: how the stroke composites. `multiply` darkens overlaps (a
  highlighter feel); `dstOut` erases; leave it unset for normal painting.
- **`cap` / `join`**: round for organic ink, flat/square for a tape or
  highlighter look.
- **`tension`**: smoothing strength (see below).

## Per-stroke overrides

The simplest customization needs no new brush at all: override on the
[brush component](./brush-types.md):

```tsx
<Marker
  points={pts}
  color="#22d3ee"
  strokeWidth={24}
  opacity={0.8}
  tension={0.7}
/>
```

<Demo name="brushes-custom-brushes-2" title="Marker overrides" height={460} />

## Smoothing & `tension`

Strokes are turned into a smooth path by corner-cutting the raw input points, and
`tension` controls how much:

- `tension = 0` → the path passes straight through the sample points (crisp,
  angular).
- Higher `tension` → corners are rounded more, for a silkier line.

## Defining a new brush look

Because a committed stroke is just a styled path, you can render one with any
style you like; you don't have to use the built-in components. For a reusable
custom brush, wrap a stroke renderer that reads your own style, or spread a
tweaked `BRUSHES` entry:

```tsx
import { Pen } from 'react-native-canvas-kit';

// A fat, translucent teal "chalk" built on the pen renderer
function Chalk({ points }: { points: number[] }) {
  return (
    <Pen
      points={points}
      color="#7fffd4"
      strokeWidth={18}
      opacity={0.5}
      tension={0.3}
    />
  );
}
```

Then render your saved strokes with it, keyed by whatever tool identifier you
store in state, the same pattern as `BRUSH_PATHS`, but with your own map:

```tsx
const MY_BRUSHES = { ...BRUSH_PATHS, chalk: Chalk };

{
  strokes.map((s) => {
    const Brush = MY_BRUSHES[s.tool];
    return <Brush key={s.id} points={s.points} />;
  });
}
```

<Demo name="brushes-custom-brushes-4" title="Custom brush map" height={460} />

## Reference

- `BRUSHES`: `Record<BrushTool, BrushStyle>`, the default style per tool.
- `BRUSH_PATHS`: `Record<BrushTool, Component>`, the renderer per tool.
