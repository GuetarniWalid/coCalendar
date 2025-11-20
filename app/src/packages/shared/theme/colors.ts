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
      aquaLight: {
        default: '#C8F4DE',
        contrast: '#267147',
        participants: ['#FFDD94', '#C1FBA4', '#A2B5FB'],
      },
      beigeCream: {
        default: '#F5E6CC',
        contrast: '#D2691E',
        participants: ['#FFDD94', '#C1FBA4', '#A2B5FB'],
      },
      bluePastel: {
        default: '#A0C4FF',
        contrast: '#2E417A',
        participants: ['#FFDD94', '#C1FBA4', '#BDE0FE'],
      },
      blueSky: {
        default: '#B5EAEA',
        contrast: '#0E5D5D',
        participants: ['#FFDD94', '#C1FBA4', '#A2B5FB'],
      },
      butterCream: {
        default: '#FFF3B0',
        contrast: '#7D6B0F',
        participants: ['#FFDD94', '#C1FBA4', '#A2B5FB'],
      },
      coralSoft: {
        default: '#FBC4AB',
        contrast: '#824F46',
        participants: ['#FFDD94', '#C1FBA4', '#A2B5FB'],
      },
      default: {
        default: '#E0EEF5',
        contrast: '#414F58',
        participants: ['#FFDD94', '#C1FBA4', '#A2B5FB'],
      },
      graySoft: {
        default: '#EAEAEA',
        contrast: '#535151',
        participants: ['#FFDD94', '#C1FBA4', '#A2B5FB'],
      },
      greenLime: {
        default: '#C1FBA4',
        contrast: '#396439',
        participants: ['#FFDD94', '#C1FBA4', '#A2B5FB'],
      },
      lavenderBlue: {
        default: '#A2B5FB',
        contrast: '#3A3650',
        participants: ['#FFDD94', '#C1FBA4', '#BDE0FE'],
      },
      lavenderSoft: {
        default: '#C9C9FF',
        contrast: '#351A6D',
        participants: ['#FFDD94', '#C1FBA4', '#A2B5FB'],
      },
      lavenderSweet: {
        default: '#D0A9F5',
        contrast: '#3D3347',
        participants: ['#FFDD94', '#C1FBA4', '#A2B5FB'],
      },
      lilacSoft: {
        default: '#D7BDE2',
        contrast: '#2E0344',
        participants: ['#FFDD94', '#C1FBA4', '#A2B5FB'],
      },
      mintSoft: {
        default: '#B8EAD2',
        contrast: '#0A5450',
        participants: ['#FFDD94', '#C1FBA4', '#A2B5FB'],
      },
      orangeLight: {
        default: '#FFD6A5',
        contrast: '#512F06',
        participants: ['#FFF3B0', '#C1FBA4', '#A2B5FB'],
      },
      peachSoft: {
        default: '#FFE5B4',
        contrast: '#70591F',
        participants: ['#FBC4AB', '#C1FBA4', '#A2B5FB'],
      },
      pinkBlush: {
        default: '#F7C6C7',
        contrast: '#880F29',
        participants: ['#FFDD94', '#C1FBA4', '#A2B5FB'],
      },
      pinkCandy: {
        default: '#FDC5F5',
        contrast: '#61133D',
        participants: ['#FFDD94', '#C1FBA4', '#A2B5FB'],
      },
      roseDust: {
        default: '#F2E8F0',
        contrast: '#64214B',
        participants: ['#FFDD94', '#C1FBA4', '#A2B5FB'],
      },
      turquoiseSoft: {
        default: '#BDE0FE',
        contrast: '#0E2F4F',
        participants: ['#FFDD94', '#C1FBA4', '#A2B5FB'],
      },
      violetLight: {
        default: '#E5C3FF',
        contrast: '#612F6E',
        participants: ['#FFDD94', '#C1FBA4', '#A2B5FB'],
      },
      yellowSoft: {
        default: '#FFDD94',
        contrast: '#FBC4AB',
        participants: ['#FFDD94', '#C1FBA4', '#A2B5FB'],
      },
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
  error: '#F65757',
  neutral: '#9CA3AF',

  // Action colors
  action: {
    background: {
      primary: '#F9EFC6',
    },

    typography: {
      primary: '#904633',
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
  error: '#F65757',
  neutral: '#9CA3AF',
  // Action colors

  action: {
    background: {
      primary: '#F9EFC6',
    },

    typography: {
      primary: '#904633',
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
export type { ColorPalette, ThemeMode, ThemePreference } from './types';
