import { useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Text,
  useThemeStore,
  setTheme,
  ThemePreference,
  fontSize,
  spacing,
  setCurrentScreen,
} from '@project/shared';

const ThemeOption = ({
  label,
  value,
  isSelected,
  onPress,
  colors,
}: {
  label: string;
  value: ThemePreference;
  isSelected: boolean;
  onPress: (value: ThemePreference) => void;
  colors: any;
}) => {
  return (
    <Pressable
      onPress={() => onPress(value)}
      style={[
        styles.themeOption,
        {
          backgroundColor: isSelected
            ? colors.primary
            : colors.background.secondary,
          borderColor: isSelected ? colors.primary : colors.background.tertiary,
        },
      ]}
    >
      <Text
        style={[
          styles.themeOptionText,
          {
            color: isSelected
              ? colors.background.primary
              : colors.typography.primary,
          },
        ]}
        fontWeight={isSelected ? 'bold' : 'normal'}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const ProfileScreen = () => {
  const [{ preference, colors }] = useThemeStore();

  useFocusEffect(
    useCallback(() => {
      setCurrentScreen('Profile');
    }, [])
  );

  const handleThemeChange = (newTheme: ThemePreference) => {
    setTheme(newTheme);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <Text
        style={[styles.title, { color: colors.typography.primary }]}
        fontWeight="bold"
      >
        Profile
      </Text>
      <Text style={[styles.subtitle, { color: colors.typography.secondary }]}>
        Your profile information
      </Text>

      <View style={styles.section}>
        <Text
          style={[styles.sectionTitle, { color: colors.typography.primary }]}
          fontWeight="semibold"
        >
          Theme
        </Text>
        <View style={styles.themeOptions}>
          <ThemeOption
            label="Auto"
            value="auto"
            isSelected={preference === 'auto'}
            onPress={handleThemeChange}
            colors={colors}
          />
          <ThemeOption
            label="Light"
            value="light"
            isSelected={preference === 'light'}
            onPress={handleThemeChange}
            colors={colors}
          />
          <ThemeOption
            label="Dark"
            value="dark"
            isSelected={preference === 'dark'}
            onPress={handleThemeChange}
            colors={colors}
          />
        </View>
      </View>
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
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: fontSize.base,
    marginBottom: spacing.xl,
  },
  section: {
    width: '100%',
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    marginBottom: spacing.md,
  },
  themeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: spacing.md,
  },
  themeOption: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  themeOptionText: {
    fontSize: fontSize.base,
  },
});

export default ProfileScreen;
