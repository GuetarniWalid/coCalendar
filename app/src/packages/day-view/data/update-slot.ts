import { SupabaseClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';
import { SlotItem, SlotCompletionStatus } from '@project/shared';

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
        completion_status: 'auto',
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
      completionStatus: updatedSlot.completion_status ?? 'auto',
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

/**
 * Updates a slot's completion status in Supabase
 * @param supabase - Supabase client instance
 * @param ownerId - Owner ID
 * @param slotId - Slot ID to update
 * @param completionStatus - New completion status
 * @returns Updated slot data or null if failed
 */
export const updateSlotCompletion = async (
  supabase: SupabaseClient,
  ownerId: string,
  slotId: string,
  completionStatus: SlotCompletionStatus
): Promise<SlotItem | null> => {
  try {
    const { data: updatedSlot, error: updateError } = await supabase
      .from('slots')
      .update({ completion_status: completionStatus })
      .eq('id', slotId)
      .eq('owner_id', ownerId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating slot completion:', updateError);
      return null;
    }

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
      completionStatus: updatedSlot.completion_status ?? 'auto',
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
    console.error('Error in updateSlotCompletion:', error);
    return null;
  }
};

/**
 * Deletes a slot from Supabase
 * @param supabase - Supabase client instance
 * @param ownerId - Owner ID
 * @param slotId - Slot ID to delete
 * @returns true if deleted successfully, false otherwise
 */
export const deleteSlot = async (
  supabase: SupabaseClient,
  ownerId: string,
  slotId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('slots')
      .delete()
      .eq('id', slotId)
      .eq('owner_id', ownerId);

    if (error) {
      console.error('Error deleting slot:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteSlot:', error);
    return false;
  }
};
