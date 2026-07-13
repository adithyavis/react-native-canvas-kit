---
sidebar_position: 9
title: Thanks to Konva
---

# Thanks to Konva

I built React Native Canvas Kit because I kept wishing [Konva](https://konvajs.org/)
existed for React Native. Konva is a fantastic 2D scene graph for the web canvas,
and years of using it shaped how I think a canvas library should feel.

So before anything else, thank you to [Anton Lavrenov](https://github.com/lavrton) and the
Konva community. This library would not exist without that groundwork.

## What I kept similar

I deliberately kept Canvas Kit close to Konva so that anyone who already knows
Konva feels at home right away.

- **The scene graph.** The hierarchy is the same idea:
  `Stage → Layer → Group → Shape`. Nodes nest, transforms cascade down the tree,
  and each node maps onto a render node underneath.
- **Prop names.** Shapes take the props you would expect from Konva:
  `x`, `y`, `width`, `height`, `radius`, `fill`, `stroke`, `strokeWidth`,
  `scaleX`, `scaleY`, `rotation`, and so on. If you have written Konva, most of
  your muscle memory carries over.
- **Interactivity.** Events bubble through ancestors with hierarchy-aware hit
  testing, `draggable` makes a node follow the pointer, and a `Transformer` you
  point at a node draws resize and rotate handles. These mirror Konva's model
  closely, including the `cancelBubble` escape hatch on events.

## What is different

The concepts are shared, but the engine is not. Canvas Kit renders with
[React Native Skia](https://shopify.github.io/react-native-skia/) rather than the
web `<canvas>`, and it drives dragging and multi-touch gestures on the UI thread
with [Reanimated](https://docs.swmansion.com/react-native-reanimated/) and
[Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/). That
lets interactions stay smooth on a phone, but it also means some things diverge
from Konva where React Native and Skia call for it.

If you are coming from Konva: welcome. I hope this feels familiar. And thank you
again to the Konva project for the inspiration.
