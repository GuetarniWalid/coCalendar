import { FC } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  colors,
  fontSize,
  fontWeight,
  useCalendarStore,
} from '@project/shared';
import { formatMonthYear } from '@project/i18n';

export const VisibleMonthYear: FC = () => {
  const [selectedDate] = useCalendarStore.selectedDate();
  const { month, year } = formatMonthYear(selectedDate);

  return (
    <View style={styles.container}>
      <Text style={styles.month}>{month}</Text>
      <Text style={styles.year}>{year}</Text>
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
    fontWeight: fontWeight.bold,
    color: colors.typography.primary,
  },
  year: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.typography.secondary,
    marginLeft: 5,
  },
});
