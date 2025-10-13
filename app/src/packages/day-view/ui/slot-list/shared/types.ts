import { SlotItem } from '@project/shared';

export interface SlotListProps {
  slots: SlotItem[];
  onSlotPress: (slot: SlotItem) => void;
  getSlotsForDate: (date: string) => SlotItem[] | undefined;
  loading?: boolean;
  selectedDate: string;
}

export interface GestureState {
  startOffset: number;
  startTime: number;
  lastOffset: number;
}

export interface EnhancedSlotItem {
  type: 'slot' | 'remaining-time';
  data: any;
  id: string;
}

