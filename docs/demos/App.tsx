import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';
import { DEMOS } from './demos/registry';

configureReanimatedLogger({ level: ReanimatedLogLevel.warn, strict: false });

const DEFAULT_DEMO = 'quick-start-1';

function resolveDemoKey() {
  if (typeof window === 'undefined') return DEFAULT_DEMO;
  const requested = new URLSearchParams(window.location.search).get('demo');
  return requested && DEMOS[requested] ? requested : DEFAULT_DEMO;
}

export default function App() {
  const Demo = DEMOS[resolveDemoKey()]!;
  return (
    <GestureHandlerRootView style={styles.flex1}>
      <Demo />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
});
