import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, TextInput, Pressable } from 'react-native';
import { colors, fontSize, fontWeight } from '@project/shared';

type SlotFormTitleProps = {
  title: string;
  setTitle: (value: string) => void;
  placeholder: string;
};

export const SlotFormTitle = ({ title, setTitle, placeholder }: SlotFormTitleProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  if (!isEditing) {
    return (
      <Pressable onPress={() => setIsEditing(true)} accessibilityRole="button">
        <Text style={styles.cardTitleText} numberOfLines={2}>
          {title?.trim().length ? title : placeholder}
        </Text>
      </Pressable>
    );
  }

  return (
    <TextInput
      ref={inputRef}
      style={styles.cardTitleInput}
      value={title}
      onChangeText={setTitle}
      placeholder={placeholder}
      placeholderTextColor={colors.typography.secondary}
      returnKeyType="done"
      onSubmitEditing={() => inputRef.current?.blur()}
      onBlur={() => setIsEditing(false)}
    />
  );
};

const styles = StyleSheet.create({
  cardTitleInput: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: 8,
    color: colors.typography.primary,
    paddingVertical: 0,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  cardTitleText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: 8,
    color: colors.typography.primary,
  },
});


