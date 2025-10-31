import { useCallback, useRef } from 'react';
import { Gesture, GestureType } from 'react-native-gesture-handler';
import { withSpring } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { LONG_PRESS_DURATION } from '../../slot-item/draggable-wrapper/shared/constants';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';
import { useZoneDetection } from '../../slot-item/draggable-wrapper/hooks/useZoneDetection';
import { useCalendarStore } from '@project/shared/store/calendar';

interface UseDragSlotListGestureProps {
  handleSlotDropped: (
    slot: any,
    sourceDate: string,
    targetDate: string
  ) => void;
}

/**
 * Hook to manage the position animation of the dragged slot
 */
export const useDragSlotListGesture = ({
  handleSlotDropped,
}: UseDragSlotListGestureProps) => {
  const {
    draggedSlot,
    draggedSlotOffsetX,
    draggedSlotOffsetY,
    draggedSlotHorizontalZone,
    setDraggedSlot,
    sourceDayDate,
    setSourceDayDate,
    draggedSlotOpacity,
    lastOriginalSlotY,
    draggedSlotY,
  } = useDraggedSlotContext();
  const [selectedDate] = useCalendarStore.selectedDate();
  const slotListPanRef = useRef<GestureType | undefined>(undefined);

  // Hook for zone detection logic
  const { updateZones } = useZoneDetection(draggedSlotHorizontalZone);

  const handlePanEnd = useCallback(() => {
    setDraggedSlot(null);

    // Update slot on database
    if (
      handleSlotDropped &&
      draggedSlot &&
      sourceDayDate &&
      selectedDate !== sourceDayDate
    ) {
      handleSlotDropped(draggedSlot, sourceDayDate, selectedDate);
    }

    // Clean up drag data
    setSourceDayDate(null);
  }, [
    setSourceDayDate,
    selectedDate,
    sourceDayDate,
    handleSlotDropped,
    draggedSlot,
  ]);

  const pan = Gesture.Pan()
    .withRef(slotListPanRef)
    .activateAfterLongPress(LONG_PRESS_DURATION)
    .shouldCancelWhenOutside(false)
    .onUpdate(e => {
      draggedSlotOffsetX.value = e.translationX;
      draggedSlotOffsetY.value = e.translationY;

      // Update zone detection
      updateZones(e.absoluteX);
    })
    .onEnd(() => {
      const finalDraggedSlotOffsetY =
        lastOriginalSlotY.value - draggedSlotY.value;

      draggedSlotOffsetX.value = withSpring(0);
      draggedSlotOffsetY.value = withSpring(finalDraggedSlotOffsetY, {}, () => {
        // Reset all dragged slot values after animation completes
        draggedSlotHorizontalZone.value = 'middle';
        draggedSlotOpacity.value = 0;
        scheduleOnRN(handlePanEnd);
      });
      draggedSlotHorizontalZone.value = 'middle';
    });

  const gesture = Gesture.Simultaneous(pan, Gesture.Native());

  return { gesture, slotListPanRef };
};
