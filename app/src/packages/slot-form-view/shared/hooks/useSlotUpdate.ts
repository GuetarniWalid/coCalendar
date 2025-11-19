import { useCallback } from 'react';
import dayjs from 'dayjs';
import {
  useSlotFormStore,
  useAuthStore,
  useCalendarStore,
  retryWithBackoff,
  updateSlotCache,
} from '@project/shared';
import { updateSlotTime, updateSlotTitle } from '../../../day-view/data/update-slot';

export const useSlotUpdate = () => {
  const [selectedSlot, setSelectedSlot] = useSlotFormStore.selectedSlot();
  const [{ supabase, user }] = useAuthStore();
  const [selectedDate] = useCalendarStore.selectedDate();

  const updateStartTime = useCallback(
    async (hours: number, minutes: number) => {
      if (!supabase || !user || !selectedSlot) return;

      const currentStartTime = selectedSlot.startTime
        ? dayjs(selectedSlot.startTime)
        : dayjs(selectedDate).hour(hours).minute(minutes);

      const newStartTime = currentStartTime
        .hour(hours)
        .minute(minutes)
        .second(0)
        .millisecond(0)
        .toISOString();

      const currentEndTime = selectedSlot.endTime;

      try {
        const updatedSlot = await retryWithBackoff(
          () =>
            updateSlotTime(
              supabase,
              user.id,
              selectedSlot.id,
              newStartTime,
              currentEndTime
            ),
          3,
          1000
        );

        if (updatedSlot) {
          updateSlotCache(selectedSlot.id, selectedDate, selectedDate, updatedSlot);
          setSelectedSlot(updatedSlot);
        } else {
          console.error('Failed to update start time');
        }
      } catch (error) {
        console.error('Error updating start time:', error);
      }
    },
    [supabase, user, selectedSlot, selectedDate, setSelectedSlot]
  );

  const updateEndTime = useCallback(
    async (hours: number, minutes: number) => {
      if (!supabase || !user || !selectedSlot) return;

      const currentEndTime = selectedSlot.endTime
        ? dayjs(selectedSlot.endTime)
        : dayjs(selectedDate).hour(hours).minute(minutes);

      const newEndTime = currentEndTime
        .hour(hours)
        .minute(minutes)
        .second(0)
        .millisecond(0)
        .toISOString();

      const currentStartTime = selectedSlot.startTime;

      try {
        const updatedSlot = await retryWithBackoff(
          () =>
            updateSlotTime(
              supabase,
              user.id,
              selectedSlot.id,
              currentStartTime,
              newEndTime
            ),
          3,
          1000
        );

        if (updatedSlot) {
          updateSlotCache(selectedSlot.id, selectedDate, selectedDate, updatedSlot);
          setSelectedSlot(updatedSlot);
        } else {
          console.error('Failed to update end time');
        }
      } catch (error) {
        console.error('Error updating end time:', error);
      }
    },
    [supabase, user, selectedSlot, selectedDate, setSelectedSlot]
  );

  const updateTitle = useCallback(
    async (newTitle: string) => {
      if (!supabase || !user || !selectedSlot) return;

      try {
        const updatedSlot = await retryWithBackoff(
          () =>
            updateSlotTitle(
              supabase,
              user.id,
              selectedSlot.id,
              newTitle
            ),
          3,
          1000
        );

        if (updatedSlot) {
          updateSlotCache(selectedSlot.id, selectedDate, selectedDate, updatedSlot);
          setSelectedSlot(updatedSlot);
        } else {
          console.error('Failed to update title');
        }
      } catch (error) {
        console.error('Error updating title:', error);
      }
    },
    [supabase, user, selectedSlot, selectedDate, setSelectedSlot]
  );

  return { updateStartTime, updateEndTime, updateTitle };
};
