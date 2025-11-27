import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform, View, StyleSheet } from 'react-native';
import { useSlotFormStore, getSlotContrastColor, useThemeStore, getSlotBackgroundColor } from '@project/shared';
import { formatDuration } from '@project/i18n';
import { Stopwatch } from '@project/icons';
import { TimeCircle } from './TimeCircle';
import { useTimePicker, useSlotUpdate } from '../shared/hooks';
import { isWholeDay } from '../shared/utils/isWholeDay';

export const SlotEndTime = () => {
  const [selectedSlot] = useSlotFormStore.selectedSlot();
  const [{ colors }] = useThemeStore();
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

  // Hide component for:
  // 1. Slots with withoutTime = true (no specific time set)
  // 2. Slots that span the whole day (00:00 to 23:59)
  const shouldHide = selectedSlot?.withoutTime === true ||
    (selectedSlot?.startTime && selectedSlot?.endTime ?
      isWholeDay(selectedSlot.startTime, selectedSlot.endTime) : false);

  // Hide component if slot has no time or is whole day
  if (shouldHide) return null;

  // Show clock icon if endTime is null (but not for new/whole day slots)
  if (!selectedSlot?.endTime) {
    const backgroundColor = getSlotBackgroundColor(selectedSlot?.color);

    return (
      <View
        style={[
          styles.clockCircle,
          {
            borderColor: backgroundColor,
            backgroundColor: colors.background.primary,
          },
        ]}
      >
        <View style={styles.overlay} />
        <Stopwatch size={35} color={backgroundColor} />
      </View>
    );
  }

  // Calculate duration between start and end times
  const duration = formatDuration(selectedSlot?.startTime, selectedSlot?.endTime);

  return (
    <>
      <TimeCircle time={duration || displayTime} slotColor={selectedSlot?.color} onPress={openPicker} />

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

const styles = StyleSheet.create({
  clockCircle: {
    width: 90,
    height: 90,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 4,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 999,
  },
});
