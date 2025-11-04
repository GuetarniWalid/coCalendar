import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';
import React from 'react';
import Animated, {
  clamp,
  useAnimatedReaction,
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

interface IncompleteIconProps {
  color?: string;
  side: 'left' | 'right';
}

export const IncompleteIcon: React.FC<IncompleteIconProps> = ({
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
      <Svg width="100%" height="100%" viewBox="0 0 117 98" fill="none">
        <Path
          d="M26.0586 1C27.5024 1.00008 28.8912 1.53709 29.957 2.50098L30.166 2.7002L30.167 2.70117C31.2552 3.79098 31.8662 5.26845 31.8662 6.80859C31.8661 8.34877 31.2554 9.82625 30.167 10.916H30.166L20.8369 20.2461H77.623C83.4066 20.2461 88.1356 20.2449 91.9697 20.5898H91.9707C95.9295 20.9491 99.4933 21.7212 102.757 23.6074H102.756C106.566 25.8056 109.731 28.9677 111.932 32.7764L111.933 32.7783C113.694 35.8374 114.483 39.1597 114.871 42.8252L114.943 43.5625V43.5635C115.288 47.3976 115.287 52.1266 115.287 57.9102V58.373C115.287 64.1566 115.288 68.8856 114.943 72.7197V72.7207C114.584 76.678 113.819 80.2428 111.925 83.5078C109.727 87.3173 106.565 90.481 102.757 92.6816L102.755 92.6826C99.492 94.5616 95.9295 95.3341 91.9707 95.6934H91.9697C88.1356 96.0383 83.4066 96.0371 77.623 96.0371H32.4746C30.9332 96.037 29.4552 95.4248 28.3652 94.335C27.2752 93.2449 26.6621 91.7662 26.6621 90.2246C26.6622 88.6832 27.2753 87.2052 28.3652 86.1152C29.4552 85.0253 30.9332 84.4122 32.4746 84.4121H77.3916C83.4946 84.4121 87.6874 84.4116 90.916 84.1152H90.917C94.0764 83.8263 95.7419 83.308 96.9434 82.6152L97.3232 82.3877C99.0731 81.2994 100.549 79.8231 101.638 78.0732L101.865 77.6934C102.558 76.4919 103.076 74.8264 103.365 71.667C103.655 68.437 103.662 64.242 103.662 58.1416C103.662 52.0386 103.662 47.8458 103.365 44.6172V44.6162C103.076 41.4568 102.558 39.7913 101.865 38.5898C100.685 36.5458 98.9874 34.8477 96.9434 33.668V33.667C95.742 32.9744 94.076 32.4569 90.917 32.168V32.167C87.687 31.8769 83.4919 31.8711 77.3916 31.8711H20.8369L30.166 41.2002H30.165C30.7244 41.7276 31.1743 42.3601 31.4873 43.0625C31.805 43.7755 31.9765 44.5457 31.9902 45.3262C32.0039 46.1065 31.8597 46.8818 31.5674 47.6055C31.275 48.3291 30.8399 48.9862 30.2881 49.5381C29.7362 50.0899 29.0791 50.525 28.3555 50.8174C27.6318 51.1097 26.8565 51.2539 26.0762 51.2402C25.2957 51.2265 24.5255 51.055 23.8125 50.7373C23.1101 50.4243 22.4776 49.9744 21.9502 49.415V49.416L2.7002 30.166C1.61178 29.0762 1.00009 27.5988 1 26.0586C1 24.5183 1.61173 23.041 2.7002 21.9512V21.9502L21.9502 2.7002H21.9512C23.041 1.61173 24.5183 1 26.0586 1Z"
          fill={color}
          stroke={color}
          strokeWidth="3"
        />
      </Svg>
    </Animated.View>
  );
};
