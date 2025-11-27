import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { useSlotFormStore, getSlotContrastColor } from '@project/shared';
import { useTranslation } from '@project/i18n';
import { TimeCircle } from './TimeCircle';
import { useTimePicker } from '../shared/hooks';
import { useSlotUpdate } from '../shared/hooks';
import { isWholeDay, createWholeDayTimes } from '../shared/utils/isWholeDay';

export const SlotStartTime = () => {
  const [selectedSlot] = useSlotFormStore.selectedSlot();
  const translations = useTranslation();
  const { updateStartTime } = useSlotUpdate();

  const wholeDayTimes = createWholeDayTimes();

  // Show "Today" for:
  // 1. Slots with withoutTime = true (no specific time set)
  // 2. Slots that span the whole day (00:00 to 23:59)
  const showToday = selectedSlot?.withoutTime === true ||
    (selectedSlot?.startTime && selectedSlot?.endTime ?
      isWholeDay(selectedSlot.startTime, selectedSlot.endTime) : false);

  const {
    timePickerVisible,
    displayTime,
    timeValue,
    onConfirmTime,
    onDismissTime,
    openPicker,
  } = useTimePicker({
    // Use wholeDayTimes.startTime as fallback when slot has no time
    initialTime: selectedSlot?.startTime || wholeDayTimes.startTime,
    defaultHour: 0, // Default to midnight for whole day
    defaultMinute: 0,
    onTimeChange: updateStartTime,
  });

  const handleChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      onDismissTime();
    }

    if (selectedDate) {
      onConfirmTime(selectedDate);
    } else if (Platform.OS === 'ios') {
      onDismissTime();
    }
  };

  return (
    <>
      <TimeCircle
        time={showToday ? translations.timeToday : displayTime}
        slotColor={selectedSlot?.color}
        onPress={openPicker}
        isText={showToday}
      />
      {timePickerVisible && timeValue && (
        <DateTimePicker
          value={timeValue}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          accentColor={Platform.OS === 'ios' ? getSlotContrastColor(selectedSlot?.color) : undefined}
          design={Platform.OS === 'android' ? 'material' : undefined}
        />
      )}
    </>
  );
};
