import { SlotColorName } from '@project/shared';
import { getCurrentLocale } from '@project/i18n';
import { TimePickerModal } from 'react-native-paper-dates';
import { TimeCircle } from './TimeCircle';
import { useTimePicker } from '../shared/hooks';

interface SlotEndTimeProps {
  endTime?: string | null | undefined;
  slotColor?: SlotColorName | undefined;
  onTimeChange?: (hours: number, minutes: number) => void;
}

export const SlotEndTime = ({
  endTime,
  slotColor,
  onTimeChange,
}: SlotEndTimeProps) => {
  const {
    timePickerVisible,
    displayTime,
    initialHours,
    initialMinutes,
    onConfirmTime,
    onDismissTime,
    openPicker,
  } = useTimePicker({
    initialTime: endTime,
    defaultHour: 9,
    defaultMinute: 0,
    onTimeChange,
  });

  if (!endTime) return null;

  return (
    <>
      <TimeCircle time={displayTime} slotColor={slotColor} onPress={openPicker} />

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
