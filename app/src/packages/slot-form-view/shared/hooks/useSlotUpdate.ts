import { useCallback } from 'react';
import dayjs from 'dayjs';
import {
  useSlotFormStore,
  useAuthStore,
  useCalendarStore,
  retryWithBackoff,
  updateSlotCache,
} from '@project/shared';
import { createSlot, updateSlotTime, updateSlotTitle, updateSlotDescription, updateSlotDate as updateSlotDateDB } from '../../../day-view/data/update-slot';
import { isWholeDay } from '../utils/isWholeDay';

export const useSlotUpdate = () => {
  const [selectedSlot, setSelectedSlot] = useSlotFormStore.selectedSlot();
  const [{ supabase, user }] = useAuthStore();
  const [selectedDate] = useCalendarStore.selectedDate();

  const updateStartTime = useCallback(
    async (hours: number, minutes: number) => {
      if (!supabase || !user || !selectedSlot) return;

      // Check if this is a new slot (empty ID)
      const isNewSlot = !selectedSlot.id || selectedSlot.id === '';

      // Check if the slot was whole day before the update
      const wasWholeDay = isWholeDay(selectedSlot.startTime, selectedSlot.endTime);

      const currentStartTime = selectedSlot.startTime
        ? dayjs(selectedSlot.startTime)
        : dayjs(selectedDate).hour(hours).minute(minutes);

      const newStartTime = currentStartTime
        .hour(hours)
        .minute(minutes)
        .second(0)
        .millisecond(0)
        .toISOString();

      // If it was a whole day slot and user selected a specific time, set endTime to null
      const currentEndTime = wasWholeDay ? null : selectedSlot.endTime;

      try {
        let updatedSlot;

        if (isNewSlot) {
          // Create a new slot
          updatedSlot = await retryWithBackoff(
            () =>
              createSlot(
                supabase,
                user.id,
                newStartTime,
                currentEndTime,
                false // withoutTime is false when setting a specific time
              ),
            3,
            1000
          );
        } else {
          // Update existing slot
          updatedSlot = await retryWithBackoff(
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
        }

        if (updatedSlot) {
          const slotWithCurrentData = {
            ...updatedSlot,
            tasks: selectedSlot.tasks ?? [],
            participants: selectedSlot.participants ?? [],
            // Ensure withoutTime is false when a specific time is set
            withoutTime: false
          };
          // Use the ID from the created/updated slot for cache update
          updateSlotCache(updatedSlot.id, selectedDate, selectedDate, slotWithCurrentData);
          setSelectedSlot(slotWithCurrentData);
        } else {
          console.error(isNewSlot ? 'Failed to create slot' : 'Failed to update start time');
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

      // Check if this is a new slot (empty ID)
      const isNewSlot = !selectedSlot.id || selectedSlot.id === '';

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
        let updatedSlot;

        if (isNewSlot) {
          // Create a new slot
          updatedSlot = await retryWithBackoff(
            () =>
              createSlot(
                supabase,
                user.id,
                currentStartTime,
                newEndTime,
                false // withoutTime is false when setting a specific time
              ),
            3,
            1000
          );
        } else {
          // Update existing slot
          updatedSlot = await retryWithBackoff(
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
        }

        if (updatedSlot) {
          const slotWithCurrentData = {
            ...updatedSlot,
            tasks: selectedSlot.tasks ?? [],
            participants: selectedSlot.participants ?? [],
            // Ensure withoutTime is false when a specific time is set
            withoutTime: false
          };
          // Use the ID from the created/updated slot for cache update
          updateSlotCache(updatedSlot.id, selectedDate, selectedDate, slotWithCurrentData);
          setSelectedSlot(slotWithCurrentData);
        } else {
          console.error(isNewSlot ? 'Failed to create slot' : 'Failed to update end time');
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

      // Check if this is a new slot (empty ID)
      const isNewSlot = !selectedSlot.id || selectedSlot.id === '';

      try {
        let updatedSlot;

        if (isNewSlot) {
          // Create a new slot with title
          updatedSlot = await retryWithBackoff(
            () =>
              createSlot(
                supabase,
                user.id,
                selectedSlot.startTime,
                selectedSlot.endTime,
                selectedSlot.withoutTime ?? true,
                newTitle
              ),
            3,
            1000
          );
        } else {
          // Update existing slot
          updatedSlot = await retryWithBackoff(
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
        }

        if (updatedSlot) {
          const slotWithCurrentData = {
            ...updatedSlot,
            tasks: selectedSlot.tasks ?? [],
            participants: selectedSlot.participants ?? []
          };
          // Use the ID from the created/updated slot for cache update
          updateSlotCache(updatedSlot.id, selectedDate, selectedDate, slotWithCurrentData);
          setSelectedSlot(slotWithCurrentData);
        } else {
          console.error(isNewSlot ? 'Failed to create slot' : 'Failed to update title');
        }
      } catch (error) {
        console.error('Error updating title:', error);
      }
    },
    [supabase, user, selectedSlot, selectedDate, setSelectedSlot]
  );

  const updateDescription = useCallback(
    async (newDescription: string) => {
      if (!supabase || !user || !selectedSlot) return;

      try {
        const updatedSlot = await retryWithBackoff(
          () =>
            updateSlotDescription(
              supabase,
              user.id,
              selectedSlot.id,
              newDescription
            ),
          3,
          1000
        );

        if (updatedSlot) {
          const slotWithCurrentData = {
            ...updatedSlot,
            tasks: selectedSlot.tasks ?? [],
            participants: selectedSlot.participants ?? []
          };
          updateSlotCache(selectedSlot.id, selectedDate, selectedDate, slotWithCurrentData);
          setSelectedSlot(slotWithCurrentData);
        } else {
          console.error('Failed to update description');
        }
      } catch (error) {
        console.error('Error updating description:', error);
      }
    },
    [supabase, user, selectedSlot, selectedDate, setSelectedSlot]
  );

  const updateSlotDate = useCallback(
    async (targetDate: string) => {
      if (!supabase || !user || !selectedSlot) return;

      // Extract the current date from the slot's startTime
      const currentDate = selectedSlot.startTime
        ? dayjs(selectedSlot.startTime).format('YYYY-MM-DD')
        : selectedDate;

      // Skip if the target date is the same as current date
      if (currentDate === targetDate) return;

      // Optimistically update the local state first
      const updatedSlot = { ...selectedSlot };

      // Update the date portions of startTime and endTime
      if (selectedSlot.withoutTime) {
        // For untimed slots, set to start of the new day
        updatedSlot.startTime = dayjs(targetDate).startOf('day').toISOString();
        updatedSlot.endTime = null;
      } else {
        // For timed slots, preserve the time portions
        if (selectedSlot.startTime) {
          const startTime = dayjs(selectedSlot.startTime);
          updatedSlot.startTime = dayjs(targetDate)
            .hour(startTime.hour())
            .minute(startTime.minute())
            .second(startTime.second())
            .millisecond(0)
            .toISOString();
        }

        if (selectedSlot.endTime) {
          const endTime = dayjs(selectedSlot.endTime);
          updatedSlot.endTime = dayjs(targetDate)
            .hour(endTime.hour())
            .minute(endTime.minute())
            .second(endTime.second())
            .millisecond(0)
            .toISOString();
        }
      }

      // Optimistically update the local state
      setSelectedSlot(updatedSlot);

      try {
        const serverUpdatedSlot = await retryWithBackoff(
          () =>
            updateSlotDateDB(
              supabase,
              user.id,
              selectedSlot.id,
              targetDate
            ),
          3,
          1000
        );

        if (serverUpdatedSlot) {
          const slotWithCurrentData = {
            ...serverUpdatedSlot,
            tasks: selectedSlot.tasks ?? [],
            participants: selectedSlot.participants ?? []
          };

          // Update the cache, moving the slot from the old date to the new date
          updateSlotCache(selectedSlot.id, currentDate, targetDate, slotWithCurrentData);
          setSelectedSlot(slotWithCurrentData);
        } else {
          // Revert optimistic update on failure
          console.error('Failed to update slot date');
          setSelectedSlot(selectedSlot);
        }
      } catch (error) {
        console.error('Error updating slot date:', error);
        // Revert optimistic update on error
        setSelectedSlot(selectedSlot);
      }
    },
    [supabase, user, selectedSlot, selectedDate, setSelectedSlot]
  );

  return { updateStartTime, updateEndTime, updateTitle, updateDescription, updateSlotDate };
};
