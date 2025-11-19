import { useEffect } from 'react';
import { Keyboard, AppState, Platform } from 'react-native';
import { useSharedValue, withTiming, cancelAnimation, SharedValue } from 'react-native-reanimated';

export type KeyboardState = 'hidden' | 'transitioning' | 'shown';

let globalKeyboardHeight: SharedValue<number> | null = null;
let globalKeyboardState: SharedValue<KeyboardState> | null = null;
let listenersInitialized = false;

const initializeKeyboardListeners = (height: SharedValue<number>, state: SharedValue<KeyboardState>) => {
  if (listenersInitialized) return;
  listenersInitialized = true;

  const animationDuration = Platform.OS === 'ios' ? 250 : 200;

  Keyboard.addListener(
    Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
    (event) => {
      cancelAnimation(height);
      state.value = 'transitioning';

      height.value = withTiming(
        event.endCoordinates.height,
        { duration: animationDuration },
        (finished) => {
          if (finished) {
            state.value = 'shown';
          }
        }
      );
    }
  );

  Keyboard.addListener(
    Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
    () => {
      cancelAnimation(height);
      state.value = 'transitioning';

      height.value = withTiming(
        0,
        { duration: animationDuration },
        (finished) => {
          if (finished) {
            state.value = 'hidden';
          }
        }
      );
    }
  );

  Keyboard.addListener(
    'keyboardDidChangeFrame',
    (event) => {
      if (event.endCoordinates.height > 0 && state.value === 'hidden') {
        state.value = 'shown';
        height.value = event.endCoordinates.height;
      }
    }
  );

  AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      height.value = 0;
      state.value = 'hidden';
    }
  });
};

export const useReliableKeyboard = () => {
  const height = useSharedValue(0);
  const state = useSharedValue<KeyboardState>('hidden');

  if (!globalKeyboardHeight) {
    globalKeyboardHeight = height;
    globalKeyboardState = state;
  }

  useEffect(() => {
    if (globalKeyboardHeight && globalKeyboardState) {
      initializeKeyboardListeners(globalKeyboardHeight, globalKeyboardState);
    }
  }, []);

  return { height: globalKeyboardHeight!, state: globalKeyboardState! };
};
