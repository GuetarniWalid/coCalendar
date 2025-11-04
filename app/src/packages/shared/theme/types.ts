// Theme system types
export type ThemeMode = 'light' | 'dark';

export interface ColorPalette {
  // Primary brand colors
  primary: string;

  // Background colors
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    // Slot color variants with default and contrast colors
    slot: Record<
      string,
      { default: string; contrast: string; participants: string[] }
    >;
  };

  // Typography colors
  typography: {
    primary: string;
    secondary: string;
  };

  // Semantic colors
  success: string;
  warning: string;
  error: string;
  neutral: string;

  // Action colors
  action: {
    background: {
      primary: string;
    };
    typography: {
      primary: string;
    };
  };

  // Bottom navigation colors
  bottomNavigation: {
    background: string;
    selector: string;
    selectorContrast: string;
  };

  // Utility colors
  transparent: string;
  black: string;
  white: string;
}

export interface Theme {
  mode: ThemeMode;
  colors: ColorPalette;
}
