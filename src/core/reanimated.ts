import type { SharedValue } from 'react-native-reanimated';

export const createSharedValue = <T>(value: T) => {
  return { value } as SharedValue<T>;
};
