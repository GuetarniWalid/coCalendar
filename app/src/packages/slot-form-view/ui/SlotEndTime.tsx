import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { useSlotFormStore, getSlotContrastColor } from '@project/shared';
import { formatDuration } from '@project/i18n';
import { TimeCircle } from './TimeCircle';
import { useTimePicker, useSlotUpdate } from '../shared/hooks';

export const SlotEndTime = () => {
  const [selectedSlot] = useSlotFormStore.selectedSlot();
  const { updateEndTime } = useSlotUpdate();
  const {
    timePickerVisible,
    displayTime,
    timeValue,
    onConfirmTime,
    onDismissTime,
    openPicker,
  } = useTimePicker({
    initialTime: selectedSlot?.endTime,
    defaultHour: 9,
    defaultMinute: 0,
    onTimeChange: updateEndTime,
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

  if (!selectedSlot?.endTime) return null;

  // Calculate duration between start and end times
  const duration = formatDuration(selectedSlot?.startTime, selectedSlot?.endTime);

  return (
    <>
      <TimeCircle time={duration || displayTime} slotColor={selectedSlot?.color} onPress={openPicker} />

      {timePickerVisible && (
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
