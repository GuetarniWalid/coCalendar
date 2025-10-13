import { StyleSheet, View } from 'react-native';
import Animated, { LinearTransition, FadeIn, FadeOut } from 'react-native-reanimated';
import { TIME_HANDLER_WIDTH, TIME_HANDLER_HEIGHT, TIME_HANDLER_ANIMATION_DURATION } from './shared/constants';

interface TimeHandlerProps {
  isDragging: boolean;
}

/**
 * Time handler component that appears next to the dragged slot
 * Shows time information during drag operations
 */
export const TimeHandler = ({ isDragging }: TimeHandlerProps) => {
  if (!isDragging) return null;

  return (
    <Animated.View 
      layout={LinearTransition.duration(TIME_HANDLER_ANIMATION_DURATION)} 
      style={styles.wrapper}
      entering={FadeIn.duration(TIME_HANDLER_ANIMATION_DURATION).delay(TIME_HANDLER_ANIMATION_DURATION)}
      exiting={FadeOut.duration(TIME_HANDLER_ANIMATION_DURATION)}
    >
      <View style={styles.timeHandler} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 1,
  },
  timeHandler: {
    width: TIME_HANDLER_WIDTH,
    height: TIME_HANDLER_HEIGHT,
    backgroundColor: 'red',
    borderRadius: 12,
    marginRight: 8,
  },
});

