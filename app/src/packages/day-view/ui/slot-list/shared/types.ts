import { SlotItem } from '@project/shared';

export interface SlotListProps {
  loading?: boolean;
  handleSlotDropped: (
    slot: SlotItem,
    sourceDate: string,
    targetDate: string
  ) => Promise<void>;
  updateSlotCache: (
    slotId: string,
    sourceDate: string,
    targetDate: string,
    updatedSlot: SlotItem
  ) => void;
  slotsCacheRef: React.RefObject<Record<string, SlotItem[]>>;
  cacheVersion: number;
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
