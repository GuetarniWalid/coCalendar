import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';
import React from 'react';
import Animated, {
  clamp,
  useAnimatedReaction,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';

interface TrashIconProps {
  color?: string;
  side: 'left' | 'right';
}

export const TrashIcon: React.FC<TrashIconProps> = ({
  color = 'currentColor',
  side,
}) => {
  const { draggedSlotOffsetX, areSwipeButtonsDisabled, isVerticalSnapActive, isHorizontalSnapActive, isDragging } = useDraggedSlotContext();
  const svgSize = useSharedValue(0);
  const wasVerticalSnapActive = useSharedValue(true);
  const wasHorizontalSnapActive = useSharedValue(false);
  const isDisabling = useSharedValue(false);

  const isLeftButton = side === 'left';

  useAnimatedReaction(
    () => ({
      offset: draggedSlotOffsetX.value,
      disabled: areSwipeButtonsDisabled.value,
      verticalActive: isVerticalSnapActive.value,
      horizontalActive: isHorizontalSnapActive.value,
      isDragging: isDragging.value,
    }),
    (current, previous) => {
      if (current.isDragging && previous && !previous.isDragging) {
        isDisabling.value = false;
      }
      const rawOffset = current.offset ?? 0;
      const prevOffset = previous?.offset ?? 0;
      const offsetValue = isLeftButton ? rawOffset : Math.abs(rawOffset);

      const isMovingRight = rawOffset > prevOffset;
      const isMovingLeft = rawOffset < prevOffset;
      const isPositive = rawOffset > 0;
      const isNegative = rawOffset < 0;
      const movingAwayFromButton = (isPositive && isMovingRight) || (isNegative && isMovingLeft);

      const justBrokeVertical = wasVerticalSnapActive.value && !current.verticalActive;
      const justBrokeHorizontal = wasHorizontalSnapActive.value && !current.horizontalActive;

      if (justBrokeVertical || (justBrokeHorizontal && movingAwayFromButton)) {
        isDisabling.value = true;
        svgSize.value = withTiming(0, { duration: 150 });
        wasVerticalSnapActive.value = current.verticalActive;
        wasHorizontalSnapActive.value = current.horizontalActive;
        return;
      }

      if (current.disabled || isDisabling.value) {
        return;
      }

      if (previous?.offset === current.offset) return;

      if ((isLeftButton && rawOffset < 0) || (!isLeftButton && rawOffset > 0)) {
        return;
      }

      const delayedSize = Math.max(0, offsetValue - 50);
      const newSize = clamp(delayedSize, 0, 40);
      svgSize.value = newSize;

      if (newSize >= 40 && current.horizontalActive) {
        wasHorizontalSnapActive.value = true;
      }
      wasVerticalSnapActive.value = current.verticalActive;
      wasHorizontalSnapActive.value = current.horizontalActive;
    }
  );

  const animatedStyle = useAnimatedStyle(() => ({
    width: svgSize.value,
    height: svgSize.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
        <G clipPath="url(#clip0_378_140)">
          <Path
            d="M95.3333 31.3008H4.66663C3.53946 31.3008 2.45845 30.853 1.66142 30.056C0.864392 29.259 0.416626 28.178 0.416626 27.0508C0.416626 25.9236 0.864392 24.8426 1.66142 24.0456C2.45845 23.2485 3.53946 22.8008 4.66663 22.8008H95.3333C96.4605 22.8008 97.5415 23.2485 98.3385 24.0456C99.1355 24.8426 99.5833 25.9236 99.5833 27.0508C99.5833 28.178 99.1355 29.259 98.3385 30.056C97.5415 30.853 96.4605 31.3008 95.3333 31.3008Z"
            fill={color}
          />
          <Path
            d="M75.16 99.5834H24.84C23.0442 99.7062 21.2419 99.4713 19.5376 98.8923C17.8332 98.3133 16.2607 97.4018 14.9113 96.2105C13.5619 95.0193 12.4624 93.572 11.6766 91.9526C10.8907 90.3332 10.4342 88.5739 10.3334 86.7767V27.3334C10.3334 26.2062 10.7811 25.1252 11.5782 24.3281C12.3752 23.5311 13.4562 23.0833 14.5834 23.0833C15.7105 23.0833 16.7915 23.5311 17.5886 24.3281C18.3856 25.1252 18.8334 26.2062 18.8334 27.3334V86.7767C18.8334 89.1 21.4967 91.0834 24.5 91.0834H74.82C77.9934 91.0834 80.4867 89.1 80.4867 86.7767V27.3334C80.4867 26.116 80.9703 24.9485 81.8311 24.0877C82.6919 23.2269 83.8594 22.7434 85.0767 22.7434C86.2941 22.7434 87.4615 23.2269 88.3223 24.0877C89.1831 24.9485 89.6667 26.116 89.6667 27.3334V86.7767C89.5659 88.5739 89.1093 90.3332 88.3235 91.9526C87.5376 93.572 86.4381 95.0193 85.0887 96.2105C83.7393 97.4018 82.1669 98.3133 80.4625 98.8923C78.7582 99.4713 76.9559 99.7062 75.16 99.5834ZM75.84 25.9167C75.2798 25.9243 74.7237 25.8196 74.2047 25.6087C73.6856 25.3978 73.214 25.0851 72.8179 24.6889C72.4217 24.2927 72.1089 23.8211 71.898 23.3021C71.6871 22.783 71.5824 22.2269 71.59 21.6667V13.2234C71.59 10.9 68.87 8.91668 65.9234 8.91668H34.2467C31.13 8.91668 28.58 10.9 28.58 13.2234V21.6667C28.58 22.7939 28.1323 23.8749 27.3352 24.6719C26.5382 25.4689 25.4572 25.9167 24.33 25.9167C23.2029 25.9167 22.1219 25.4689 21.3248 24.6719C20.5278 23.8749 20.08 22.7939 20.08 21.6667V13.2234C20.2994 9.66078 21.9049 6.32568 24.5527 3.93209C27.2005 1.53849 30.6801 0.276638 34.2467 0.416682H65.7534C69.3486 0.230744 72.8719 1.47193 75.5567 3.87024C78.2415 6.26856 79.8708 9.62999 80.09 13.2234V21.6667C80.0975 22.2296 79.9932 22.7883 79.7829 23.3105C79.5727 23.8327 79.2609 24.3079 78.8655 24.7086C78.4701 25.1093 77.999 25.4274 77.4796 25.6445C76.9603 25.8616 76.403 25.9734 75.84 25.9734V25.9167Z"
            fill={color}
          />
          <Path
            d="M39.9133 78.3341C38.7907 78.3194 37.7182 77.8669 36.9244 77.073C36.1305 76.2792 35.678 75.2067 35.6633 74.0841V48.4141C35.6633 47.2869 36.1111 46.2059 36.9081 45.4089C37.7052 44.6118 38.7862 44.1641 39.9133 44.1641C41.0405 44.1641 42.1215 44.6118 42.9185 45.4089C43.7156 46.2059 44.1633 47.2869 44.1633 48.4141V74.0274C44.1708 74.5903 44.0664 75.149 43.8562 75.6712C43.646 76.1934 43.3341 76.6686 42.9387 77.0693C42.5433 77.47 42.0723 77.7881 41.5529 78.0052C41.0336 78.2223 40.4762 78.3341 39.9133 78.3341ZM60.0867 78.3341C58.9595 78.3341 57.8785 77.8863 57.0815 77.0893C56.2844 76.2922 55.8367 75.2112 55.8367 74.0841V48.4141C55.8367 47.2869 56.2844 46.2059 57.0815 45.4089C57.8785 44.6118 58.9595 44.1641 60.0867 44.1641C61.2138 44.1641 62.2948 44.6118 63.0919 45.4089C63.8889 46.2059 64.3367 47.2869 64.3367 48.4141V74.0274C64.3368 75.1598 63.8908 76.2468 63.0954 77.0528C62.2999 77.8589 61.219 78.3192 60.0867 78.3341Z"
            fill={color}
          />
        </G>
        <Defs>
          <ClipPath id="clip0_378_140">
            <Rect width="100" height="100" fill={color} />
          </ClipPath>
        </Defs>
      </Svg>
    </Animated.View>
  );
};
