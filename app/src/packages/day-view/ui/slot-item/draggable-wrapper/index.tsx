import { forwardRef, ReactNode, useEffect, useState } from 'react';
import Animated from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';
import { Portal } from 'react-native-teleport';
import { useVerticalConstraint, useZoneDetection, useDragGesture } from './hooks';

interface DraggableSlotWrapperProps {
  children: ReactNode;
  onPress: () => void;
  index: number;
}

/**
 * Wrapper component that makes a slot draggable with gesture handling
 * Orchestrates drag behavior, constraints, and zone detection
 */
export const DraggableSlotWrapper = forwardRef<Animated.View, DraggableSlotWrapperProps>(
  ({ children, onPress, index }, slotRef) => {
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
    portalEnabled,
    draggedSlotInitialOffsetY
  } = useDraggedSlotContext();
  
  const [panState, setPanState] = useState<'idle' | 'start' | 'end'>('idle');
  
  // Hook for vertical constraint logic
  const { constrainVerticalOffset } = useVerticalConstraint();
  
  // Hook for zone detection logic
  const { updateZones } = useZoneDetection(draggedSlotZone, draggedSlotHorizontalZone);
  
  // Hook for drag gesture handling
  const { gesture } = useDragGesture({
    slotRef: slotRef as any,
    index,
    onPress,
    draggedSlotX,
    draggedSlotY,
    draggedSlotOffsetX,
    draggedSlotOffsetY,
    draggedSlotHeight,
    draggedSlotIndex,
    draggedSlotZone,
    draggedSlotHorizontalZone,
    draggedSlotInitialOffsetY,
    setDraggedSlotIndexRN,
    setPanState,
    constrainVerticalOffset,
    updateZones,
  });

  useEffect(() => {
    if (index !== draggedSlotIndexRN) return;
    if (panState !== 'end') return;
    setDraggedSlotIndexRN(null);
    setPanState('idle');
  }, [panState, index, setDraggedSlotIndexRN, draggedSlotIndexRN]);

  return (
    <Animated.View ref={slotRef}>
      <Portal hostName={index === draggedSlotIndexRN && portalEnabled && panState === 'start' ? 'draggableLayer' : undefined}>
        <GestureDetector gesture={gesture}>{children}</GestureDetector>
      </Portal>
    </Animated.View>
  );
});

