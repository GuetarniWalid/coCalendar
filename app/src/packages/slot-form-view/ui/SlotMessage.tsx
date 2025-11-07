
import { StyleSheet } from 'react-native';
import { Text, fontSize, colors } from '@project/shared';
import { useTranslation } from '@project/i18n';

export const SlotMessage = () => {
  const t = useTranslation();
  return <Text style={styles.text}>{t.addMessage}</Text>;
};

const styles = StyleSheet.create({
  text: {
    fontSize: fontSize.base,
    color: colors.typography.secondary,
    paddingLeft: 6,
  },
});
