import { useCallback } from 'react';
import dayjs from 'dayjs';
import { SlotItem } from '@project/shared';
import { EnhancedSlotItem } from '../types';

export const useSlotData = () => {
  const createEnhancedSlotData = useCallback(
    (slots: SlotItem[]): EnhancedSlotItem[] => {
      if (!slots?.length) return [];

      const enhancedData: EnhancedSlotItem[] = [];
      const now = dayjs();

      slots.forEach((currentSlot, i) => {
        const nextSlot = slots[i + 1];

        enhancedData.push({
          type: 'slot',
          data: currentSlot,
          id: `slot-${currentSlot.id?.toString() || i}`,
        });

        if (nextSlot && nextSlot.startTime) {
          const currentReferenceTime = currentSlot.endTime
            ? dayjs(currentSlot.endTime)
            : currentSlot.startTime
              ? dayjs(currentSlot.startTime)
              : null;

          if (currentReferenceTime) {
            const nextStartTime = dayjs(nextSlot.startTime);
            const gapMs = nextStartTime.diff(currentReferenceTime);
            const showRemainingCard =
              gapMs > 0 &&
              now.isAfter(currentReferenceTime) &&
              now.isBefore(nextStartTime);

            if (showRemainingCard) {
              enhancedData.push({
                type: 'remaining-time',
                data: { nextActivityStartTime: nextSlot.startTime },
                id: `remaining-${currentSlot.id}-${nextSlot.id}`,
              });
            }
          }
        }
      });

      return enhancedData;
    },
    []
  );

  return {
    createEnhancedSlotData,
  };
};
