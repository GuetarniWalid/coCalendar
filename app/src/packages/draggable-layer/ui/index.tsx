import { View, StyleSheet } from 'react-native';
import { ScrollZones } from './ScrollZones';
import { DraggedSlot } from './DraggedSlot';

const PADDING = 12;

/**
 * Main draggable layer component
 * Orchestrates horizontal scrolling, visual effects, and dragged slot positioning
 */
export const DraggableLayer = () => {
  return (
    <View style={styles.container} pointerEvents="none">
      <ScrollZones />
      <DraggedSlot padding={PADDING} />
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
    paddingHorizontal: PADDING,
  },
});
