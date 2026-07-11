import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';
import canvaskit from 'canvaskit-wasm/package.json';

LoadSkiaWeb({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/canvaskit-wasm@${canvaskit.version}/bin/full/${file}`,
}).then(() => {
  const { registerRootComponent } = require('expo');
  const App = require('./App').default;
  registerRootComponent(App);
});
