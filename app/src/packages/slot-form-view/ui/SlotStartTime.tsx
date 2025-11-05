import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { TimePickerModal } from 'react-native-paper-dates';
import {
  colors,
  SlotColorName,
  getSlotContrastColor,
  getSlotBackgroundColor,
} from '@project/shared';
import { getCurrentLocale } from '@project/i18n';
import { TimeCircle } from './TimeCircle';
import { useTimePicker } from '../shared/hooks';

interface Slot {
  startTime?: string | null | undefined;
  color?: SlotColorName | undefined;
}

interface SlotStartTimeProps {
  slot?: Slot | null;
  onTimeChange?: (hours: number, minutes: number) => void;
}

export { PaperProvider, MD3LightTheme };

export const getTimePickerTheme = (slotColor?: SlotColorName | undefined) => {
  const slotContrastColor = getSlotContrastColor(slotColor);
  const slotBackgroundColor = getSlotBackgroundColor(slotColor);

  return {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: slotContrastColor,
      primaryContainer: slotBackgroundColor,
      onPrimaryContainer: colors.background.primary,
      onPrimary: colors.background.primary,
      onSurface: slotContrastColor,
      onSurfaceVariant: slotContrastColor,
      surfaceVariant: slotBackgroundColor,
      secondaryContainer: slotContrastColor,
      surface: colors.background.primary,
      outline: slotContrastColor,
      onBackground: slotContrastColor,
    },
  };
};

export const SlotStartTime = ({ slot, onTimeChange }: SlotStartTimeProps) => {
  const {
    timePickerVisible,
    displayTime,
    initialHours,
    initialMinutes,
    onConfirmTime,
    onDismissTime,
    openPicker,
  } = useTimePicker({
    initialTime: slot?.startTime,
    defaultHour: 8,
    defaultMinute: 0,
    onTimeChange,
  });

  return (
    <>
      <TimeCircle
        time={displayTime}
        slotColor={slot?.color}
        onPress={openPicker}
      />

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
