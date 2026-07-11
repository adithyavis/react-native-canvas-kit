---
slug: /intro
sidebar_position: 1
title: Introduction
---

# React Native Canvas Kit

**React Native Canvas Kit** is a batteries-included 2D canvas kit built on
top of [React Native Skia](https://shopify.github.io/react-native-skia/). Canvas Kit layers a
**scene graph** on top of Skia and comes with pre-built shapes, support for gestures and
interactivity, transformers, and brushes, so that you don't have to compose a canvas experience
from scratch.

React Native Canvas Kit is heavily inspired by [Konva](https://https://konvajs.org/).

## The scene graph

The tree mirrors a classic 2D canvas hierarchy:

```
Stage → the Skia canvas surface
 └ Layer → a logical grouping with its own transform
    └ Group → a transformable container of shapes
       └ Shape → Rect, Circle, Line, Text, Image etc.
```

Every node maps onto a Skia render node.

## What you get

- **Shapes**: `Rect`, `Circle`, `Ellipse`, `Line`, `RegularPolygon`, `Star`,
  `Text`, and `Image`, all sharing a common set of transform and styling props.
- **Interactivity**: tap and press events with hierarchy-aware hit testing and
  ancestor bubbling, plus `draggable` nodes.
- **Multi-touch gestures**: pinch-to-scale and rotate handled on the UI thread.
- **Transformer**: an interactive selection box with resize and rotate handles,
  attachable to any node.
- **Brushes**: a `BrushLayer` with UI-thread stroke capture and a set
  of ready-made brushes (pen, pencil, marker, highlighter, tape, eraser).

## Next steps

- [Installation](./getting-started/installation.md): add the library and its
  peer dependencies.
- [Quick Start](./getting-started/quick-start.md): build your first canvas.
- [Core Concepts](./core-concepts/stage.md): `Stage`, `Layer`, and `Group`.
