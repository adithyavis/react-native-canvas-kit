import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';
import { Drawer } from 'expo-router/drawer';
import {
  DrawerContentScrollView,
  DrawerItem,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { StyleSheet, View } from 'react-native';

configureReanimatedLogger({ level: ReanimatedLogLevel.warn, strict: false });

const DIVIDER_AFTER = 'portal';

function DrawerContent(props: DrawerContentComponentProps) {
  const { state, descriptors, navigation } = props;
  return (
    <DrawerContentScrollView {...props}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          typeof options.drawerLabel === 'string'
            ? options.drawerLabel
            : (options.title ?? route.name);
        return (
          <View key={route.key}>
            <DrawerItem
              label={label}
              focused={index === state.index}
              onPress={() => navigation.navigate(route.name)}
            />
            {route.name === DIVIDER_AFTER ? (
              <View style={styles.divider} />
            ) : null}
          </View>
        );
      })}
    </DrawerContentScrollView>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.flex1}>
      <Drawer
        drawerContent={(props) => <DrawerContent {...props} />}
        screenOptions={{ headerShown: false, swipeEnabled: false }}
      >
        <Drawer.Screen
          name="index"
          options={{ drawerLabel: 'Shapes', title: 'Shapes' }}
        />
        <Drawer.Screen
          name="brushes"
          options={{ drawerLabel: 'Brushes', title: 'Brushes' }}
        />
        <Drawer.Screen
          name="portal"
          options={{ drawerLabel: 'Portal', title: 'Portal' }}
        />

        <Drawer.Screen
          name="canva"
          options={{ drawerLabel: 'Canva', title: 'Canva' }}
        />
        <Drawer.Screen
          name="instagram-crop"
          options={{ drawerLabel: 'Instagram Crop', title: 'Instagram Crop' }}
        />
        <Drawer.Screen
          name="docusign"
          options={{ drawerLabel: 'DocuSign', title: 'DocuSign' }}
        />
        <Drawer.Screen
          name="gpay-scratch-card"
          options={{
            drawerLabel: 'GPay Scratch Card',
            title: 'GPay Scratch Card',
          }}
        />
        <Drawer.Screen
          name="snapseed"
          options={{ drawerLabel: 'Snapseed', title: 'Snapseed' }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  divider: {
    height: 1,
    backgroundColor: '#00000022',
    marginVertical: 8,
    marginHorizontal: 16,
  },
});
