import type { SlotColorName } from '../utils/colors';

export interface DayItem {
  date: string;
  day: string;
  isSelected: boolean;
  isToday: boolean;
}

export interface SlotParticipant {
  user_id: string;
  display_name?: string;
  email?: string;
  created_at?: string;
}

export interface SlotItem {
  id: string;
  title: string;
  startTime: string | null;
  endTime: string | null;
  withoutTime?: boolean;
  type: 'private' | 'shared';
  visibility?: 'private' | 'public';
  description?: string;
  color?: SlotColorName | undefined;
  completed?: boolean;
  image?: {
    persona: 'adult-female' | 'adult-male' | 'child-female' | 'child-male';
    activity: string;
    name: string;
    extension: 'webp';
  };
  tasks?: SlotTask[];
  voice_path?: string;
  voice_duration?: number;
  voice_mime?: string;
  voice_size_bytes?: number;
  voice_created_at?: string;
  participants?: SlotParticipant[];
}

export interface SlotTask {
  id: string;
  text: string;
  is_done: boolean;
  position: number;
}
