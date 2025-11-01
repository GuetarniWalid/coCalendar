import { Check } from '@project/icons';
import { colors } from '@project/shared';
import { StyleSheet, View } from 'react-native';

export const CheckButton = () => {
  return <View style={styles.container}>
    <Check color={colors.background.primary} size={35} />
  </View>;
};

const styles = StyleSheet.create({
  container: {
    width: '42%',
    height: 120,
    backgroundColor: colors.success,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
