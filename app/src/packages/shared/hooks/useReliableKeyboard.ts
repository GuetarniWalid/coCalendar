import { useEffect } from 'react';
import { Keyboard, AppState, Platform } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';

export const useReliableKeyboard = () => {
  const height = useSharedValue(0);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        height.value = withTiming(event.endCoordinates.height, {
          duration: Platform.OS === 'ios' ? 250 : 200,
        });
      }
    );

    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        height.value = withTiming(0, {
          duration: Platform.OS === 'ios' ? 250 : 200,
        });
      }
    );

    const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        height.value = 0;
      }
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
      appStateSubscription.remove();
    };
  }, []);

  return { height };
};
