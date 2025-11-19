import { FC, useState, useEffect, useRef } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import {
  fontSize,
  colors,
  fontFamily,
  useSlotFormStore,
} from '@project/shared';
import { useSlotUpdate } from '../shared/hooks';

interface SlotTitleProps {}

export const SlotTitle: FC<SlotTitleProps> = () => {
  const [selectedSlot] = useSlotFormStore.selectedSlot();
  const { updateTitle } = useSlotUpdate();
  const title = selectedSlot?.title || '';
  const [value, setValue] = useState(title);
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    setValue(title);
  }, [title]);

  const handleBlur = () => {
    setIsFocused(false);
    const trimmed = value.trim();
    if (trimmed && trimmed !== title) {
      updateTitle(trimmed);
    } else {
      setValue(title);
    }
  };

  return (
    <TextInput
      ref={inputRef}
      style={styles.title}
      value={value}
      onChangeText={setValue}
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
