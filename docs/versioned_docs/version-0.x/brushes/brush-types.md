---
sidebar_position: 2
title: Brush Types
---

import Demo from '@site/src/components/Demo';

# Brush Types

Six brushes ship out of the box. Each is both a value in the `BrushTool` union
(for `BrushLayer`'s `tool` prop) and a ready-made component for rendering
committed strokes.

Pick a brush and draw on the canvas below:

```ts
type BrushTool = 'pen' | 'pencil' | 'marker' | 'highlighter' | 'tape' | 'eraser';
```

<Demo name="brushes-brush-types-1" title="Brushes" height={460} />

## The brushes

| Brush | Character | Default color | Width | Opacity | Blend |
| --- | --- | --- | --- | --- | --- |
| `pen` | Crisp solid ink | `#000000` | `4` | `1` | None |
| `pencil` | Thin, slightly soft | `#000000` | `1` | `0.9` | None |
| `marker` | Bold solid strokes | `#e0218a` | `16` | `1` | None |
| `highlighter` | Translucent, darkens on overlap | `#eaff00` | `22` | `0.3` | `multiply` |
| `tape` | Wide, flat-edged band | `#9fe7ff` | `26` | `1` | None |
| `eraser` | Removes pixels beneath it | None | `24` | `1` | `destination-out` |

Each brush also carries a smoothing `tension` and stroke `cap`/`join` tuned to
its feel (round caps for pen/pencil/marker/eraser, square/flat for
highlighter/tape).

## Rendering committed strokes

Each brush has a matching component (`Pen`, `Pencil`, `Marker`, `Highlighter`,
`Tape`, `Eraser`), and the `BRUSH_PATHS` map lets you pick the right one by tool
name:

```tsx
import { BRUSH_PATHS } from 'react-native-canvas-kit';

{strokes.map((s) => {
  const Brush = BRUSH_PATHS[s.tool];
  return <Brush key={s.id} points={s.points} />;
})}
```

<Demo name="brushes-brush-types-2" title="Committed strokes" height={460} />

Or use a component directly:

```tsx
import { Pen, Highlighter } from 'react-native-canvas-kit';

<Pen points={[0, 0, 40, 30, 80, 10]} />
<Highlighter points={[0, 60, 120, 60]} />
```

<Demo name="brushes-brush-types-3" title="Pen and Highlighter" height={460} />

## Brush component props

Every brush component accepts the same props (`BrushProps`). Only `points` is
required; the rest override that brush's defaults:

| Prop | Type | Description |
| --- | --- | --- |
| `points` | `number[]` | Flat `[x0, y0, x1, y1, …]` stroke path. **Required.** |
| `color` | `string` | Override the brush color. |
| `strokeWidth` | `number` | Override the stroke width. |
| `opacity` | `number` | Override the opacity. |
| `tension` | `number` | Override the smoothing (`0` = angular, `1` = very smooth). |

```tsx
<Marker points={pts} color="#22d3ee" strokeWidth={24} />
<Pencil points={pts} opacity={0.6} tension={0.2} />
```

<Demo name="brushes-brush-types-4" title="Prop overrides" height={460} />

To change a brush's defaults everywhere, or to add a new brush, see
[Custom Brushes](./custom-brushes.md).
