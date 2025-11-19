
import { StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useSlotFormStore, getAvatarPublicUrl } from '@project/shared';

export const SLOT_IMAGE_SIZE = 140;

const DEFAULT_IMAGE = {
  persona: 'adult-female' as const,
  activity: 'job_study',
  name: 'working_desktop',
  extension: 'webp' as const,
};

export const SlotImage = () => {
  const [selectedSlot] = useSlotFormStore.selectedSlot();
  const imageUri = getAvatarPublicUrl(selectedSlot?.image || DEFAULT_IMAGE);

  return (
    <Image
      source={imageUri}
      style={styles.image}
      contentFit="contain"
      cachePolicy="memory-disk"
      transition={0}
      pointerEvents="none"
      priority="normal"
      allowDownscaling={false}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    width: SLOT_IMAGE_SIZE,
    height: SLOT_IMAGE_SIZE,
  },
});
