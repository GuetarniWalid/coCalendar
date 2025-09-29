import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useDayView } from '../shared/hooks';
import { useSlotFormStore, setCurrentScreen, startTimeTracking, stopTimeTracking } from '@project/shared';
import { setCalendarSelectedDate } from '@project/shared/store/calendar';
import { SlotList } from './slot-list';
import { colors } from '@project/shared';
import { VisibleMonthYear } from './VisibleMonthYear';
import { DayTasksProgress } from './DayTasksProgress';
import { DateSelector } from './DateSelector';

export const DayViewScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const date = route.params?.date as string;
  const { slots, loading, selectedDate, getSlotsForDate } = useDayView(date);
  if (selectedDate) setCalendarSelectedDate(selectedDate);

  // Track when this screen becomes active and manage time tracking
  useFocusEffect(
    useCallback(() => {
      setCurrentScreen('Day');
      // Start real-time tracking when day view is focused
      startTimeTracking();
      
      return () => {
        // Stop real-time tracking when day view is unfocused
        stopTimeTracking();
      };
    }, [])
  );

  // Get setters from Teaful store
  const [, setSelectedDate] = useSlotFormStore.selectedDate();
  const [, setSelectedSlot] = useSlotFormStore.selectedSlot();

  const handleSlotPress = (slot: any) => {
    if (slot.id === 'default-slot') {
      // Set data in Teaful store for new slot creation
      setSelectedDate(selectedDate);
      setSelectedSlot({
        id: null,
        title: '',
        startTime: slot.startTime,
        endTime: slot.endTime,
        visibility: 'private',
      });
      navigation.navigate('SlotForm');
    } else {
      // Set data in Teaful store for editing existing slot
      setSelectedDate(selectedDate);
      setSelectedSlot({
        id: slot.id,
        title: slot.title,
        startTime: slot.startTime,
        endTime: slot.endTime,
        visibility: slot.visibility ?? (slot.type === 'shared' ? 'public' : 'private'),
        ...(slot.description ? { description: slot.description } : {}),
        ...(slot.clientName ? { clientName: slot.clientName } : {}),
        ...(slot.color ? { color: slot.color } : {}),
      });
      navigation.navigate('SlotForm');
    }
  };

  return (
    <>
      <View style={styles.headerRow}>
        <VisibleMonthYear />
        <DayTasksProgress slots={loading ? [] : slots} selectedDate={selectedDate || ''} />
      </View>
      <DateSelector />
      <SlotList slots={slots} onSlotPress={handleSlotPress} getSlotsForDate={getSlotsForDate} loading={loading} selectedDate={selectedDate || ''} />
    </>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
    paddingLeft: 24,
    paddingBottom: 8,
    backgroundColor: colors.background.primary,
  },
});
