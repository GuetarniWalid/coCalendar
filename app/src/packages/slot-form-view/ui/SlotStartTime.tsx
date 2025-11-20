import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { useSlotFormStore, getSlotContrastColor } from '@project/shared';
import { TimeCircle } from './TimeCircle';
import { useTimePicker } from '../shared/hooks';
import { useSlotUpdate } from '../shared/hooks';

export const SlotStartTime = () => {
  const [selectedSlot] = useSlotFormStore.selectedSlot();
  const { updateStartTime } = useSlotUpdate();
  const {
    timePickerVisible,
    displayTime,
    timeValue,
    onConfirmTime,
    onDismissTime,
    openPicker,
  } = useTimePicker({
    initialTime: selectedSlot?.startTime,
    defaultHour: 8,
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
        time={displayTime}
        slotColor={selectedSlot?.color}
        onPress={openPicker}
      />

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
