import { View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSharedValue, withTiming, runOnJS, type SharedValue } from 'react-native-reanimated';
import { ChevronCompactUp } from '@project/icons/app/chevron-compact-up';
import { colors } from '@project/shared';

type SlotFormCloseHandleProps = {
  onClose: () => void;
  cardHeight: SharedValue<number>;
  maxHeight: SharedValue<number>;
  closeThreshold?: number;
  minHeight?: SharedValue<number>;
};

export const SlotFormCloseHandle = ({ onClose, cardHeight, maxHeight, closeThreshold = 50, minHeight }: SlotFormCloseHandleProps) => {
  const startHeight = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onBegin(() => {
      const current = cardHeight.value > 0 ? cardHeight.value : maxHeight.value;
      startHeight.value = current;
      // Do not modify height on begin; we only switch to explicit height on first move
    })
    .onChange(e => {
      // Switch to explicit height the first time finger moves
      if (cardHeight.value < 0) {
        // initialize with current visible content height (maxHeight minus top padding already accounted upstream)
        cardHeight.value = Math.max(0, maxHeight.value);
        startHeight.value = cardHeight.value;
      }
      // Bottom follows finger: drag down (translationY > 0) increases height, drag up decreases
      const lowerBound = minHeight ? minHeight.value : 0;
      const nextHeight = Math.max(lowerBound, Math.min(maxHeight.value, startHeight.value + e.translationY));
      cardHeight.value = nextHeight;
    })
    .onEnd(e => {
      const lowerBound = minHeight ? minHeight.value : 0;
      const effectiveHeight = cardHeight.value > 0 ? cardHeight.value : maxHeight.value;
      const closableRange = Math.max(0, maxHeight.value - lowerBound);
      const draggedUp = Math.max(0, maxHeight.value - effectiveHeight);
      const progress = closableRange === 0 ? 0 : draggedUp / closableRange; // 0=open, 1=closed

      const EPS = 60;        // near-static velocity window
      const DOWN_MIN = 180;  // symmetric intent thresholds
      const UP_MIN = 180;    // symmetric intent thresholds
      const RATIO_THRESHOLD = Math.min(0.8, Math.max(0.3, (closeThreshold ?? 0) / Math.max(1, closableRange)) || 0.5);

      const openToMax = () => {
        cardHeight.value = withTiming(maxHeight.value, { duration: 100 }, finished => {
          if (finished) cardHeight.value = -1; // back to flex mode
        });
      };
      const closeToMin = () => {
        cardHeight.value = withTiming(lowerBound, { duration: 100 }, finished => {
          if (finished) runOnJS(onClose)();
        });
      };

      // 1) Static release -> decide by progress only
      if (Math.abs(e.velocityY) < EPS) {
        if (progress >= RATIO_THRESHOLD) closeToMin(); else openToMax();
        return;
      }

      // 2) Directional release
      if (e.velocityY > DOWN_MIN) { openToMax(); return; }
      if (e.velocityY < -UP_MIN) { closeToMin(); return; }

      // 3) Otherwise fall back to progress
      if (progress >= RATIO_THRESHOLD) closeToMin(); else openToMax();
    });

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.dragHandleContainer}>
        <ChevronCompactUp color={colors.typography.primary} />
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  dragHandleContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
});


