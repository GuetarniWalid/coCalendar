import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';
import React from 'react';
import Animated, {
  clamp,
  useAnimatedReaction,
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

interface CompleteIconProps {
  color?: string;
  side: 'left' | 'right';
}

export const CompleteIcon: React.FC<CompleteIconProps> = ({
  color = 'currentColor',
  side,
}) => {
  const { draggedSlotOffsetX } = useDraggedSlotContext();
  const svgSize = useSharedValue(0);

  const isLeftButton = side === 'left';

  useAnimatedReaction(
    () => draggedSlotOffsetX.value,
    (offset, prevOffset) => {
      if (prevOffset === offset) return;

      const rawOffset = offset ?? 0;
      const offsetValue = isLeftButton ? rawOffset : Math.abs(rawOffset);

      if ((isLeftButton && rawOffset < 0) || (!isLeftButton && rawOffset > 0)) {
        return;
      }

      const delayedSize = Math.max(0, offsetValue - 50);
      svgSize.value = clamp(delayedSize, 0, 40);
    }
  );

  const animatedStyle = useAnimatedStyle(() => ({
    width: svgSize.value,
    height: svgSize.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Svg width="100%" height="100%" viewBox="0 0 101 77" fill="none">
        <Path
          d="M37.8341 50.8077L82.6839 2.91824C84.6241 0.972663 87.0934 -0.00012207 90.0919 -0.00012207C93.0904 -0.00012207 95.5598 0.972663 97.5 2.91824C99.4402 4.86382 100.41 7.34001 100.41 10.3468C100.41 13.3536 99.4402 15.8298 97.5 17.7754L45.2421 73.0935C43.1256 75.2159 40.6562 76.2771 37.8341 76.2771C35.012 76.2771 32.5426 75.2159 30.426 73.0935L2.91031 45.5015C0.970101 43.556 0 41.0798 0 38.073C0 35.0662 0.970101 32.59 2.91031 30.6444C4.85052 28.6988 7.31988 27.7261 10.3184 27.7261C13.3169 27.7261 15.7863 28.6988 17.7265 30.6444L37.8341 50.8077Z"
          fill={color}
        />
      </Svg>
    </Animated.View>
  );
};
