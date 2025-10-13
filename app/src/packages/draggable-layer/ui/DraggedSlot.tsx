import { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, { AnimatedStyle } from 'react-native-reanimated';
import { PortalHost } from 'react-native-teleport';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';

type DraggedSlotProps = {
  animatedStyle: AnimatedStyle<ViewStyle>;
};

/**
 * Portal host for the dragged slot element
 */
export const DraggedSlot = ({ animatedStyle }: DraggedSlotProps) => {
  const { setPortalEnabled } = useDraggedSlotContext();

  // Enable portal on mount, disable on unmount
  useEffect(() => {
    setPortalEnabled(true);
    return () => {
      setPortalEnabled(false);
    };
  }, [setPortalEnabled]);

  return (
    <Animated.View style={[animatedStyle]}>
      <PortalHost name='draggableLayer' />
    </Animated.View>
  );
};

