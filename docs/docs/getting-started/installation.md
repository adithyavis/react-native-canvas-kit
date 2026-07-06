---
sidebar_position: 1
title: Installation
---

# Installation

React Native Canvas Kit renders with [React Native Skia](https://shopify.github.io/react-native-skia/)
and drives its gestures with [Reanimated](https://docs.swmansion.com/react-native-reanimated/)
and [Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/).
These are **peer dependencies**: install them alongside the library.

## Install

```bash
# with expo
npx expo install react-native-canvas-kit @shopify/react-native-skia react-native-gesture-handler react-native-reanimated

# with npm
npm install react-native-canvas-kit @shopify/react-native-skia react-native-gesture-handler react-native-reanimated

# with yarn
yarn add react-native-canvas-kit @shopify/react-native-skia react-native-gesture-handler react-native-reanimated
```

### Peer dependency versions

| Package                        | Version    |
| ------------------------------ | ---------- |
| `@shopify/react-native-skia`   | `>= 1.0.0` |
| `react-native-gesture-handler` | `>= 2.0.0` |
| `react-native-reanimated`      | `^3.0.0`   |

Canvas Kit ships no native code of its own, so it runs wherever these peers run,
including both React Native's New Architecture and the legacy architecture.

## Configure Reanimated

Add the Reanimated Babel plugin to `babel.config.js` **as the last plugin**:

```js title="babel.config.js"
module.exports = {
  presets: ['babel-preset-expo'], // or 'module:@react-native/babel-preset'
  plugins: [
    // ...other plugins
    'react-native-reanimated/plugin', // must be last
  ],
};
```

> If you use `babel-preset-expo` (SDK 50+), the Reanimated plugin is included
> automatically, so you can skip this step.

## Wrap your app in `GestureHandlerRootView`

Gesture Handler requires a root view at the top of your tree. Wrap your app
once:

```tsx title="App.tsx"
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* your canvas + screens */}
    </GestureHandlerRootView>
  );
}
```

## Rebuild the app

Skia, Reanimated, and Gesture Handler include native code, so after installing
you must rebuild; a fast-refresh reload is not enough:

```bash
npx expo prebuild        # if using a bare/expo-dev-client workflow
npx expo run:ios         # or run:android
```

You're ready. Head to the [Quick Start](./quick-start.md).
