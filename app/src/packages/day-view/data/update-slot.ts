import { SupabaseClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';
import { SlotItem } from '@project/shared';

/**
 * Updates a slot's date in Supabase, adjusting the time fields appropriately
 * @param supabase - Supabase client instance
 * @param ownerId - Owner ID
 * @param slotId - Slot ID to update
 * @param targetDate - New date for the slot (YYYY-MM-DD)
 * @returns Updated slot data or null if failed
 */
export const updateSlotDate = async (
  supabase: SupabaseClient,
  ownerId: string,
  slotId: string,
  targetDate: string
): Promise<SlotItem | null> => {
  try {
    // First fetch the current slot to get its time values
    const { data: currentSlot, error: fetchError } = await supabase
      .from('slots')
      .select('*')
      .eq('id', slotId)
      .eq('owner_id', ownerId)
      .single();

    if (fetchError || !currentSlot) {
      console.error('Error fetching slot:', fetchError);
      return null;
    }

    let updatedStartTime = null;
    let updatedEndTime = null;

    // If slot has specific times, update them to the new date
    if (currentSlot.start_at && !currentSlot.without_time) {
      const startTime = dayjs(currentSlot.start_at);
      const hour = startTime.hour();
      const minute = startTime.minute();
      const second = startTime.second();

      // Create new start time with target date
      updatedStartTime = dayjs(targetDate)
        .hour(hour)
        .minute(minute)
        .second(second)
        .toISOString();
    }

    if (currentSlot.end_at && !currentSlot.without_time) {
      const endTime = dayjs(currentSlot.end_at);
      const hour = endTime.hour();
      const minute = endTime.minute();
      const second = endTime.second();

      // Create new end time with target date
      updatedEndTime = dayjs(targetDate)
        .hour(hour)
        .minute(minute)
        .second(second)
        .toISOString();
    }

    // For "without_time" slots, just set the date part
    if (currentSlot.without_time) {
      updatedStartTime = dayjs(targetDate).startOf('day').toISOString();
      updatedEndTime = null;
    }

    // Update the slot in database
    const { data: updatedSlot, error: updateError } = await supabase
      .from('slots')
      .update({
        start_at: updatedStartTime,
        end_at: updatedEndTime,
      })
      .eq('id', slotId)
      .eq('owner_id', ownerId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating slot:', updateError);
      return null;
    }

    // Format the response to match SlotItem interface
    return {
      id: updatedSlot.id,
      title: updatedSlot.title,
      startTime: updatedSlot.start_at,
      endTime: updatedSlot.end_at,
      withoutTime: updatedSlot.without_time,
      type: updatedSlot.type,
      visibility: updatedSlot.visibility,
      description: updatedSlot.description,
      color: updatedSlot.color,
      completed: updatedSlot.completed,
      image: updatedSlot.image,
      tasks: updatedSlot.tasks,
      voice_path: updatedSlot.voice_path,
      voice_duration: updatedSlot.voice_duration,
      voice_mime: updatedSlot.voice_mime,
      voice_size_bytes: updatedSlot.voice_size_bytes,
      voice_created_at: updatedSlot.voice_created_at,
      participants: updatedSlot.participants,
    };
  } catch (error) {
    console.error('Error in updateSlotDate:', error);
    return null;
  }
};
