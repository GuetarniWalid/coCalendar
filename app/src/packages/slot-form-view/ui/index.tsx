import { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, fontSize, spacing, setCurrentScreen, useSlotFormStore, getSlotBackgroundColor } from '@project/shared';

const SlotFormScreen = () => {
  const [selectedSlot] = useSlotFormStore.selectedSlot();
  const backgroundColor = getSlotBackgroundColor(selectedSlot?.color);

  // Track when this screen becomes active
  useFocusEffect(
    useCallback(() => {
      setCurrentScreen('SlotForm');
    }, [])
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={styles.title}>Slot Form</Text>
      <Text style={styles.subtitle}>Create or edit your slots</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    color: colors.typography.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.typography.secondary,
  },
});

export default SlotFormScreen;
