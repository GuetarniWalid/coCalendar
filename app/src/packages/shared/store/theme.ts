import createStore from 'teaful';
import { ThemeMode, getColors } from '../theme/colors';

// Initial theme state
const initialThemeState = {
  mode: 'light' as ThemeMode,
  colors: getColors('light'),
};

// Create the theme store using correct Teaful pattern
export const { useStore: useThemeStore, getStore: getThemeStore } =
  createStore(initialThemeState);

// Theme actions
export const setThemeMode = (mode: ThemeMode) => {
  const store = getThemeStore();
  store[0].mode = mode;
  store[0].colors = getColors(mode);
};

export const toggleThemeMode = () => {
  const store = getThemeStore();
  const newMode: ThemeMode = store[0].mode === 'light' ? 'dark' : 'light';
  store[0].mode = newMode;
  store[0].colors = getColors(newMode);
};
