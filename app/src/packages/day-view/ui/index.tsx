import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useDayView } from '../shared/hooks';
import { useSlotFormStore, setCurrentScreen } from '@project/shared';
import { setCalendarSelectedDate } from '@project/shared/store/calendar';
import { SlotList } from './slot-list';
import { colors, spacing, fontSize } from '@project/shared';
import { useTranslation } from '@project/i18n';
import { VisibleMonthYear } from './VisibleMonthYear';
import { DayTasksProgress } from './DayTasksProgress';
import { DateSelector } from './DateSelector';

export const DayViewScreen = () => {
  const t = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const date = route.params?.date as string;
  const { slots, loading, selectedDate, getSlotsForDate } = useDayView(date);
  if (selectedDate) setCalendarSelectedDate(selectedDate);

  // Track when this screen becomes active
  useFocusEffect(
    useCallback(() => {
      setCurrentScreen('Day');
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

  if (loading) {
    return (
      <>
        <View style={styles.headerRow}>
          <VisibleMonthYear />
          <DayTasksProgress slots={[]} selectedDate={selectedDate || ''} />
        </View>
        <DateSelector />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' />
          <Text style={styles.loadingText}>{t.loading}</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <View style={styles.headerRow}>
        <VisibleMonthYear />
        <DayTasksProgress slots={slots} selectedDate={selectedDate || ''} />
      </View>
      <DateSelector />
      <SlotList slots={slots} onSlotPress={handleSlotPress} getSlotsForDate={getSlotsForDate} />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.base,
    color: colors.typography.secondary,
  },
});
