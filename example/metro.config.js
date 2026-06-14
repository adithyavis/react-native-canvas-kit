const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withMetroConfig } = require('react-native-monorepo-config');

const root = path.resolve(__dirname, '..');

/**
 * Expo Metro configuration for this Yarn-workspace monorepo.
 *
 * `withMetroConfig` (react-native-monorepo-config) layers the monorepo
 * resolution on top of Expo's defaults: it watches the repo root, dedupes the
 * library's peer deps, and — crucially — maps the (unsymlinked) workspace root
 * package `react-native-canvas-kit` to its `source` export (../src), so the
 * example consumes the library's TypeScript source directly with live reload.
 *
 * https://docs.expo.dev/guides/monorepos/
 *
 * @type {import('expo/metro-config').MetroConfig}
 */
const config = withMetroConfig(getDefaultConfig(__dirname), {
  root,
  dirname: __dirname,
});

module.exports = config;
