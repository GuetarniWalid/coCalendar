import { SlotItem, SlotColorName } from '@project/shared';

export const fetchSlotsForDate = async (supabase: any, userId: string, selectedDate: string): Promise<SlotItem[]> => {
  const { data, error } = await supabase
    .from('slots')
    .select(
      `
      id,
      title,
      start_at,
      end_at,
      visibility,
      description,
      color,
      image,
      clients(display_name),
      slot_tasks(id, text, is_done, position)
    `
    )
    .eq('pro_id', userId)
    .gte('start_at', `${selectedDate}T00:00:00`)
    .lt('start_at', `${selectedDate}T23:59:59`)
    .order('start_at');

  if (error) throw error;

  return (
    data?.map((slot: any) => ({
      id: slot.id,
      title: slot.title,
      startTime: slot.start_at,
      endTime: slot.end_at,
      type: slot.visibility as 'private' | 'shared',
      visibility: slot.visibility as 'private' | 'public',
      description: slot.description ?? undefined,
      clientName: Array.isArray(slot.clients) && slot.clients.length > 0 ? slot.clients[0].display_name : undefined,
      color: slot.color as SlotColorName | undefined,
      image: slot.image ?? undefined,
      tasks: Array.isArray(slot.slot_tasks) ? slot.slot_tasks.sort((a: any, b: any) => a.position - b.position) : undefined,
    })) || []
  );
};

// Fetch slots for a date range [startDate, endDate] inclusive. Dates in YYYY-MM-DD.
export const fetchSlotsInRange = async (supabase: any, userId: string, startDate: string, endDate: string): Promise<Record<string, SlotItem[]>> => {
  const startIso = `${startDate}T00:00:00`;
  // Add one day to endDate and use lt to make inclusive range
  const endIsoExclusive = `${endDate}T23:59:59`;

  const { data, error } = await supabase
    .from('slots')
    .select(
      `
      id,
      title,
      start_at,
      end_at,
      visibility,
      description,
      color,
      image,
      clients(display_name),
      slot_tasks(id, text, is_done, position)
    `
    )
    .eq('pro_id', userId)
    .gte('start_at', startIso)
    .lte('start_at', endIsoExclusive)
    .order('start_at');

  if (error) throw error;

  const byDate: Record<string, SlotItem[]> = {};
  for (const slot of data ?? []) {
    const dateId = String(slot.start_at).slice(0, 10);
    (byDate[dateId] ||= []).push({
      id: slot.id,
      title: slot.title,
      startTime: slot.start_at,
      endTime: slot.end_at,
      type: slot.visibility as 'private' | 'shared',
      visibility: slot.visibility as 'private' | 'public',
      description: slot.description ?? undefined,
      clientName: Array.isArray(slot.clients) && slot.clients.length > 0 ? slot.clients[0].display_name : undefined,
      color: slot.color as SlotColorName | undefined,
      image: slot.image ?? undefined,
      tasks: Array.isArray(slot.slot_tasks) ? slot.slot_tasks.sort((a: any, b: any) => a.position - b.position) : undefined,
    });
  }
  return byDate;
};
