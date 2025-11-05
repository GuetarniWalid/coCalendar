import { useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  spacing,
  setCurrentScreen,
  useSlotFormStore,
  getSlotBackgroundColor,
  getAvatarPublicUrl,
  colors,
} from '@project/shared';
import { useTranslation } from '@project/i18n';
import { useSlotTimeUpdate } from '../shared/hooks';
import { SlotTitle } from './SlotTitle';
import { SlotImage } from './SlotImage';
import { SlotStartTime, PaperProvider, getTimePickerTheme } from './SlotStartTime';
import { SlotEndTime } from './SlotEndTime';
import { SlotTaskPlaceholder } from './SlotTaskPlaceholder';
import { SlotMessagePlaceholder } from './SlotMessagePlaceholder';

const SlotFormScreen = () => {
  const t = useTranslation();
  const [selectedSlot] = useSlotFormStore.selectedSlot();
  const { updateStartTime, updateEndTime } = useSlotTimeUpdate();
  const backgroundColor = getSlotBackgroundColor(selectedSlot?.color);

  // Track when this screen becomes active
  useFocusEffect(
    useCallback(() => {
      setCurrentScreen('SlotForm');
    }, [])
  );

  // Default values when no slot is selected
  const defaultImage = {
    persona: 'adult-female' as const,
    activity: 'job_study',
    name: 'working_desktop',
    extension: 'webp' as const,
  };

  const displayTitle = selectedSlot?.title || t.titleLabel;
  const imageUri = getAvatarPublicUrl(selectedSlot?.image || defaultImage);

  const pickerTheme = useMemo(
    () => getTimePickerTheme(selectedSlot?.color),
    [selectedSlot?.color]
  );

  return (
    <PaperProvider theme={pickerTheme}>
      <View style={styles.container}>
        <View style={[styles.slotCard, { backgroundColor }]}>
          <View style={styles.content}>
            <View style={styles.topRow}>
              <SlotStartTime
                slot={selectedSlot}
                onTimeChange={updateStartTime}
              />
              <SlotImage imageUri={imageUri} />
              <SlotEndTime
                endTime={selectedSlot?.endTime}
                slotColor={selectedSlot?.color}
                onTimeChange={updateEndTime}
              />
            </View>
            <SlotTitle title={displayTitle} />
            <View style={styles.placeholdersContainer}>
              <SlotTaskPlaceholder text={t.addTask} />
              <SlotMessagePlaceholder text={t.addMessage ?? ''} />
            </View>
          </View>
        </View>
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
    marginBottom: 16,
  },
  placeholdersContainer: {
    marginTop: 16,
  },
});

export default SlotFormScreen;
