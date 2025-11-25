import { View, StyleSheet } from 'react-native';
import { VisibleMonthYear } from '@project/visible-month-year';
import { DAY_TASKS_PROGRESS_SIZE } from '@project/day-tasks-progress';
import { DateSelector } from '@project/date-selector';
import { colors, useSlotFormStore } from '@project/shared';
import { HEADER_ROW_PADDING_BOTTOM } from '@project/day-view';

export const SlotFormHeader = () => {
  const [selectedSlot] = useSlotFormStore.selectedSlot();

  return (
    <>
      <View style={styles.headerRow}>
        <VisibleMonthYear />
      </View>
      <DateSelector selectedBackgroundColor={selectedSlot?.color ?? colors.background.slot.default!.default} selectedTextColor={selectedSlot?.color ?? colors.typography.primary} />
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
    height: DAY_TASKS_PROGRESS_SIZE + HEADER_ROW_PADDING_BOTTOM,
  },
});
