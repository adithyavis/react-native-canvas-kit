import { registerRootComponent } from 'expo';
import App from './src/App';

// Expo native entry point. `registerRootComponent` calls
// `AppRegistry.registerComponent('main', () => App)` and wires up the root view
// for the iOS/Android dev client and standalone builds.
//
// Web is served separately by Vite — see index.web.js / index.html.
registerRootComponent(App);
