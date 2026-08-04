<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.svg" />
    <img alt="React Native Canvas Kit" src="assets/logo.svg" width="112" height="112" />
  </picture>
</p>

# react-native-canvas-kit

<p align="center">
  <a href="https://www.npmjs.com/package/react-native-canvas-kit"><img alt="npm version" src="https://img.shields.io/npm/v/react-native-canvas-kit?style=flat-square" /></a>
  <a href="https://www.npmjs.com/package/react-native-canvas-kit"><img alt="license" src="https://img.shields.io/npm/l/react-native-canvas-kit?style=flat-square" /></a>
  <a href="https://www.npmjs.com/package/react-native-canvas-kit"><img alt="types included" src="https://img.shields.io/badge/types-included-blue?style=flat-square" /></a>
  <a href="https://expo.io/"><img alt="runs with expo" src="https://img.shields.io/badge/Runs%20with%20Expo-4630EB.svg?style=flat-square&logo=EXPO&labelColor=f3f3f3&logoColor=000" /></a>
</p>

<p align="center">
  <video src="https://github.com/user-attachments/assets/762d8210-e6f8-4423-8027-859e4156b6b8" width="100%" controls muted autoplay loop></video>
</p>

A **batteries-included 2D canvas kit for React Native**, built on top of
[React Native Skia](https://shopify.github.io/react-native-skia/). Canvas Kit
layers a **scene graph** over Skia and ships with pre-built shapes, gestures and
interactivity, a transformer, and brushes, so you don't have to compose a canvas
experience from scratch.

> React Native Canvas Kit is heavily inspired by [Konva](https://konvajs.org).
> Full guides and API reference live in the
> [documentation site](https://adithyavis.github.io/react-native-canvas-kit/intro).

## What you get

- **Shapes**: `Rect`, `Circle`, `Ellipse`, `Line`, `RegularPolygon`, `Star`,
  `Text`, and `Image`, all sharing a common set of transform and styling props.
- **Interactivity**: tap and press events with hierarchy-aware hit testing and
  ancestor bubbling, plus `draggable` nodes.
- **Multi-touch gestures**: pinch-to-scale and rotate handled on the UI thread.
- **Transformer**: an interactive selection box with resize and rotate handles,
  attachable to any node.
- **Brushes**: a `BrushLayer` with UI-thread stroke capture and a set of
  ready-made brushes (pen, pencil, marker, highlighter, tape, eraser).

## Installation

```sh
npm install react-native-canvas-kit @shopify/react-native-skia react-native-gesture-handler react-native-reanimated react-native-worklets
```

React Native Skia, Reanimated, Gesture Handler, and Worklets are **peer
dependencies**: install them alongside the library.

| Package                        | Version    |
| ------------------------------ | ---------- |
| `@shopify/react-native-skia`   | `>= 1.0.0` |
| `react-native-gesture-handler` | `>= 2.0.0` |
| `react-native-reanimated`      | `^4.0.0`   |
| `react-native-worklets`        | `>= 0.5.0` |

Canvas Kit ships no native code of its own, but Reanimated 4 requires React
Native's **New Architecture**, so `react-native-canvas-kit@1.x` runs on the New
Architecture only. See the
[installation guide](https://adithyavis.github.io/react-native-canvas-kit/getting-started/installation)
for the worklets Babel plugin and native setup.

> **Versions**: `1.x` targets **Reanimated 4** (New Architecture). If you are
> still on **Reanimated 3** / the legacy architecture, pin
> `react-native-canvas-kit@0.x`.

## Usage

```tsx
import { Stage, Layer, Circle, Rect } from 'react-native-canvas-kit';

export function Hello() {
  return (
    <Stage width={300} height={300}>
      <Layer>
        <Rect
          x={20}
          y={20}
          width={120}
          height={80}
          fill="#8a2be2"
          cornerRadius={12}
        />
        <Circle
          x={200}
          y={140}
          radius={50}
          fill="#ff5aa5"
          stroke="#1b0030"
          strokeWidth={4}
        />
      </Layer>
    </Stage>
  );
}
```

The tree mirrors a classic 2D canvas hierarchy:

```
Stage → the Skia canvas surface
 └ Layer → a logical grouping with its own transform
    └ Group → a transformable container of shapes
       └ Shape → Rect, Circle, Line, Text, Image etc.
```

## Documentation

- [Introduction](https://adithyavis.github.io/react-native-canvas-kit/intro)
- [Installation](https://adithyavis.github.io/react-native-canvas-kit/getting-started/installation)
  and [Quick Start](https://adithyavis.github.io/react-native-canvas-kit/getting-started/quick-start)
- [Core Concepts](https://adithyavis.github.io/react-native-canvas-kit/core-concepts/stage):
  `Stage`, `Layer`, and `Group`
- [Shapes](https://adithyavis.github.io/react-native-canvas-kit/shapes/overview) and
  [Styling](https://adithyavis.github.io/react-native-canvas-kit/styling/fill-and-stroke),
- [Gestures](https://adithyavis.github.io/react-native-canvas-kit/interactivity/drag-and-drop), [Transformers](https://adithyavis.github.io/react-native-canvas-kit/interactivity/transformer) etc
- [Brushes](https://adithyavis.github.io/react-native-canvas-kit/brushes/overview)

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
