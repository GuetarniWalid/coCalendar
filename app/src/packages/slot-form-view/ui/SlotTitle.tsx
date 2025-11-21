import { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, TextInput, AppState, Keyboard } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  fontSize,
  colors,
  fontFamily,
  useSlotFormStore,
} from '@project/shared';
import { useSlotUpdate } from '../shared/hooks';

export const SlotTitle = () => {
  const [selectedSlot] = useSlotFormStore.selectedSlot();
  const { updateTitle } = useSlotUpdate();
  const title = selectedSlot?.title || '';
  const [value, setValue] = useState(title);
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const saveRef = useRef<() => void>(null);

  useEffect(() => {
    setValue(title);
  }, [title]);

  const saveTitle = () => {
    const trimmed = value.trim();
    if (trimmed && trimmed !== title) {
      updateTitle(trimmed);
    } else if (!trimmed && title) {
      setValue(title);
    }
  };

  saveRef.current = saveTitle;

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background' || nextState === 'inactive') {
        saveRef.current?.();
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      if (isFocused) {
        inputRef.current?.blur();
      }
    });

    return () => keyboardDidHideListener.remove();
  }, [isFocused]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        saveRef.current?.();
      };
    }, [])
  );

  const handleBlur = () => {
    setIsFocused(false);
    saveTitle();
  };

  return (
    <TextInput
      ref={inputRef}
      style={styles.title}
      value={value}
      onChangeText={setValue}
      onFocus={() => setIsFocused(true)}
      onBlur={handleBlur}
      onSubmitEditing={handleBlur}
      spellCheck={isFocused}
      autoCorrect={isFocused}
      multiline
      submitBehavior="blurAndSubmit"
      returnKeyType="done"
    />
  );
};

const styles = StyleSheet.create({
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['2xl'],
    color: colors.typography.primary,
    marginBottom: 30,
    padding: 0,
  },
});
