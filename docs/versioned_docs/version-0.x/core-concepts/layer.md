---
sidebar_position: 2
title: Layer
---

# Layer

A `Layer` is a grouping node directly under the [`Stage`](./stage.md). Use layers
to organize your scene into stacked bands, for example a background layer, a
content layer, and a UI/overlay layer. Layers draw in document order: later
layers paint on top of earlier ones.

```tsx
<Stage width={width} height={height}>
  <Layer>{/* background shapes */}</Layer>
  <Layer>{/* foreground shapes + a Transformer */}</Layer>
</Stage>
```

## Props

`Layer` accepts every shared [node prop](./nodes-and-transforms.md) (`x`, `y`,
`scaleX`, `rotation`, `opacity`, `visible`, `listening`, event handlers, …) plus:

| Prop     | Type     | Default | Description                                                                                                         |
| -------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------- |
| `width`  | `number` | None    | Optional hit-test width. When set with `height`, the layer becomes a tappable region covering `0,0 → width,height`. |
| `height` | `number` | None    | Optional hit-test height (see above).                                                                               |

## Making Layers tappable

Because a bare layer has no geometry, it can't receive taps on its own. Give it a
`width` and `height` and it becomes a full-area tap target, handy for
"tap empty space to deselect":

```tsx
<Layer width={width} height={height} onTap={() => setSelected(null)}>
  {/* shapes; a shape's own onTap should set cancelBubble = true */}
</Layer>
```

Shapes on top still receive their own taps first; the layer only gets the tap
when nothing above it handles it (see [Events](../interactivity/events.md)).

## Transforms and opacity

A layer is a transformable container: setting `x`, `scaleX`, `rotation`, or
`opacity` on it affects everything inside. This makes layers a convenient unit
for panning or fading a whole band of content at once.
