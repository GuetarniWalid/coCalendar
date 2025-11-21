import { forwardRef, useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, TextInput, AppState, Keyboard } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fontSize, colors, useSlotFormStore } from '@project/shared';
import { useTranslation } from '@project/i18n';
import { useSlotUpdate } from '../shared/hooks';
import Animated, { useAnimatedRef } from 'react-native-reanimated';

interface SlotMessageProps {}

export const SlotMessage = forwardRef<TextInput, SlotMessageProps>((_, ref) => {
  const t = useTranslation();
  const [selectedSlot] = useSlotFormStore.selectedSlot();
  const { updateDescription } = useSlotUpdate();
  const description = selectedSlot?.description || '';
  const [value, setValue] = useState(description);
  const [isFocus, setIsFocus] = useState(false);

  const saveRef = useRef<() => void>(null);
  const containerRef = useAnimatedRef<Animated.View>();

  useEffect(() => {
    setValue(description);
  }, [description]);

  const saveDescription = () => {
    const trimmed = value.trim();
    if (trimmed !== description) {
      updateDescription(trimmed);
    }
  };

  saveRef.current = saveDescription;

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'background' || nextState === 'inactive') {
        saveRef.current?.();
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        if (isFocus && ref && typeof ref !== 'function') {
          ref.current?.blur();
        }
      }
    );

    return () => keyboardDidHideListener.remove();
  }, [isFocus]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        saveRef.current?.();
      };
    }, [])
  );

  const handleBlur = () => {
    setIsFocus(false);
    saveDescription();
  };

  return (
    <Animated.View ref={containerRef}>
      <TextInput
        ref={ref}
        style={styles.input}
        value={value}
        onChangeText={setValue}
        onBlur={handleBlur}
        onSubmitEditing={handleBlur}
        placeholder={t.addMessage}
        placeholderTextColor={colors.typography.secondary}
        textAlignVertical="top"
        spellCheck={isFocus}
        autoCorrect={isFocus}
        onFocus={() => setIsFocus(true)}
        multiline
      />
    </Animated.View>
  );
});

SlotMessage.displayName = 'SlotMessage';

const styles = StyleSheet.create({
  input: {
    fontSize: fontSize.base,
    color: colors.typography.primary,
    paddingLeft: 6,
    padding: 0,
    minHeight: 300,
  },
});
