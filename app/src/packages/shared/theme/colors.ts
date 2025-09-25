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
      aquaLight: { default: '#C8F4DE', contrast: '#267147' },
      beigeCream: { default: '#F5E6CC', contrast: '#D2691E' },
      bluePastel: { default: '#A0C4FF', contrast: '#2E417A' },
      blueSky: { default: '#B5EAEA', contrast: '#0E5D5D' },
      butterCream: { default: '#FFF3B0', contrast: '#7D6B0F' },
      coralSoft: { default: '#FBC4AB', contrast: '#824F46' },
      default: { default: '#E0EEF5', contrast: '#414F58' },
      graySoft: { default: '#EAEAEA', contrast: '#535151' },
      greenLime: { default: '#C1FBA4', contrast: '#396439' },
      lavenderBlue: { default: '#A2B5FB', contrast: '#3A3650' },
      lavenderSoft: { default: '#C9C9FF', contrast: '#351A6D' },
      lavenderSweet: { default: '#D0A9F5', contrast: '#3D3347' },
      lilacSoft: { default: '#D7BDE2', contrast: '#2E0344' },
      mintSoft: { default: '#B8EAD2', contrast: '#0A5450' },
      orangeLight: { default: '#FFD6A5', contrast: '#512F06' },
      peachSoft: { default: '#FFE5B4', contrast: '#70591F' },
      pinkBlush: { default: '#F7C6C7', contrast: '#880F29' },
      pinkCandy: { default: '#FDC5F5', contrast: '#61133D' },
      roseDust: { default: '#F2E8F0', contrast: '#64214B' },
      turquoiseSoft: { default: '#BDE0FE', contrast: '#0E2F4F' },
      violetLight: { default: '#E5C3FF', contrast: '#612F6E' },
      yellowSoft: { default: '#FFDD94', contrast: '#684810' },
    },
  },

  // Typography colors
  typography: {
    primary: '#181818',
    secondary: '#9C9290',
  },

  // Semantic colors
  success: '#76C496',
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
  success: '#76C496',
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
