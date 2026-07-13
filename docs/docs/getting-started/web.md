---
sidebar_position: 3
title: Web
---

# Web

Canvas Kit runs in the browser through [React Native Skia](https://shopify.github.io/react-native-skia/docs/getting-started/web),
which ships Skia as a WebAssembly (WASM) build called **CanvasKit**.

## Install the web dependency

CanvasKit is delivered by the `canvaskit-wasm` package. Add it alongside the peer
dependencies from [Installation](./installation.md), then run Skia's web setup
script once:

```bash
npx expo install @shopify/react-native-skia
npx setup-skia-web
```

Re-run `setup-skia-web` after every upgrade of `@shopify/react-native-skia` so the
copied WASM binary matches your installed version.

For the full setup (bundler configuration, deferred registration, and other
variants), follow the
[React Native Skia web guide](https://shopify.github.io/react-native-skia/docs/getting-started/web/).
The rest of this page covers the load-order details that matter specifically for
Canvas Kit.

## Load order

Web setup, including loading CanvasKit before your app runs, is handled entirely
by React Native Skia. Follow their
[web support guide](https://shopify.github.io/react-native-skia/docs/getting-started/web/)
for `LoadSkiaWeb` / `WithSkiaWeb` and the matching bundler configuration.

One Canvas Kit-specific caveat: its shape components touch Skia at import time,
while the module tree is evaluated. You must therefore use a load-first pattern,
either a `.web` entry that loads CanvasKit before requiring your app, or Skia's
`WithSkiaWeb` component that lazily imports the drawing code. Deferring the load
to a `useEffect` is too late and will throw.

## Caveats

- **WebGL contexts are limited.** Browsers cap live WebGL contexts (around 16 per
  page), and every mounted `Stage` holds one. Keep the number of simultaneous
  stages small on web.
- **A few Skia features are unavailable on web**, including
  `PathEffectFactory.MakeSum` / `MakeCompose`, `PathFactory.MakeFromText`, and
  `ShaderFilter`. Canvas Kit does not rely on these for its core shapes, but
  custom brushes or effects that reach into Skia directly may hit them.
- **Reanimated and Gesture Handler** power dragging and gestures; make sure your
  web bundler is configured for Reanimated as described in its
  [web docs](https://docs.swmansion.com/react-native-reanimated/docs/guides/web-support/).

For the full, authoritative reference (webpack config, deferred registration
variants, and more), see the
[React Native Skia web guide](https://shopify.github.io/react-native-skia/docs/getting-started/web).
