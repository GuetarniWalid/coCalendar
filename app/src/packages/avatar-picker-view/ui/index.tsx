import { useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { setCurrentScreen, useThemeStore } from '@project/shared';

const AvatarPickerScreen = () => {
  const navigation = useNavigation();
  const [{ colors }] = useThemeStore();
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      setCurrentScreen('AvatarPicker');
    }, [])
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.typography.primary} />
        </Pressable>
      </View>
      <View style={styles.content}>
        {/* Avatar picker content will go here */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

export default AvatarPickerScreen;
