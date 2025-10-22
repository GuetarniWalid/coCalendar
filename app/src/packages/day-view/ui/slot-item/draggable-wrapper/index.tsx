import { forwardRef, ReactNode, useEffect, useState } from 'react';
import Animated from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';
import { Portal } from 'react-native-teleport';
import { useZoneDetection, useDragGesture } from './hooks';
import { StyleSheet } from 'react-native';

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
export const DraggableSlotWrapper = forwardRef<
  Animated.View,
  DraggableSlotWrapperProps
>(({ children, onPress, index, slotStartTime, slotColor }, slotRef) => {
  const {
    draggedSlotZone,
    draggedSlotHorizontalZone,
    setDraggedSlotIndexRN,
    draggedSlotIndexRN,
    portalEnabled,
    draggedSlotInitialOffsetY,
    setDraggedSlotData,
  } = useDraggedSlotContext();

  const [panState, setPanState] = useState<'idle' | 'start' | 'end'>('idle');
  const isDragging =
    index === draggedSlotIndexRN && portalEnabled && panState === 'start';

  // Handle slot data on drag start
  useEffect(() => {
    if (isDragging) {
      // set slot data immediately when dragging starts
      setDraggedSlotData({ startTime: slotStartTime, color: slotColor });
      return;
    }
    return undefined;
  }, [isDragging, slotStartTime, slotColor, setDraggedSlotData]);

  // Hook for zone detection logic
  const { updateZones } = useZoneDetection(
    draggedSlotZone,
    draggedSlotHorizontalZone
  );

  // Hook for drag gesture handling
  const { gesture } = useDragGesture({
    slotRef: slotRef as any,
    index,
    onPress,
    draggedSlotInitialOffsetY,
    setPanState,
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
            <Animated.View style={styles.slotWrapper}>{children}</Animated.View>
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
});
