import { AppRegistry } from 'react-native';
import App from './src/App';

// Web entry point, loaded by Vite via index.html. Kept separate from the Expo
// native entry (index.js) so the Vite bundle does not pull in the `expo`
// runtime. Skia draws into its CanvasKit surface; react-native-web supplies the
// RN primitives.
AppRegistry.registerComponent('main', () => App);
AppRegistry.runApplication('main', {
  rootTag: document.getElementById('root'),
});
