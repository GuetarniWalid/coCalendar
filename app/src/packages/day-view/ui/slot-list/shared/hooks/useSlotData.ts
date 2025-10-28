import { useCallback, useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { SlotItem } from '@project/shared';
import { EnhancedSlotItem } from '../types';

export const useSlotData = (
  selectedDate: string,
  slotsCacheRef: React.RefObject<Record<string, SlotItem[]>>,
) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const getSlotsForDate = useCallback((date: string): SlotItem[] | undefined => {
    return slotsCacheRef.current[date];
  }, [slotsCacheRef]);

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
              now.isBefore(nextStartTime.add(1, 'second'));

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

  // Auto-refresh effect for remaining time cards
  useEffect(() => {
    const todaySlots = getSlotsForDate(selectedDate);
    if (!todaySlots?.length) return;

    const now = dayjs();
    const nextEndTime = todaySlots
      .filter(slot => slot.endTime)
      .map(slot => dayjs(slot.endTime!))
      .filter(endTime => now.isBefore(endTime))
      .sort((a, b) => a.unix() - b.unix())[0];

    if (!nextEndTime) return;

    const timeout = setTimeout(
      () => {
        setRefreshTrigger(prev => prev + 1);
      },
      nextEndTime.diff(now) + 100
    );

    return () => clearTimeout(timeout);
  }, [selectedDate, getSlotsForDate, refreshTrigger]);

  return {
    createEnhancedSlotData,
    getSlotsForDate,
  };
};
