import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';
import { Drawer } from 'expo-router/drawer';
import { StyleSheet } from 'react-native';

configureReanimatedLogger({ level: ReanimatedLogLevel.warn, strict: false });

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.flex1}>
      <Drawer screenOptions={{ headerShown: false, swipeEnabled: false }}>
        <Drawer.Screen
          name="index"
          options={{ drawerLabel: 'Shapes', title: 'Shapes' }}
        />
        <Drawer.Screen
          name="brushes"
          options={{ drawerLabel: 'Brushes', title: 'Brushes' }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
});
