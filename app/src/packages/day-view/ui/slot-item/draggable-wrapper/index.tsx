import { forwardRef, ReactNode, useEffect, useState } from 'react';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';
import { Portal } from 'react-native-teleport';
import { useVerticalConstraint, useZoneDetection, useDragGesture } from './hooks';
import { TimeHandler } from './TimeHandler';
import { StyleSheet } from 'react-native';
import { TIME_HANDLER_WIDTH, TIME_HANDLER_ANIMATION_DURATION, TIME_HANDLER_MARGIN } from './shared/constants';

interface DraggableSlotWrapperProps {
  children: ReactNode;
  onPress: () => void;
  index: number;
  slotStartTime: string | null;
  slotColor: string;
}

/**
 * Wrapper component that makes a slot draggable with gesture handling
 * Orchestrates drag behavior, constraints, and zone detection
 */
export const DraggableSlotWrapper = forwardRef<Animated.View, DraggableSlotWrapperProps>(
  ({ children, onPress, index, slotStartTime, slotColor }, slotRef) => {
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
    draggedSlotInitialOffsetY,
    isSnapped,
    isBreakingSnap,
    dragDirection,
    lockedOffsetY,
    setDraggedSlotData
  } = useDraggedSlotContext();
  
  const [panState, setPanState] = useState<'idle' | 'start' | 'end'>('idle');
  const isDragging = index === draggedSlotIndexRN && portalEnabled && panState === 'start';
  const [hasMargin, setHasMargin] = useState(false);

  // Handle margin state and slot data with delay on drag end
  useEffect(() => {
    if (isDragging) {
      // Add margin and set slot data immediately when dragging starts
      setHasMargin(true);
      setDraggedSlotData({ startTime: slotStartTime, color: slotColor });
      return;
    }

    // When stopping dragging for this index, clear the draggedSlotData only if
    // this slot was the one providing it, to avoid clearing while switching slots quickly
    if (hasMargin) {
      const timer = setTimeout(() => {
        setHasMargin(false);
        setDraggedSlotData(null);
      }, TIME_HANDLER_ANIMATION_DURATION);
      return () => clearTimeout(timer);
    }

    return undefined;
  }, [isDragging, hasMargin, slotStartTime, slotColor, setDraggedSlotData]);
  
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
    isSnapped,
    isBreakingSnap,
    dragDirection,
    lockedOffsetY,
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
      <Portal hostName={isDragging ? 'draggableLayer' : undefined}>
        <GestureDetector gesture={gesture}>
          <Animated.View style={styles.container}>
            <TimeHandler isDragging={isDragging} />
            <Animated.View layout={LinearTransition.duration(TIME_HANDLER_ANIMATION_DURATION)} style={[styles.slotWrapper, hasMargin && styles.slotWrapperDragging]}>
              {children}
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </Portal>
    </Animated.View>
  );
});



const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
  },
  slotWrapper: {
    width: '100%',
  },
  slotWrapperDragging: {
    marginLeft: TIME_HANDLER_WIDTH + TIME_HANDLER_MARGIN,
  },
});

