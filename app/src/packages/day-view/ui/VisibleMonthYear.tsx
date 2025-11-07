import { FC } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Text,
  colors,
  fontSize,
  useCalendarStore,
} from '@project/shared';
import { formatMonthYear } from '@project/i18n';

export const VisibleMonthYear: FC = () => {
  const [selectedDate] = useCalendarStore.selectedDate();
  const { month, year } = formatMonthYear(selectedDate);

  return (
    <View style={styles.container}>
      <Text style={styles.month} fontWeight="700">{month}</Text>
      <Text style={styles.year} fontWeight="800">{year}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  month: {
    fontSize: fontSize.xl,
    color: colors.typography.primary,
  },
  year: {
    fontSize: fontSize.xl,
    color: colors.bottomNavigation.selector,
    marginLeft: 5,
  },
});
