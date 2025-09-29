import { SlotItem, SlotColorName } from '@project/shared';

// Helper function to get slot IDs where user is a participant
const getParticipantSlotIds = async (supabase: any, userId: string): Promise<string> => {
  const { data, error } = await supabase
    .from('slot_participants')
    .select('slot_id')
    .eq('user_id', userId);
  
  if (error || !data?.length) return '';
  
  return data.map((p: any) => p.slot_id).join(',');
};

// Shared database query columns for slots
const SLOT_SELECT_COLUMNS = `
  id,
  title,
  start_at,
  end_at,
  without_time,
  description,
  color,
  image,
  voice_path,
  voice_duration,
  voice_mime,
  voice_size_bytes,
  voice_created_at,
  completed,
  owner_id,
  slot_tasks(id, text, is_done, position),
  slot_participants(
    user_id,
    display_name,
    email,
    created_at
  )
`;

// Transform raw slot data into SlotItem format
const transformSlotData = (slot: any): SlotItem => {
  let participants = undefined;
  
  if (Array.isArray(slot.slot_participants) && slot.slot_participants.length > 0) {
    participants = slot.slot_participants.map((p: any) => ({
      user_id: p.user_id,
      display_name: p.display_name,
      email: p.email,
      created_at: p.created_at,
    }));
  }

  return {
    id: slot.id,
    title: slot.title,
    startTime: slot.start_at ?? null,
    endTime: slot.end_at ?? null,
    withoutTime: slot.without_time ?? false,
    type: Array.isArray(slot.slot_participants) && slot.slot_participants.length > 0 ? 'shared' : 'private',
    description: slot.description ?? undefined,
    color: slot.color as SlotColorName | undefined,
    image: slot.image ?? undefined,
    completed: slot.completed ?? false,
    tasks: Array.isArray(slot.slot_tasks) ? slot.slot_tasks.sort((a: any, b: any) => a.position - b.position) : undefined,
    voice_path: slot.voice_path ?? undefined,
    voice_duration: slot.voice_duration ?? undefined,
    voice_mime: slot.voice_mime ?? undefined,
    voice_size_bytes: slot.voice_size_bytes ?? undefined,
    voice_created_at: slot.voice_created_at ?? undefined,
    participants,
  };
};

// Core function to fetch slots with date filtering
const fetchSlotsCore = async (
  supabase: any, 
  userId: string, 
  startIso: string, 
  endIso: string,
  filterType: 'gte_lt' | 'gte_lte' = 'gte_lt'
): Promise<any[]> => {
  const participantSlotIds = await getParticipantSlotIds(supabase, userId);
  
  let query = supabase
    .from('slots')
    .select(SLOT_SELECT_COLUMNS);

  // Apply date filtering based on filter type
  if (filterType === 'gte_lt') {
    query = query.gte('start_at', startIso).lt('start_at', endIso);
  } else {
    query = query.gte('start_at', startIso).lte('start_at', endIso);
  }

  // Add OR condition for owner OR participant
  if (participantSlotIds) {
    query = query.or(`owner_id.eq.${userId},id.in.(${participantSlotIds})`);
  } else {
    query = query.eq('owner_id', userId);
  }

  const { data, error } = await query.order('start_at');
  if (error) throw error;

  return data ?? [];
};

export const fetchSlotsForDate = async (supabase: any, userId: string, selectedDate: string): Promise<SlotItem[]> => {
  const startIso = `${selectedDate}T00:00:00`;
  const endIso = `${selectedDate}T23:59:59`;
  
  const data = await fetchSlotsCore(supabase, userId, startIso, endIso);
  return data.map(transformSlotData);
};

// Fetch slots for a date range [startDate, endDate] inclusive. Dates in YYYY-MM-DD.
export const fetchSlotsInRange = async (supabase: any, userId: string, startDate: string, endDate: string): Promise<Record<string, SlotItem[]>> => {
  const startIso = `${startDate}T00:00:00`;
  const endIso = `${endDate}T23:59:59`;

  const data = await fetchSlotsCore(supabase, userId, startIso, endIso, 'gte_lte');
  
  // Transform slots and group by date
  const byDate: Record<string, SlotItem[]> = {};
  for (const rawSlot of data) {
    const dateId = String(rawSlot.start_at).slice(0, 10);
    const slot = transformSlotData(rawSlot);
    (byDate[dateId] ||= []).push(slot);
  }
  
  return byDate;
};
