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

  // Check if this is a new slot (no selectedSlot)
  const isNewSlot = !selectedSlot;
  const wholeDayTimes = createWholeDayTimes();

  // Only show "Today" if the slot truly spans the whole day (00:00 to 23:59)
  // Not when we have a specific startTime with null endTime
  const isWholeDaySlot = isNewSlot ?
    true : // New slots default to whole day
    (selectedSlot?.endTime ?
      isWholeDay(selectedSlot.startTime, selectedSlot.endTime) :
      false); // If endTime is null, show actual start time, not "Today"

  const {
    timePickerVisible,
    displayTime,
    timeValue,
    onConfirmTime,
    onDismissTime,
    openPicker,
  } = useTimePicker({
    initialTime: isNewSlot ? wholeDayTimes.startTime : selectedSlot?.startTime,
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
        time={isWholeDaySlot ? translations.timeToday : displayTime}
        slotColor={selectedSlot?.color}
        onPress={openPicker}
        isText={isWholeDaySlot}
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
