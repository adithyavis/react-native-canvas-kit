This is the [**Expo**](https://expo.dev) example app for `react-native-canvas-kit`,
using the **managed** workflow (Continuous Native Generation — no checked-in
`android/` or `ios/` folders).

> **Note:** `@shopify/react-native-skia` is a native module, so it is **not**
> available in Expo Go. You need a **development build** (dev client). The
> `ios`/`android` commands below build one for you.

Run all commands from this `example/` directory (or from the repo root prefixed
with `yarn example`, e.g. `yarn example ios`).

# Getting Started

## Step 1: Start the Metro dev server

Metro is the JavaScript bundler. Start it with:

```sh
yarn start
```

This runs `expo start --dev-client`. Leave it running, then launch the app on a
device/simulator (Step 2). If you already have a dev build installed, you can
launch it straight from this server.

## Step 2: Build and run a development build

The first run generates the native project (via `expo prebuild`), compiles a dev
build, and installs it on your simulator/device:

### iOS

```sh
yarn ios
```

### Android

```sh
yarn android
```

CocoaPods/Gradle are handled automatically by `expo run:*` — no manual
`bundle exec pod install` step. To regenerate the native projects explicitly
(e.g. after changing `app.json` or adding a native dependency):

```sh
yarn prebuild
```

> The generated `android/` and `ios/` folders are disposable build artifacts and
> are not committed. The New Architecture is **off** by default
> (`newArchEnabled` in `app.json`); flip it to `true` to test the new arch.

## Step 3: Modify the app

Edit `src/App.tsx` and save — [Fast Refresh](https://docs.expo.dev/develop/development-builds/use-development-builds/)
updates the running app. Because this lives in the library's monorepo, edits to
the library source in `../src` are picked up and hot-reloaded too.

# Learn More

- [Expo documentation](https://docs.expo.dev/)
- [Development builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [Expo in a monorepo](https://docs.expo.dev/guides/monorepos/)
- [`@shopify/react-native-skia`](https://shopify.github.io/react-native-skia/)
