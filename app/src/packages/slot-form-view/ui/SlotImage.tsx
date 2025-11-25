import { StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { useSlotFormStore, getAvatarPublicUrl } from '@project/shared';

export const SLOT_IMAGE_SIZE = 140;

const DEFAULT_IMAGE = {
  persona: 'adult-female' as const,
  activity: 'job_study',
  name: 'working_desktop',
  extension: 'webp' as const,
};

export const SlotImage = () => {
  const navigation = useNavigation();
  const [selectedSlot] = useSlotFormStore.selectedSlot();
  const imageUri = getAvatarPublicUrl(selectedSlot?.image || DEFAULT_IMAGE);

  const handlePress = () => {
    navigation.navigate('AvatarPicker' as never);
  };

  return (
    <Pressable onPress={handlePress}>
      <Image
        source={imageUri}
        style={styles.image}
        contentFit="contain"
        cachePolicy="memory-disk"
        transition={0}
        priority="normal"
        allowDownscaling={false}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  image: {
    width: SLOT_IMAGE_SIZE,
    height: SLOT_IMAGE_SIZE,
  },
});
