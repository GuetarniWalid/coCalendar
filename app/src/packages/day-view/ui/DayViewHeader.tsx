import { View, StyleSheet } from 'react-native';
import { VisibleMonthYear } from '@project/visible-month-year';
import { DayTasksProgress } from '@project/day-tasks-progress';
import { DateSelector } from '@project/date-selector';
import { colors, SlotItem } from '@project/shared';
import { HEADER_ROW_PADDING_BOTTOM } from '../constants/layout';

interface DayViewHeaderProps {
  slots: SlotItem[];
  loading: boolean;
}

export const DayViewHeader = ({ slots, loading }: DayViewHeaderProps) => {

  return (
    <>
      <View style={styles.headerRow}>
        <VisibleMonthYear />
        <DayTasksProgress slots={slots} loading={loading} />
      </View>
      <DateSelector selectedBackgroundColor={colors.action.background.primary} selectedTextColor={colors.action.typography.primary} />
    </>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
    paddingLeft: 24,
    paddingBottom: HEADER_ROW_PADDING_BOTTOM,
    backgroundColor: colors.background.primary,
  },
});
