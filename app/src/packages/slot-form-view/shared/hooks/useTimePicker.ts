import { useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { formatTime } from '@project/i18n';

interface UseTimePickerProps {
  initialTime?: string | null | undefined;
  defaultHour?: number;
  defaultMinute?: number;
  onTimeChange?: ((hours: number, minutes: number) => void) | undefined;
}

export const useTimePicker = ({
  initialTime,
  defaultHour = 8,
  defaultMinute = 0,
  onTimeChange,
}: UseTimePickerProps) => {
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);

  const parsedInitialTime = initialTime
    ? dayjs(initialTime, 'YYYY-MM-DD HH:mm:ss')
    : dayjs().hour(defaultHour).minute(defaultMinute);

  const initialDate = parsedInitialTime.isValid()
    ? parsedInitialTime.toDate()
    : dayjs().hour(defaultHour).minute(defaultMinute).toDate();

  const timeValue = selectedTime ?? initialDate;

  const onConfirmTime = useCallback(
    (date: Date) => {
      setSelectedTime(date);
      setTimePickerVisible(false);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      onTimeChange?.(hours, minutes);
    },
    [onTimeChange]
  );

  const onDismissTime = useCallback(() => {
    setTimePickerVisible(false);
  }, []);

  const defaultTime = formatTime(
    dayjs().hour(defaultHour).minute(defaultMinute).format('YYYY-MM-DD HH:mm:ss')
  );

  const slotTime = initialTime ? formatTime(initialTime) : defaultTime;

  const displayTime = selectedTime
    ? formatTime(
        dayjs(selectedTime).format('YYYY-MM-DD HH:mm:ss')
      )
    : slotTime;

  const openPicker = useCallback(() => {
    setTimePickerVisible(true);
  }, []);

  return {
    timePickerVisible,
    displayTime,
    timeValue,
    onConfirmTime,
    onDismissTime,
    openPicker,
  };
};
