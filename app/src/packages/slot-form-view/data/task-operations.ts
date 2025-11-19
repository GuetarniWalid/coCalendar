import { SupabaseClient } from '@supabase/supabase-js';
import { SlotTask } from '@project/shared';

/**
 * Creates a new task in Supabase
 * @param supabase - Supabase client instance
 * @param slotId - Slot ID the task belongs to
 * @param text - Task text
 * @param position - Position/order of the task in the list
 * @param isDone - Whether the task is completed
 * @returns Created task data or null if failed
 */
export const createTask = async (
  supabase: SupabaseClient,
  slotId: string,
  text: string,
  position: number,
  isDone: boolean = false
): Promise<SlotTask | null> => {
  try {
    const { data: createdTask, error: createError } = await supabase
      .from('slot_tasks')
      .insert({
        slot_id: slotId,
        text,
        is_done: isDone,
        position,
      })
      .select('id, text, is_done, position')
      .single();

    if (createError) {
      console.error('Error creating task:', createError);
      return null;
    }

    return {
      id: createdTask.id,
      text: createdTask.text,
      is_done: createdTask.is_done,
      position: createdTask.position,
    };
  } catch (error) {
    console.error('Error in createTask:', error);
    return null;
  }
};

/**
 * Updates a task's text in Supabase
 * @param supabase - Supabase client instance
 * @param taskId - Task ID to update
 * @param text - New text for the task
 * @returns Updated task data or null if failed
 */
export const updateTaskText = async (
  supabase: SupabaseClient,
  taskId: string,
  text: string
): Promise<SlotTask | null> => {
  try {
    const { data: updatedTask, error: updateError } = await supabase
      .from('slot_tasks')
      .update({ text })
      .eq('id', taskId)
      .select('id, text, is_done, position')
      .single();

    if (updateError) {
      console.error('Error updating task text:', updateError);
      return null;
    }

    return {
      id: updatedTask.id,
      text: updatedTask.text,
      is_done: updatedTask.is_done,
      position: updatedTask.position,
    };
  } catch (error) {
    console.error('Error in updateTaskText:', error);
    return null;
  }
};

/**
 * Updates a task's completion status in Supabase
 * @param supabase - Supabase client instance
 * @param taskId - Task ID to update
 * @param isDone - New completion status
 * @returns Updated task data or null if failed
 */
export const updateTaskDone = async (
  supabase: SupabaseClient,
  taskId: string,
  isDone: boolean
): Promise<SlotTask | null> => {
  try {
    const { data: updatedTask, error: updateError } = await supabase
      .from('slot_tasks')
      .update({ is_done: isDone })
      .eq('id', taskId)
      .select('id, text, is_done, position')
      .single();

    if (updateError) {
      console.error('Error updating task done status:', updateError);
      return null;
    }

    return {
      id: updatedTask.id,
      text: updatedTask.text,
      is_done: updatedTask.is_done,
      position: updatedTask.position,
    };
  } catch (error) {
    console.error('Error in updateTaskDone:', error);
    return null;
  }
};

/**
 * Updates a task's position in Supabase
 * @param supabase - Supabase client instance
 * @param taskId - Task ID to update
 * @param position - New position for the task
 * @returns Updated task data or null if failed
 */
export const updateTaskPosition = async (
  supabase: SupabaseClient,
  taskId: string,
  position: number
): Promise<SlotTask | null> => {
  try {
    const { data: updatedTask, error: updateError } = await supabase
      .from('slot_tasks')
      .update({ position })
      .eq('id', taskId)
      .select('id, text, is_done, position')
      .single();

    if (updateError) {
      console.error('Error updating task position:', updateError);
      return null;
    }

    return {
      id: updatedTask.id,
      text: updatedTask.text,
      is_done: updatedTask.is_done,
      position: updatedTask.position,
    };
  } catch (error) {
    console.error('Error in updateTaskPosition:', error);
    return null;
  }
};

/**
 * Deletes a task from Supabase
 * @param supabase - Supabase client instance
 * @param taskId - Task ID to delete
 * @returns true if deleted successfully, false otherwise
 */
export const deleteTask = async (
  supabase: SupabaseClient,
  taskId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('slot_tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteTask:', error);
    return false;
  }
};
