import { View, StyleSheet } from 'react-native';
import { Text, fontSize, spacing, colors } from '@project/shared';
import { useTranslation } from '@project/i18n';

export const SlotTask = () => {
  const t = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.radioCircle} />
      <Text style={styles.text}>{t.addTask}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.typography.secondary,
    marginRight: spacing.md,
  },
  text: {
    fontSize: fontSize.base,
    color: colors.typography.secondary,
  },
});
