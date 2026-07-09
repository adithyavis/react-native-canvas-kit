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
npx expo install react-native-canvas-kit @shopify/react-native-skia react-native-gesture-handler react-native-reanimated react-native-worklets

# with npm
npm install react-native-canvas-kit @shopify/react-native-skia react-native-gesture-handler react-native-reanimated react-native-worklets

# with yarn
yarn add react-native-canvas-kit @shopify/react-native-skia react-native-gesture-handler react-native-reanimated react-native-worklets
```

### Peer dependency versions

| Package                        | Version    |
| ------------------------------ | ---------- |
| `@shopify/react-native-skia`   | `>= 1.0.0` |
| `react-native-gesture-handler` | `>= 2.0.0` |
| `react-native-reanimated`      | `^4.0.0`   |
| `react-native-worklets`        | `>= 0.5.0` |

Reanimated 4 ships its worklet runtime in the separate `react-native-worklets`
package, so install it alongside Reanimated.

Canvas Kit ships no native code of its own, but Reanimated 4 requires React
Native's **New Architecture**, so v1 runs on the New Architecture only. If you
are still on the legacy architecture, stay on Canvas Kit `0.x` (Reanimated 3):
switch the docs to the **0.x** version using the dropdown in the top bar.

## Configure Reanimated

Reanimated 4 moved its Babel plugin into `react-native-worklets`. Add it to
`babel.config.js` **as the last plugin**:

```js title="babel.config.js"
module.exports = {
  presets: ['babel-preset-expo'], // or 'module:@react-native/babel-preset'
  plugins: [
    // ...other plugins
    'react-native-worklets/plugin', // must be last
  ],
};
```

> If you use `babel-preset-expo` (SDK 54+), the worklets plugin is included
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
