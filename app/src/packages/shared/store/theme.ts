import createStore from 'teaful';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setThemePreference } from '@vonovak/react-native-theme-control';
import { ThemeMode, ThemePreference, getColors } from '../theme/colors';

const THEME_STORAGE_KEY = '@theme_preference';

// Get system theme
const getSystemTheme = (): ThemeMode => {
  const colorScheme = Appearance.getColorScheme();
  return colorScheme === 'dark' ? 'dark' : 'light';
};

// Initial theme state
const initialThemeState = {
  preference: 'auto' as ThemePreference,
  mode: getSystemTheme(),
  colors: getColors(getSystemTheme()),
};

// Create the theme store using correct Teaful pattern
export const { useStore: useThemeStore, getStore: getThemeStore } =
  createStore(initialThemeState);

// Initialize theme on app startup
export const initializeTheme = async () => {
  try {
    const savedPreference = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    const preference = (savedPreference as ThemePreference) || 'auto';

    const store = getThemeStore();
    store[0].preference = preference;

    // Apply the preference to native layer
    if (preference === 'auto') {
      setThemePreference('system');
      const systemMode = getSystemTheme();
      store[0].mode = systemMode;
      store[0].colors = getColors(systemMode);
    } else {
      setThemePreference(preference);
      store[0].mode = preference;
      store[0].colors = getColors(preference);
    }
  } catch (error) {
    console.error('Failed to load theme preference:', error);
  }
};

// Set theme preference and persist it
export const setTheme = async (preference: ThemePreference) => {
  try {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, preference);

    const store = getThemeStore();
    store[0].preference = preference;

    // Apply to native layer
    if (preference === 'auto') {
      setThemePreference('system');
      const systemMode = getSystemTheme();
      store[0].mode = systemMode;
      store[0].colors = getColors(systemMode);
    } else {
      setThemePreference(preference);
      store[0].mode = preference;
      store[0].colors = getColors(preference);
    }
  } catch (error) {
    console.error('Failed to save theme preference:', error);
  }
};

// Handle system theme changes (for auto mode)
export const handleSystemThemeChange = (colorScheme: 'light' | 'dark' | null) => {
  const store = getThemeStore();

  // Only update if in auto mode
  if (store[0].preference === 'auto') {
    const newMode = colorScheme === 'dark' ? 'dark' : 'light';
    store[0].mode = newMode;
    store[0].colors = getColors(newMode);
  }
};

// Legacy functions for backward compatibility
export const setThemeMode = (mode: ThemeMode) => {
  setTheme(mode);
};

export const toggleThemeMode = () => {
  const store = getThemeStore();
  const newMode: ThemeMode = store[0].mode === 'light' ? 'dark' : 'light';
  setTheme(newMode);
};
