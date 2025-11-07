import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { TimePickerModal } from 'react-native-paper-dates';
import {
  colors,
  SlotColorName,
  getSlotContrastColor,
  getSlotBackgroundColor,
  useSlotFormStore,
} from '@project/shared';
import { getCurrentLocale } from '@project/i18n';
import { TimeCircle } from './TimeCircle';
import { useTimePicker } from '../shared/hooks';
import { useSlotUpdate } from '../shared/hooks';

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

export const SlotStartTime = () => {
  const [selectedSlot] = useSlotFormStore.selectedSlot();
  const { updateStartTime } = useSlotUpdate();
  const {
    timePickerVisible,
    displayTime,
    initialHours,
    initialMinutes,
    onConfirmTime,
    onDismissTime,
    openPicker,
  } = useTimePicker({
    initialTime: selectedSlot?.startTime,
    defaultHour: 8,
    defaultMinute: 0,
    onTimeChange: updateStartTime,
  });

  return (
    <>
      <TimeCircle
        time={displayTime}
        slotColor={selectedSlot?.color}
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
