import { useCallback, useRef } from 'react';
import { Gesture, GestureType } from 'react-native-gesture-handler';
import { withSpring } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { LONG_PRESS_DURATION } from '../../slot-item/draggable-wrapper/shared/constants';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';
import { useZoneDetection } from '../../slot-item/draggable-wrapper/hooks/useZoneDetection';
import { useVerticalSnap } from '../../slot-item/draggable-wrapper/hooks/useVerticalSnap';
import { useCalendarStore } from '@project/shared/store/calendar';

interface UseDragSlotListGestureProps {
  handleSlotDropped: (
    slot: any,
    sourceDate: string,
    targetDate: string
  ) => void;
}

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
    setHasDayChangedDuringDrag,
  } = useDraggedSlotContext();
  const [selectedDate] = useCalendarStore.selectedDate();
  const slotListPanRef = useRef<GestureType | undefined>(undefined);
  const { updateZones } = useZoneDetection(draggedSlotHorizontalZone);
  const { applyVerticalSnap } = useVerticalSnap();

  const handlePanEnd = useCallback(() => {
    setDraggedSlot(null);

    if (
      handleSlotDropped &&
      draggedSlot &&
      sourceDayDate &&
      selectedDate !== sourceDayDate
    ) {
      handleSlotDropped(draggedSlot, sourceDayDate, selectedDate);
    }

    setSourceDayDate(null);
    setHasDayChangedDuringDrag(false);
  }, [
    setDraggedSlot,
    setSourceDayDate,
    setHasDayChangedDuringDrag,
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
      applyVerticalSnap(e.translationY);
      updateZones(e.absoluteX);
    })
    .onEnd(() => {
      const finalDraggedSlotOffsetY =
        lastOriginalSlotY.value - draggedSlotY.value;

      draggedSlotOffsetX.value = withSpring(0);
      draggedSlotOffsetY.value = withSpring(finalDraggedSlotOffsetY, {}, () => {
        draggedSlotHorizontalZone.value = 'middle';
        draggedSlotOpacity.value = 0;
        scheduleOnRN(handlePanEnd);
      });
      draggedSlotHorizontalZone.value = 'middle';
    });

  const gesture = Gesture.Simultaneous(pan, Gesture.Native());

  return { gesture, slotListPanRef };
};
