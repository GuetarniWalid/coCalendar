import { FC } from 'react';
import { StyleSheet } from 'react-native';
import { Image } from 'expo-image';

interface SlotImageProps {
  imageUri: string;
}

export const SlotImage: FC<SlotImageProps> = ({ imageUri }) => {
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
    width: 140,
    height: 140,
  },
});
