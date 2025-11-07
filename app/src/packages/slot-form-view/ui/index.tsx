import { useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  spacing,
  setCurrentScreen,
  useSlotFormStore,
  getSlotBackgroundColor,
  colors,
} from '@project/shared';
import { SlotTitle } from './SlotTitle';
import { SlotImage } from './SlotImage';
import {
  SlotStartTime,
  PaperProvider,
  getTimePickerTheme,
} from './SlotStartTime';
import { SlotEndTime } from './SlotEndTime';
import { SlotTask } from './SlotTask';
import { SlotMessage } from './SlotMessage';

const SlotFormScreen = () => {
  const [selectedSlot] = useSlotFormStore.selectedSlot();
  const backgroundColor = getSlotBackgroundColor(selectedSlot?.color);

  // Track when this screen becomes active
  useFocusEffect(
    useCallback(() => {
      setCurrentScreen('SlotForm');
    }, [])
  );

  const pickerTheme = useMemo(
    () => getTimePickerTheme(selectedSlot?.color),
    [selectedSlot?.color]
  );

  return (
    <PaperProvider theme={pickerTheme}>
      <View style={styles.container} pointerEvents="box-none">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[styles.slotCard, { backgroundColor }]}>
            <View style={styles.content}>
              <View style={styles.topRow}>
                <SlotStartTime />
                <SlotImage />
                <SlotEndTime />
              </View>
              <SlotTitle />
              <SlotTask />
              <SlotMessage />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    paddingTop: 70,
    flex: 1,
  },
  slotCard: {
    position: 'relative',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: spacing.xxxl,
    overflow: 'visible',
    flex: 1,
  },
  content: {
    transform: [{ translateY: -70 }],
  },
  topRow: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  placeholdersContainer: {
    marginTop: 16,
  },
});

export default SlotFormScreen;
