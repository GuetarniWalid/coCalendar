import { FC, ReactNode, useCallback, useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import Animated, { useAnimatedRef, withSpring } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import * as Haptics from 'expo-haptics';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';
import { SlotPositioner } from './SlotPositioner';
import { CALENDAR_CONSTANTS } from '@project/shared';
import { Portal } from 'react-native-teleport';
import { useVerticalConstraint } from '@project/draggable-layer/hooks';

interface DraggableSlotWrapperProps {
  children: ReactNode;
  onPress: () => void;
  index: number;
  selectedDate: string;
}

export const DraggableSlotWrapper: FC<DraggableSlotWrapperProps> = ({ children, onPress, index, selectedDate }) => {
  const slotRef = useAnimatedRef<Animated.View>();
  const { 
    draggedSlotX, 
    draggedSlotY, 
    draggedSlotOffsetX, 
    draggedSlotOffsetY, 
    draggedSlotHeight, 
    draggedSlotZone, 
    draggedSlotHorizontalZone, 
    draggedSlotIndex, 
    setDraggedSlotIndexRN, 
    draggedSlotIndexRN, 
    portalEnabled
  } = useDraggedSlotContext();
  const { constrainVerticalOffset, draggedSlotInitialOffsetY } = useVerticalConstraint();
  const [panState, setPanState] = useState<'idle' | 'start' | 'end'>('idle');
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const bottomSreenTresholdY = screenHeight * 0.85;
  const topSreenTresholdY = screenHeight * 0.15;
  const horizontalEdgeThreshold = CALENDAR_CONSTANTS.HORIZONTAL_SCROLL_ZONE_WIDTH;

  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);

  const tap = Gesture.Tap()
    .maxDuration(200)
    .onEnd((_, success) => success && scheduleOnRN(handlePress));

  const handlePanStart = useCallback(() => {
    if (slotRef.current) {
      slotRef.current.measure((_x, _y, _width, height, pageX, pageY) => {
        draggedSlotX.value = pageX;
        draggedSlotY.value = pageY;
        draggedSlotHeight.value = height;
        draggedSlotIndex.value = index;
      });
    }
    setPanState('start');
    setDraggedSlotIndexRN(index);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, [draggedSlotX, draggedSlotY, draggedSlotHeight, draggedSlotIndex, index, setDraggedSlotIndexRN, setPanState]);

  const handlePanEnd = useCallback(() => {
    // the slot is unTeleport first then useEffect handle portal removal
    setPanState('end');
  }, [setPanState]);

  const pan = Gesture.Pan()
    .activateAfterLongPress(500)
    .shouldCancelWhenOutside(false)
    .onStart(() => {
      // Initialize constraint with starting position
      draggedSlotInitialOffsetY.value = 0;
      scheduleOnRN(handlePanStart);
    })
    .onUpdate(e => {
      draggedSlotOffsetX.value = e.translationX;
      
      // Apply vertical constraint
      draggedSlotOffsetY.value = constrainVerticalOffset(e.translationY);

      // Vertical zone detection
      const touchY = e.absoluteY;
      if (touchY > bottomSreenTresholdY) {
        draggedSlotZone.value = 'bottom';
      } else if (touchY < topSreenTresholdY) {
        draggedSlotZone.value = 'top';
      } else {
        draggedSlotZone.value = 'middle';
      }

      // Horizontal zone detection - use actual touch position
      const touchX = e.absoluteX;
      if (touchX < horizontalEdgeThreshold) {
        draggedSlotHorizontalZone.value = 'left';
      } else if (touchX > screenWidth - horizontalEdgeThreshold) {
        draggedSlotHorizontalZone.value = 'right';
      } else {
        draggedSlotHorizontalZone.value = 'middle';
      }
    })
    .onEnd(() => {
      draggedSlotOffsetX.value = withSpring(0);
      draggedSlotOffsetY.value = withSpring(0, {}, () => {
        // Reset all dragged slot values after animation completes
        draggedSlotIndex.value = null;
        draggedSlotHeight.value = 0;
        draggedSlotZone.value = 'middle';
        draggedSlotHorizontalZone.value = 'middle';
        scheduleOnRN(handlePanEnd);
      });
      draggedSlotZone.value = 'middle';
      draggedSlotHorizontalZone.value = 'middle';
    });

  const gesture = Gesture.Exclusive(tap, pan);

  useEffect(() => {
    if (index !== draggedSlotIndexRN) return;
    if (panState !== 'end') return;
    setDraggedSlotIndexRN(null);
    setPanState('idle');
  }, [panState, index, setDraggedSlotIndexRN, draggedSlotIndexRN]);

  return (
    <SlotPositioner ref={slotRef} index={index} selectedDate={selectedDate}>
      <Portal hostName={index === draggedSlotIndexRN && portalEnabled && panState === 'start' ? 'draggableLayer' : undefined}>
        <GestureDetector gesture={gesture}>{children}</GestureDetector>
      </Portal>
    </SlotPositioner>
  );
};
