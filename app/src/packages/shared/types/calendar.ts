import type { SlotColorName } from '../utils/colors';

export interface DayItem {
  date: string;
  day: string;
  isSelected: boolean;
  isToday: boolean;
}

export interface SlotItem {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  type: 'private' | 'shared';
  visibility?: 'private' | 'public';
  description?: string;
  clientName?: string;
  color?: SlotColorName | undefined;
  completed?: boolean;
  image?: {
    persona: 'adult-female' | 'adult-male' | 'child-female' | 'child-male';
    activity: string;
    name: string;
    extension: 'webp';
  };
}


