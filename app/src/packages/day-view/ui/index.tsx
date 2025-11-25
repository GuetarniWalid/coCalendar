import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore, SlotItem, retryWithBackoff, setCurrentScreen, updateSlotCache, useCalendarStore, useSlotsForDate } from '@project/shared';
import { SlotList } from './slot-list';
import { updateSlotDate } from '../data/update-slot';
import { DayViewHeader } from './DayViewHeader';

export const DayViewScreen = () => {
  const [selectedDate] = useCalendarStore.selectedDate();
  const { slots, loading } = useSlotsForDate(selectedDate);
  const [{ supabase, user }] = useAuthStore();

  useFocusEffect(
    useCallback(() => {
      setCurrentScreen('Day');
    }, [])
  );

  const handleSlotDropped = useCallback(
    async (slot: SlotItem, sourceDate: string, targetDate: string) => {
      if (!user || !supabase) return;

      if (sourceDate === targetDate) {
        return;
      }

      try {
        const dbUpdatedSlot = await retryWithBackoff(
          () => updateSlotDate(supabase, user.id, slot.id, targetDate),
          3,
          1000
        );

        if (!dbUpdatedSlot) {
          console.error(
            'Failed to update slot in database after retries, rolling back'
          );
          updateSlotCache(slot.id, targetDate, sourceDate, slot);
        }
      } catch (error) {
        console.error('Error updating slot after retries:', error);
        updateSlotCache(slot.id, targetDate, sourceDate, slot);
      }
    },
    [user, supabase, updateSlotCache]
  );

  return (
    <>
      <DayViewHeader slots={slots} loading={loading} />
      <SlotList
        loading={loading}
        handleSlotDropped={handleSlotDropped}
      />
    </>
  );
};
