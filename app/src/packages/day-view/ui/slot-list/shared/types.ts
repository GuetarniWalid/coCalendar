import { SlotItem } from '@project/shared';

export interface SlotListProps {
  loading?: boolean;
  handleSlotDropped: (
    slot: SlotItem,
    sourceDate: string,
    targetDate: string
  ) => Promise<void>;
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
