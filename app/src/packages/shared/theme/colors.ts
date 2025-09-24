import { ColorPalette, ThemeMode } from './types';

// Light theme colors
const lightColors: ColorPalette = {
  // Primary brand color
  primary: '#FFE78D',

  // Background colors
  background: {
    primary: '#ffffff',
    secondary: '#F7F7F7',
    tertiary: 'rgba(0, 0, 0, 0.08)',


    slot: {
      aquaLight: { default: '#C8F4DE', contrast: '#2E8B57' },
      beigeCream: { default: '#F5E6CC', contrast: '#D2691E' },
      bluePastel: { default: '#A0C4FF', contrast: '#4169E1' },
      blueSky: { default: '#B5EAEA', contrast: '#008B8B' },
      butterCream: { default: '#FFF3B0', contrast: '#FFD700' },
      coralSoft: { default: '#FBC4AB', contrast: '#FF6347' },
      default: { default: '#E0EEF5', contrast: '#4682B4' },
      graySoft: { default: '#EAEAEA', contrast: '#696969' },
      greenLime: { default: '#C1FBA4', contrast: '#32CD32' },
      lavenderBlue: { default: '#A2B5FB', contrast: '#6A5ACD' },
      lavenderSoft: { default: '#C9C9FF', contrast: '#9370DB' },
      lavenderSweet: { default: '#D0A9F5', contrast: '#8A2BE2' },
      lilacSoft: { default: '#D7BDE2', contrast: '#9932CC' },
      mintSoft: { default: '#B8EAD2', contrast: '#20B2AA' },
      orangeLight: { default: '#FFD6A5', contrast: '#FF8C00' },
      peachSoft: { default: '#FFE5B4', contrast: '#DAA520' },
      pinkBlush: { default: '#F7C6C7', contrast: '#DC143C' },
      pinkCandy: { default: '#FDC5F5', contrast: '#FF1493' },
      roseDust: { default: '#F2E8F0', contrast: '#C71585' },
      turquoiseSoft: { default: '#BDE0FE', contrast: '#1E90FF' },
      violetLight: { default: '#E5C3FF', contrast: '#BA55D3' },
      yellowSoft: { default: '#FFDD94', contrast: '#FFA500' },
    },
  },

  // Typography colors
  typography: {
    primary: '#181818',
    secondary: '#9C9290',
  },

  // Semantic colors
  success: '#41DB81',
  warning: '#fbbf24',
  error: '#f87171',

  // Action colors
  action: {
    background: {
      primary: '#FFE78D',
    },

    typography: {
      primary: '#6E2F1D',
    },
  },

  // Bottom navigation colors
  bottomNavigation: {
    background: '#FFF6D0',
    selector: '#D47F69',
    selectorContrast: '#F2EAC8',
  },

  // Utility colors
  transparent: 'transparent',
  black: '#000000',
  white: '#ffffff',
};

// Dark theme colors
const darkColors: ColorPalette = {
  // Primary brand color
  primary: '#f88e87',

  // Background colors
  background: {
    primary: '#1a1a1a',
    secondary: 'rgba(255, 255, 255, 0.08)',
    tertiary: 'rgba(255, 255, 255, 0.1)',

    slot: lightColors.background.slot,
  },

  // Typography colors
  typography: {
    primary: '#ffffff',
    secondary: '#9f9fa5',
  },

  // Semantic colors
  success: '#41DB81',
  warning: '#fbbf24',
  error: '#f87171',

  // Action colors

  action: {
    background: {
      primary: '#FFE78D',
    },

    typography: {
      primary: '#6E2F1D',
    },
  },

  // Bottom navigation colors
  bottomNavigation: {
    background: '#FFF6D0',
    selector: '#D47F69',
    selectorContrast: '#F2EAC8',
  },

  // Utility colors
  transparent: 'transparent',
  black: '#000000',
  white: '#ffffff',
};

// Theme color getter function
export const getColors = (mode: ThemeMode): ColorPalette => {
  return mode === 'light' ? lightColors : darkColors;
};

// Default colors (for backward compatibility)
export const colors = lightColors;

// Export types
export type { ColorPalette, ThemeMode } from './types';
