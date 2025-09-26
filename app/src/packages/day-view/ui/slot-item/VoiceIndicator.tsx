import { FC } from 'react';
import { View, StyleSheet } from 'react-native';
import { Vocal } from '@project/icons';
import { colors } from '@project/shared';

interface VoiceIndicatorProps {
  voice_path: string | undefined;
}

export const VoiceIndicator: FC<VoiceIndicatorProps> = ({ voice_path }) => {
  // Don't render if no voice recording
  if (!voice_path) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Vocal size={25} color={colors.typography.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 0,
    paddingTop: 4,
  },
});
