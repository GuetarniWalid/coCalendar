import { StyleSheet, Text } from 'react-native';
import Animated, { LinearTransition, FadeIn, FadeOut } from 'react-native-reanimated';
import { TIME_HANDLER_WIDTH, TIME_HANDLER_HEIGHT, TIME_HANDLER_ANIMATION_DURATION } from './shared/constants';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';
import { getSlotBackgroundColor, fontSize, fontWeight, colors } from '@project/shared';
import { useTimeCalculation } from './hooks/useTimeCalculation';
import { formatTimeByLocale } from './TimeDisplay';

interface TimeHandlerProps {
  isDragging: boolean;
}

/**
 * Time handler component that appears next to the dragged slot
 * Shows adjusted time based on vertical drag position
 * - Displays original time when in snap zone (at origin)
 * - Shows adjusted time when dragging up/down (updates every 500ms)
 * - Time increases when dragging down, decreases when dragging up
 */
export const TimeHandler = ({ isDragging }: TimeHandlerProps) => {
  const { 
    draggedSlotData,
    draggedSlotOffsetY,
  } = useDraggedSlotContext();
  
  // Calculate adjusted time with zone-based rate system
  const { adjustedTime } = useTimeCalculation(
    draggedSlotOffsetY,
    isDragging,
    draggedSlotData?.startTime || null
  );
  
  if (!isDragging) {
    return null;
  }

  // If slot data not yet ready, render shell with original placeholder time blocked by formatter
  if (!draggedSlotData) {
    return (
      <Animated.View 
        layout={LinearTransition.duration(TIME_HANDLER_ANIMATION_DURATION)} 
        style={styles.wrapper}
        entering={FadeIn.duration(TIME_HANDLER_ANIMATION_DURATION).delay(TIME_HANDLER_ANIMATION_DURATION)}
        exiting={FadeOut.duration(TIME_HANDLER_ANIMATION_DURATION)}
      >
        <Animated.View style={[styles.timeHandler, { backgroundColor: colors.background.secondary }]}>
          <Text style={styles.timeText}>--:--</Text>
        </Animated.View>
      </Animated.View>
    );
  }

  const formattedTime = formatTimeByLocale(adjustedTime);
  const backgroundColor = getSlotBackgroundColor(draggedSlotData.color);

  return (
    <Animated.View 
      layout={LinearTransition.duration(TIME_HANDLER_ANIMATION_DURATION)} 
      style={styles.wrapper}
      entering={FadeIn.duration(TIME_HANDLER_ANIMATION_DURATION).delay(TIME_HANDLER_ANIMATION_DURATION)}
      exiting={FadeOut.duration(TIME_HANDLER_ANIMATION_DURATION)}
    >
      <Animated.View style={[styles.timeHandler, { backgroundColor }]}>
        <Text style={styles.timeText}>{formattedTime}</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    top: 12,
    zIndex: 1,
  },
  timeHandler: {
    width: TIME_HANDLER_WIDTH,
    height: TIME_HANDLER_HEIGHT,
    borderRadius: 12,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.typography.primary,
  },
});

