import { forwardRef } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { fontSize, colors } from '@project/shared';
import { useTranslation } from '@project/i18n';

export const SlotMessage = forwardRef<TextInput>((props, ref) => {
  const t = useTranslation();
  return (
    <TextInput
      ref={ref}
      style={styles.input}
      placeholder={t.addMessage}
      placeholderTextColor={colors.typography.secondary}
      multiline
    />
  );
});

SlotMessage.displayName = 'SlotMessage';

const styles = StyleSheet.create({
  input: {
    fontSize: fontSize.base,
    color: colors.typography.primary,
    paddingLeft: 6,
    padding: 0,
  },
});
