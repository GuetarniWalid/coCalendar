import { View, StyleSheet } from 'react-native';
import { useHorizontalScroll } from '../hooks/useHorizontalScroll';
import { useZoneVisualEffects } from '../hooks/useZoneVisualEffects';
import { useDraggedSlotPosition } from '../hooks/useDraggedSlotPosition';
import { ScrollZones } from './ScrollZones';
import { DraggedSlot } from './DraggedSlot';

/**
 * Main draggable layer component
 * Orchestrates the different concerns: horizontal scrolling, visual effects, and dragged slot position
 */
export const DraggableLayer = () => {
  // Handle horizontal scrolling logic
  useHorizontalScroll();
  
  // Handle visual effects for scroll zones
  const { leftZoneStyle, rightZoneStyle } = useZoneVisualEffects();
  
  // Handle position animation for dragged slot
  const { animatedStyle } = useDraggedSlotPosition();

  return (
    <View style={styles.container} pointerEvents='none'>
      <ScrollZones leftZoneStyle={leftZoneStyle} rightZoneStyle={rightZoneStyle} />
      <DraggedSlot animatedStyle={animatedStyle} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
});
