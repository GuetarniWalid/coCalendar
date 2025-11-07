import { FC, useState, useEffect } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { fontSize, colors, fontFamily, useSlotFormStore } from '@project/shared';
import { useSlotUpdate } from '../shared/hooks';

export const SlotTitle: FC = () => {
  const [selectedSlot] = useSlotFormStore.selectedSlot();
  const { updateTitle } = useSlotUpdate();
  const title = selectedSlot?.title || '';
  const [value, setValue] = useState(title);
  const [isFocused, setIsFocused] = useState(false);

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

  const handleFocus = () => {
    setIsFocused(true);
  };

  return (
    <TextInput
      style={styles.title}
      value={value}
      onChangeText={setValue}
      onFocus={handleFocus}
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
