import { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import dayjs from 'dayjs';
import { TimePickerModal } from 'react-native-paper-dates';
import {
  Text,
  colors,
  SlotColorName,
  getSlotContrastColor,
  getSlotBackgroundColor,
} from '@project/shared';
import { formatTime, getCurrentLocale } from '@project/i18n';

interface Slot {
  startTime?: string | null | undefined;
  endTime?: string | null | undefined;
  color?: SlotColorName | undefined;
}

interface SlotTimeSectionProps {
  slot?: Slot | null;
  onTimeChange?: (hours: number, minutes: number) => void;
  layout?: 'vertical' | 'horizontal';
}

const TimeCircleContent = ({ time }: { time: string }) => {
  // Check if time has AM/PM
  const hasAmPm = /\s?(AM|PM|am|pm)$/i.test(time);

  if (hasAmPm) {
    // Split time and AM/PM
    const match = time.match(/^(.+?)\s?(AM|PM|am|pm)$/i);
    if (match) {
      const [, timeValue = '', period = ''] = match;
      return (
        <View style={styles.timeWithPeriodContainer}>
          <Text style={styles.timeText} fontWeight="bold">{timeValue}</Text>
          <Text style={styles.periodText} fontWeight="bold">{period.toUpperCase()}</Text>
        </View>
      );
    }
  }

  // No AM/PM, just show the time
  return <Text style={styles.timeText} fontWeight="bold">{time}</Text>;
};

export const SlotTimeSection = ({
  slot,
  onTimeChange,
  layout = 'vertical',
}: SlotTimeSectionProps) => {
  const timeCircleBackgroundColor = getSlotBackgroundColor(slot?.color);
  const timeCircleStrokeColor = getSlotContrastColor(slot?.color);
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

  // Calculate display start time
  const defaultStartTime = formatTime(
    dayjs().hour(8).minute(0).format('YYYY-MM-DD HH:mm:ss')
  );
  const slotStartTime = slot?.startTime
    ? formatTime(slot.startTime)
    : defaultStartTime;

  const displayStartTime = selectedTime
    ? formatTime(
        dayjs()
          .hour(selectedTime.hours)
          .minute(selectedTime.minutes)
          .format('YYYY-MM-DD HH:mm:ss')
      )
    : slotStartTime;

  // Calculate display end time
  const displayEndTime = slot?.endTime ? formatTime(slot.endTime) : null;

  // Parse initial time for picker
  const initialTime = slot?.startTime
    ? dayjs(slot.startTime, 'YYYY-MM-DD HH:mm:ss')
    : dayjs().hour(8).minute(0);
  const initialHours = initialTime.isValid() ? initialTime.hour() : 8;
  const initialMinutes = initialTime.isValid() ? initialTime.minute() : 0;

  if (layout === 'horizontal') {
    return (
      <>
        {/* Start Time Circle */}
        <Pressable onPress={() => setTimePickerVisible(true)}>
          <View
            style={[styles.timeCircle, { backgroundColor: timeCircleBackgroundColor, borderColor: timeCircleStrokeColor }]}
          >
            <TimeCircleContent time={displayStartTime} />
          </View>
        </Pressable>

        {/* End Time Circle */}
        {displayEndTime && (
          <View
            style={[styles.timeCircle, { backgroundColor: timeCircleBackgroundColor, borderColor: timeCircleStrokeColor }]}
          >
            <TimeCircleContent time={displayEndTime} />
          </View>
        )}

        <TimePickerModal
          visible={timePickerVisible}
          onDismiss={onDismissTime}
          onConfirm={onConfirmTime}
          locale={getCurrentLocale()}
          hours={selectedTime?.hours ?? initialHours}
          minutes={selectedTime?.minutes ?? initialMinutes}
        />
      </>
    );
  }

  return (
    <View style={styles.container}>
      {/* Start Time Circle */}
      <Pressable onPress={() => setTimePickerVisible(true)}>
        <View
          style={[styles.timeCircle, { backgroundColor: timeCircleBackgroundColor }]}
        >
          <TimeCircleContent time={displayStartTime} />
        </View>
      </Pressable>

      {/* End Time Circle */}
      {displayEndTime && (
        <View
          style={[styles.timeCircle, { backgroundColor: timeCircleBackgroundColor }]}
        >
          <TimeCircleContent time={displayEndTime} />
        </View>
      )}

      <TimePickerModal
        visible={timePickerVisible}
        onDismiss={onDismissTime}
        onConfirm={onConfirmTime}
        locale={getCurrentLocale()}
        hours={selectedTime?.hours ?? initialHours}
        minutes={selectedTime?.minutes ?? initialMinutes}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
  },
  timeCircle: {
    width: 95,
    height: 95,
    borderRadius: 999,
    justifyContent: 'center',
    borderWidth: 1,
  },
  timeWithPeriodContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 19,
    color: colors.typography.primary,
  },
  periodText: {
    fontSize: 10,
    color: colors.typography.primary,
  },
});
