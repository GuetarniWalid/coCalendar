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
      aquaLight: '#C8F4DE',
      beigeCream: '#F5E6CC',
      bluePastel: '#A0C4FF',
      blueSky: '#B5EAEA',
      butterCream: '#FFF3B0',
      coralSoft: '#FBC4AB',
      default: '#E0EEF5',
      graySoft: '#EAEAEA',
      greenLime: '#C1FBA4',
      lavenderBlue: '#A2B5FB',
      lavenderSoft: '#C9C9FF',
      lavenderSweet: '#D0A9F5',
      lilacSoft: '#D7BDE2',
      mintSoft: '#B8EAD2',
      orangeLight: '#FFD6A5',
      peachSoft: '#FFE5B4',
      pinkBlush: '#F7C6C7',
      pinkCandy: '#FDC5F5',
      roseDust: '#F2E8F0',
      turquoiseSoft: '#BDE0FE',
      violetLight: '#E5C3FF',
      yellowSoft: '#FFDD94',
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

    slot: lightColors.background.slot!,
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
