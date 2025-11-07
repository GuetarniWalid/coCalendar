import { useSlotFormStore } from '@project/shared';
import { getCurrentLocale } from '@project/i18n';
import { TimePickerModal } from 'react-native-paper-dates';
import { TimeCircle } from './TimeCircle';
import { useTimePicker, useSlotUpdate } from '../shared/hooks';

export const SlotEndTime = () => {
  const [selectedSlot] = useSlotFormStore.selectedSlot();
  const { updateEndTime } = useSlotUpdate();
  const {
    timePickerVisible,
    displayTime,
    initialHours,
    initialMinutes,
    onConfirmTime,
    onDismissTime,
    openPicker,
  } = useTimePicker({
    initialTime: selectedSlot?.endTime,
    defaultHour: 9,
    defaultMinute: 0,
    onTimeChange: updateEndTime,
  });

  if (!selectedSlot?.endTime) return null;

  return (
    <>
      <TimeCircle time={displayTime} slotColor={selectedSlot?.color} onPress={openPicker} />

      <TimePickerModal
        visible={timePickerVisible}
        onDismiss={onDismissTime}
        onConfirm={onConfirmTime}
        locale={getCurrentLocale()}
        hours={initialHours}
        minutes={initialMinutes}
      />
    </>
  );
};
