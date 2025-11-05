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
  const [selectedTime, setSelectedTime] = useState<{
    hours: number;
    minutes: number;
  } | null>(null);

  const onConfirmTime = useCallback(
    ({ hours, minutes }: { hours: number; minutes: number }) => {
      setSelectedTime({ hours, minutes });
      setTimePickerVisible(false);
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
        dayjs()
          .hour(selectedTime.hours)
          .minute(selectedTime.minutes)
          .format('YYYY-MM-DD HH:mm:ss')
      )
    : slotTime;

  const parsedInitialTime = initialTime
    ? dayjs(initialTime, 'YYYY-MM-DD HH:mm:ss')
    : dayjs().hour(defaultHour).minute(defaultMinute);

  const initialHours = parsedInitialTime.isValid()
    ? parsedInitialTime.hour()
    : defaultHour;

  const initialMinutes = parsedInitialTime.isValid()
    ? parsedInitialTime.minute()
    : defaultMinute;

  const openPicker = useCallback(() => {
    setTimePickerVisible(true);
  }, []);

  return {
    timePickerVisible,
    displayTime,
    initialHours: selectedTime?.hours ?? initialHours,
    initialMinutes: selectedTime?.minutes ?? initialMinutes,
    onConfirmTime,
    onDismissTime,
    openPicker,
  };
};
