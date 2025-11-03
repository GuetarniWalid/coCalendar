import { useCallback } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import * as Haptics from 'expo-haptics';
import { LONG_PRESS_DURATION, TAP_MAX_DURATION } from '../shared/constants';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';
import { useCalendarStore } from '@project/shared/store/calendar';
import { useVerticalSnap } from './useVerticalSnap';
import { SlotItem as SlotItemType } from '@project/shared';
import { View } from 'react-native';

interface UseDragSlotGestureProps {
  slotRef: React.RefObject<View | null>;
  onPress: () => void;
  slot: SlotItemType;
  slotListPanRef: any;
}

/**
 * Hook to manage drag gesture (tap and pan)
 */
export const useDragSlotGesture = ({
  slotRef,
  onPress,
  slot,
  slotListPanRef,
}: UseDragSlotGestureProps) => {
  const {
    draggedSlotX,
    draggedSlotY,
    setDraggedSlot,
    setSourceDayDate,
    draggedSlotOffsetY,
  } = useDraggedSlotContext();
  const [selectedDate] = useCalendarStore.selectedDate();
  const { resetVerticalSnap } = useVerticalSnap();

  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);

  const handlePanStart = useCallback(() => {
    if (slotRef.current) {
      slotRef.current.measure((_x, _y, _width, _height, pageX, pageY) => {
        draggedSlotX.value = pageX;
        draggedSlotY.value = pageY;
      });
    }
    setDraggedSlot(slot);
    setSourceDayDate(selectedDate);
    resetVerticalSnap();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, [
    slotRef,
    draggedSlotX,
    draggedSlotY,
    slot.id,
    setDraggedSlot,
    selectedDate,
    setSourceDayDate,
    resetVerticalSnap,
  ]);

  const tap = Gesture.Tap()
    .maxDistance(10)
    .maxDuration(TAP_MAX_DURATION)
    .onEnd((_, success) => success && scheduleOnRN(handlePress));

  const pan = Gesture.Pan()
    .simultaneousWithExternalGesture(slotListPanRef)
    .activateAfterLongPress(LONG_PRESS_DURATION)
    .onStart(e => {
      draggedSlotOffsetY.value = e.translationY;
      scheduleOnRN(handlePanStart);
    });

  const gesture = Gesture.Exclusive(tap, pan);

  return { gesture };
};
