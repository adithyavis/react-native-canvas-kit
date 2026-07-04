import { Pressable, StyleSheet, Text } from 'react-native';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';

export function DrawerButton() {
  const navigation = useNavigation();
  return (
    <Pressable
      style={styles.button}
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      hitSlop={8}
    >
      <Text style={styles.icon}>☰</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 52,
    left: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  icon: {
    fontSize: 22,
    color: '#1b0030',
  },
});
