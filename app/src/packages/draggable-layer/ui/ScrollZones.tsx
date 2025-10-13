import { StyleSheet, ViewStyle } from 'react-native';
import Animated, { AnimatedStyle } from 'react-native-reanimated';
import { CALENDAR_CONSTANTS } from '@project/shared';

type ScrollZonesProps = {
  leftZoneStyle: AnimatedStyle<ViewStyle>;
  rightZoneStyle: AnimatedStyle<ViewStyle>;
};

/**
 * Visual indicators for left and right scroll zones
 */
export const ScrollZones = ({ leftZoneStyle, rightZoneStyle }: ScrollZonesProps) => {
  return (
    <>
      <Animated.View style={[styles.leftZone, leftZoneStyle]} />
      <Animated.View style={[styles.rightZone, rightZoneStyle]} />
    </>
  );
};

const styles = StyleSheet.create({
  leftZone: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: CALENDAR_CONSTANTS.HORIZONTAL_SCROLL_ZONE_WIDTH,
  },
  rightZone: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: CALENDAR_CONSTANTS.HORIZONTAL_SCROLL_ZONE_WIDTH,
  },
});

