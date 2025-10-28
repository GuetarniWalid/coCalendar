import { StyleSheet } from 'react-native';
import { colors, useCalendarStore } from '@project/shared';
import Animated, { useAnimatedRef, useAnimatedScrollHandler } from 'react-native-reanimated';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';
import { useEffect } from 'react';

interface ControllableScrollViewProps {
  children: React.ReactNode;
  date: string;
}

export const ControllableScrollView = ({
  children,
  date,
}: ControllableScrollViewProps) => {
  const animatedRef = useAnimatedRef<Animated.ScrollView>();
  const { draggedSlot, newDraggedSlotScrollY, firstOriginalSlotY, lastOriginalSlotY, initialScroll } = useDraggedSlotContext();
  const [selectedDate] = useCalendarStore.selectedDate();

  useEffect(() => {
    if (!draggedSlot) return;
    if(date !== selectedDate) return;

    animatedRef.current?.scrollTo({
      y: newDraggedSlotScrollY,
      animated: true,
    });
  }, [newDraggedSlotScrollY]);

  const scrollHandler = useAnimatedScrollHandler({
    onMomentumBegin: (e) => {
      initialScroll.value = e.contentOffset.y;
    },
    onMomentumEnd: (e) => {
      lastOriginalSlotY.value = firstOriginalSlotY.value - e.contentOffset.y + initialScroll.value;
    },
  });

  return (
    <Animated.ScrollView
      ref={animatedRef}
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      onScroll={scrollHandler}
    >
      {children}
    </Animated.ScrollView>
  );
};

ControllableScrollView.displayName = 'ControllableScrollView';

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 24,
    paddingBottom: 12,
    backgroundColor: colors.background.primary,
  },
});
