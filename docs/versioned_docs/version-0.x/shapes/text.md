---
sidebar_position: 8
title: Text
---

import Demo from '@site/src/components/Demo';

# Text

Renders a string using a Skia font. Text is positioned from its **top-left**
(`x`/`y`).

```tsx
import { Text, useFont } from 'react-native-canvas-kit';

function Label() {
  const font = useFont(require('./assets/Inter.ttf'), 24);
  if (!font) return null; // still loading

  return <Text text="Hello" x={20} y={20} font={font} fill="#1b0030" />;
}
```

<Demo name="shapes-text-1" title="Hello text" height={340} />

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `string` | `''` | The string to draw. |
| `font` | `SkFont \| null` | None | A pre-loaded font. Overrides `fontFamily`/`fontSize`/`fontStyle`. |
| `fontFamily` | `string` | `'sans-serif'` | System font family (used when `font` is not provided). |
| `fontSize` | `number` | `16` | Font size in points. |
| `fontStyle` | `string` | `'normal'` | e.g. `'bold'`, `'italic'`, `'bold italic'`. |
| `fill` | `string` | `'black'` | Text color. |

Plus all [shared](../core-concepts/nodes-and-transforms.md) and
[styling](../styling/fill-and-stroke.md) props (`stroke` outlines the glyphs,
`opacity`, transforms, …).

## Loading a font

Use the `useFont` hook to load a `.ttf`/`.otf`. It returns `null` while loading,
so guard your render:

```tsx
const font = useFont(
  'https://cdn.jsdelivr.net/npm/@expo-google-fonts/inter/Inter_700Bold.ttf',
  28
);
```

<Demo name="shapes-text-2" title="Font from a URL" height={340} />

`useFont` accepts a local asset (`require(...)`) or a remote URL.

## Measuring text

An `SkFont` can measure a string, which is handy for sizing a background or
centering:

```tsx
const width = font ? font.measureText('Hello').width : 0;
const metrics = font ? font.getMetrics() : null;
const height = metrics ? metrics.descent - metrics.ascent : 0;
```

<Demo name="shapes-text-3" title="Measuring text" height={340} />

## System fonts

If you don't want to bundle a font file, omit `font` and pass `fontFamily` /
`fontSize` / `fontStyle` to use a platform font. For finer control you can build
one yourself with [`matchFont`](../interactivity/events.md):

```tsx
import { matchFont } from 'react-native-canvas-kit';

const font = matchFont({ fontFamily: 'Helvetica', fontSize: 20, fontWeight: 'bold' });
```

<Demo name="shapes-text-4" title="System font text" height={340} />
