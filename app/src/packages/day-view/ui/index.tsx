import { View, StyleSheet } from 'react-native';
import {
  useFocusEffect,
} from '@react-navigation/native';
import { useCallback } from 'react';
import { useDayView } from '../shared/hooks';
import {
  setCurrentScreen,
  startTimeTracking,
  stopTimeTracking,
  useAuthStore,
  SlotItem,
  retryWithBackoff,
} from '@project/shared';
import { SlotList } from './slot-list';
import { colors } from '@project/shared';
import { VisibleMonthYear } from './VisibleMonthYear';
import { DayTasksProgress } from './DayTasksProgress';
import { DateSelector } from './DateSelector';
import { updateSlotDate } from '../data/update-slot';

export const DayViewScreen = () => {
  const { slots, loading, updateSlotCache, slotsCacheRef } = useDayView();
  const [{ supabase, user }] = useAuthStore();;

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

  // Handle slot drop to another day
  const handleSlotDropped = useCallback(
    async (slot: SlotItem, sourceDate: string, targetDate: string) => {
      if (!user || !supabase) return;

      // Update database in background with retry logic
      try {
        const dbUpdatedSlot = await retryWithBackoff(
          () => updateSlotDate(supabase, user.id, slot.id, targetDate),
          3, // max retries
          1000 // initial delay of 1 second
        );

        if (!dbUpdatedSlot) {
          // If database update fails after retries, rollback UI
          console.error(
            'Failed to update slot in database after retries, rolling back'
          );
          updateSlotCache(slot.id, targetDate, sourceDate, slot);
        }
      } catch (error) {
        console.error('Error updating slot after retries:', error);
        // Rollback on error
        updateSlotCache(slot.id, targetDate, sourceDate, slot);
      }
    },
    [user, supabase, updateSlotCache]
  );

  return (
    <>
      <View style={styles.headerRow}>
        <VisibleMonthYear />
        <DayTasksProgress slots={loading ? [] : slots} />
      </View>
      <DateSelector />
      <SlotList
        loading={loading}
        handleSlotDropped={handleSlotDropped}
        updateSlotCache={updateSlotCache}
        slotsCacheRef={slotsCacheRef}
      />
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
