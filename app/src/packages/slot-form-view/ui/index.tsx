import { useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
  interpolate,
  useAnimatedRef,
  scrollTo,
  useScrollOffset,
} from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import {
  setCurrentScreen,
  useSlotFormStore,
  getSlotBackgroundColor,
  colors,
  FOCUSED_INPUT_OFFSET_FROM_KEYBOARD,
  useKeyboardLayoutValues,
  getCachedSlots,
  useCalendarStore,
} from '@project/shared';
import { SlotTitle } from './SlotTitle';
import { SlotImage, SLOT_IMAGE_SIZE } from './SlotImage';
import { SlotStartTime } from './SlotStartTime';
import { SlotEndTime } from './SlotEndTime';
import { SlotTaskList } from './SlotTaskList';
import { SlotMessage } from './SlotMessage';
import { NAV_HEIGHT } from '@project/bottom-navigation';
import { HEADER_HEIGHT } from '@project/day-view';

export const SLOT_FORM_PADDING_TOP = 70;
export const TOP_ROW_HEIGHT = SLOT_IMAGE_SIZE;
export const TOP_ROW_MARGIN_BOTTOM = 8;
export const SLOT_CARD_BORDER_RADIUS = 36;

const SlotFormScreen = () => {
  const [selectedSlot, setSelectedSlot] = useSlotFormStore.selectedSlot();
  const [selectedDate] = useCalendarStore.selectedDate();
  const backgroundColor = getSlotBackgroundColor(selectedSlot?.color);
  const { totalBottomNavHeight, maxTranslation } = useKeyboardLayoutValues(
    NAV_HEIGHT,
    HEADER_HEIGHT,
    TOP_ROW_HEIGHT
  );
  const keyboard = useAnimatedKeyboard();
  const scrollViewRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollViewRef);
  const messageInputRef = useRef<TextInput>(null);

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const borderRadius = interpolate(
      keyboard.height.value,
      [totalBottomNavHeight, totalBottomNavHeight + maxTranslation],
      [SLOT_CARD_BORDER_RADIUS, 0],
      'clamp'
    );

    return {
      borderTopLeftRadius: borderRadius,
      borderTopRightRadius: borderRadius,
    };
  });

  // Track when this screen becomes active and refresh slot data
  useFocusEffect(
    useCallback(() => {
      setCurrentScreen('SlotForm');

      // Refresh selectedSlot from cache to ensure we have the latest data
      // This fixes issues when navigating back via swipe gesture
      if (selectedSlot?.id && selectedDate) {
        const cachedSlots = getCachedSlots(selectedDate);
        const freshSlot = cachedSlots?.find(s => s.id === selectedSlot.id);

        if (freshSlot) {
          if (freshSlot !== selectedSlot) {
            setSelectedSlot(freshSlot);
          }
        }
      }
    }, [selectedSlot?.id, selectedDate])
  );

  const scrollToY = (y: number) => {
    'worklet';
    if (y <= 0) return;
    scrollTo(scrollViewRef, 0, scrollOffset.value + y, true);
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Animated.View
        style={[styles.slotCard, { backgroundColor }, cardAnimatedStyle]}
      >
        <View style={styles.content}>
          <View style={styles.topRow}>
            <SlotStartTime />
            <SlotEndTime />
            <SlotImage />
          </View>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={FOCUSED_INPUT_OFFSET_FROM_KEYBOARD}
            style={styles.keyboardAvoid}
          >
            <LinearGradient
              colors={[backgroundColor, 'transparent']}
              locations={[0.2, 1]}
              style={styles.gradientOverlay}
            />
            <Animated.ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={true}
              ref={scrollViewRef}
            >
              <SlotTitle />
              {selectedSlot && (
                <SlotTaskList
                  scrollToY={scrollToY}
                  messageInputRef={messageInputRef}
                />
              )}
              <SlotMessage ref={messageInputRef} />
            </Animated.ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    paddingTop: SLOT_FORM_PADDING_TOP,
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  gradientOverlay: {
    position: 'absolute',
    top: SLOT_IMAGE_SIZE/2,
    left: 0,
    right: 0,
    height: 14,
    zIndex: 1000,
  },
  scrollView: {
    flexGrow: 1,
    flexShrink: 1,
    marginTop: SLOT_IMAGE_SIZE/2,
  },
  scrollContent: {
    flexGrow: 1,
  },
  slotCard: {
    position: 'relative',
    borderTopLeftRadius: SLOT_CARD_BORDER_RADIUS,
    borderTopRightRadius: SLOT_CARD_BORDER_RADIUS,
    paddingHorizontal: 32,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 0,
  },
  topRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginTop: -SLOT_FORM_PADDING_TOP,
    marginBottom: TOP_ROW_MARGIN_BOTTOM,
    zIndex: 1000,
  },
  placeholdersContainer: {
    marginTop: 16,
  },
});

export default SlotFormScreen;
