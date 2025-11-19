import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useDayView } from '../shared/hooks';
import { useAuthStore, SlotItem, retryWithBackoff, setCurrentScreen, updateSlotCache } from '@project/shared';
import { SlotList } from './slot-list';
import { updateSlotDate } from '../data/update-slot';

export const DayViewScreen = () => {
  useFocusEffect(
    useCallback(() => {
      setCurrentScreen('Day');
    }, [])
  );
  const { loading } = useDayView();
  const [{ supabase, user }] = useAuthStore();

  // Handle slot drop to another day
  const handleSlotDropped = useCallback(
    async (slot: SlotItem, sourceDate: string, targetDate: string) => {
      if (!user || !supabase) return;

      // Only update database if date actually changed
      if (sourceDate === targetDate) {
        return;
      }

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
    <SlotList
      loading={loading}
      handleSlotDropped={handleSlotDropped}
    />
  );
};
