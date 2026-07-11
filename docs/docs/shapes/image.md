---
sidebar_position: 9
title: Image
---

import Demo from '@site/src/components/Demo';

# Image

Draws a raster image (PNG, JPG, …). Positioned from its **top-left** (`x`/`y`).

```tsx
import { Image } from 'react-native-canvas-kit';

<Image
  src={require('./assets/sticker.png')}
  x={40}
  y={40}
  width={120}
  height={120}
/>;
```

<Demo name="shapes-image-1" title="Basic image" height={340} />

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `src` | `DataSourceParam` | None | Image source: a `require(...)` asset, a URI, or base64. Loaded for you. |
| `image` | `SkImage \| null` | None | A pre-loaded Skia image (use instead of `src` if you loaded it yourself). |
| `width` | `number` | image width | Display width. |
| `height` | `number` | image height | Display height. |
| `fit` | `Fit` | `'fill'` | How the image fits the box: `'fill'`, `'contain'`, `'cover'`, `'fitWidth'`, `'fitHeight'`, `'scaleDown'`. |

Plus all [shared](../core-concepts/nodes-and-transforms.md) and
[styling](../styling/fill-and-stroke.md) props (transforms, `opacity`,
`globalCompositeOperation`, …).

## Sources

`src` accepts the same sources React Native's `Image` does:

```tsx
<Image src={require('./assets/logo.png')} x={0} y={0} width={80} height={80} />
<Image src={{ uri: 'https://example.com/pic.jpg' }} x={100} y={0} width={80} height={80} />
```

<Demo name="shapes-image-2" title="Image sources" height={340} />

## Fit modes

When the box aspect ratio differs from the image's, `fit` decides how to
reconcile them: `'cover'` fills the box and crops, `'contain'` fits inside and
letterboxes:

```tsx
<Image src={photo} x={0} y={0} width={120} height={80} fit="cover" />
<Image src={photo} x={0} y={0} width={120} height={80} fit="contain" />
```

<Demo name="shapes-image-3" title="Fit modes" height={340} />

## Pre-loading with `useImage`

If you need the raw image object (for measuring, or to reuse across renders),
load it with `useImage` and pass `image`:

```tsx
import { Image, useImage } from 'react-native-canvas-kit';

const img = useImage(require('./assets/sticker.png'));
if (!img) return null;

return <Image image={img} x={40} y={40} width={img.width()} height={img.height()} />;
```

<Demo name="shapes-image-4" title="Pre-loaded with useImage" height={340} />
