import { View, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { SlotFormTime } from './SlotFormTime';
import { SlotFormTitle } from './SlotFormTitle';
import { SlotFormCloseHandle } from './SlotFormCloseHandle';
import { colors, spacing, borderRadius } from '@project/shared';

type SlotFormProps = {
  startTime: string;
  endTime: string;
  title: string;
  setTitle: (value: string) => void;
  titlePlaceholder: string;
  onClose: () => void;
};

export const SlotForm = ({ startTime, endTime, title, setTitle, titlePlaceholder, onClose }: SlotFormProps) => {
  const cardHeight = useSharedValue(-1);
  const measuredHeight = useSharedValue(0);
  const minHeight = useSharedValue(0);
  // Keep for future if we shift from full height to content height
  // const CARD_PADDING_TOP = spacing.xxxl;

  const cardStyle = useAnimatedStyle(() => ({
    ...(cardHeight.value >= 0 ? { height: cardHeight.value, flex: 0 } : { flex: 1 }),
  }));

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Animated.View
          style={[styles.card, cardStyle]}
          onLayout={e => {
            // Track current full height when not dragging so we can start from it without jumps
            if (cardHeight.value < 0) {
              measuredHeight.value = e.nativeEvent.layout.height;
            }
          }}
        >
          <View
            style={styles.header}
            onLayout={e => {
              const headerHeight = e.nativeEvent.layout.height;
              // Reserve space for the handle (40)
              minHeight.value = headerHeight + 40;
            }}
          >
            <SlotFormTime startTime={startTime} endTime={endTime} />
            <SlotFormTitle title={title} setTitle={setTitle} placeholder={titlePlaceholder} />
          </View>
          <SlotFormCloseHandle onClose={onClose} cardHeight={cardHeight} maxHeight={measuredHeight} minHeight={minHeight} />
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  card: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: colors.background.slot?.peachSoft ?? colors.background.secondary,
    borderRadius: borderRadius.xl,
    paddingTop: spacing.xxxl,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xxxl,
  },
  header: {
    paddingHorizontal: spacing.xxxl,
  },
});


