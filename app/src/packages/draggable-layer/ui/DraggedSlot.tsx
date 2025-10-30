import { useRef, useEffect, useCallback } from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';
import { Slot } from '@project/day-view';
import { useDraggedSlotPosition } from '../hooks/useDraggedSlotPosition';
import { StyleSheet } from 'react-native';

type DraggedSlotProps = {
  padding: number;
};

const IMAGE_LOAD_TIMEOUT = 300;

export const DraggedSlot = ({ padding }: DraggedSlotProps) => {
  const { draggedSlot, draggedSlotOpacity } = useDraggedSlotContext();
  const imageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { animatedStyle } = useDraggedSlotPosition({ padding });

  const clearImageTimeout = useCallback(() => {
    if (imageTimeoutRef.current) {
      clearTimeout(imageTimeoutRef.current);
      imageTimeoutRef.current = null;
    }
  }, []);

  const showSlot = useCallback(() => {
    clearImageTimeout();
    draggedSlotOpacity.value = 1;
  }, [clearImageTimeout]);

  const hideSlot = useCallback(() => {
    clearImageTimeout();
    draggedSlotOpacity.value = 0;
  }, [clearImageTimeout]);

  // Handle slot changes
  useEffect(() => {
    if (draggedSlot) {
      hideSlot();
      imageTimeoutRef.current = setTimeout(showSlot, IMAGE_LOAD_TIMEOUT);
    } else {
      hideSlot();
    }
  }, [draggedSlot, showSlot, hideSlot]);

  // Cleanup on unmount
  useEffect(() => clearImageTimeout, [clearImageTimeout]);

  const handleImageLoad = useCallback(() => {
    showSlot();
  }, [showSlot]);

  const animatedOpacityStyle = useAnimatedStyle(() => ({
    opacity: draggedSlotOpacity.value,
  }));

  if (!draggedSlot) return null;

  return (
    <Animated.View style={[animatedStyle, animatedOpacityStyle]}>
      <Slot slot={draggedSlot} onImageLoad={handleImageLoad} draggedShadowStyle={styles.shadow} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  shadow: {
    boxShadow: '0px 0px 5px 0 rgba(0, 0, 0, 0.15)',
  },
})