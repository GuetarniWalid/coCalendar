import { FC } from 'react';
import { View, StyleSheet } from 'react-native';
import { Note } from '@project/icons';
import { colors } from '@project/shared';

interface NoteIndicatorProps {
  description: string | undefined;
}

export const NoteIndicator: FC<NoteIndicatorProps> = ({ description }) => {
  // Don't render if no description
  if (!description || description.trim() === '') {
    return null;
  }

  return (
    <View style={styles.container}>
      <Note size={23} color={colors.typography.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
});
