import { SlotItem } from '@project/shared';

export interface SlotListProps {
  onSlotPress: (slot: SlotItem) => void;
  getSlotsForDate: (date: string) => SlotItem[] | undefined;
  loading?: boolean;
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

