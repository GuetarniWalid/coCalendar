import { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { VisibleMonthYear } from '@project/visible-month-year';
import { DAY_TASKS_PROGRESS_SIZE } from '@project/day-tasks-progress';
import { DateSelector } from '@project/date-selector';
import {
  colors,
  useSlotFormStore,
  useCalendarStore,
  getSlotBackgroundColor,
} from '@project/shared';
import { HEADER_ROW_PADDING_BOTTOM } from '@project/day-view';
import { useSlotUpdate } from '../shared/hooks/useSlotUpdate';
import dayjs from 'dayjs';

export const SlotFormHeader = () => {
  const [selectedSlot] = useSlotFormStore.selectedSlot();
  const [selectedDate] = useCalendarStore.selectedDate();
  const [changeAskedBy] = useCalendarStore.changeAskedBy();
  const { updateSlotDate } = useSlotUpdate();
  const previousDateRef = useRef<string>(selectedDate);

  // Listen for date changes from the DateSelector
  useEffect(() => {
    // Only process if the change was initiated by the DateSelector and we have a selected slot
    if (
      changeAskedBy === 'dateSelector' &&
      selectedSlot &&
      selectedDate !== previousDateRef.current
    ) {
      // Extract the current date from the slot's startTime
      const currentSlotDate = selectedSlot.startTime
        ? dayjs(selectedSlot.startTime).format('YYYY-MM-DD')
        : previousDateRef.current;

      // Only update if the date has actually changed from the slot's current date
      if (selectedDate !== currentSlotDate) {
        updateSlotDate(selectedDate);
      }

      previousDateRef.current = selectedDate;
    }
  }, [selectedDate, changeAskedBy, selectedSlot, updateSlotDate]);

  const selectedBackgroundColor = selectedSlot?.color
    ? getSlotBackgroundColor(selectedSlot.color)
    : colors.background.slot.default!.default;

  return (
    <>
      <View style={styles.headerRow}>
        <VisibleMonthYear />
      </View>
      <DateSelector
        selectedBackgroundColor={selectedBackgroundColor}
        selectedTextColor={colors.typography.primary}
      />
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
