// Theme system types
export type ThemeMode = 'light' | 'dark';

export interface ColorPalette {
  // Primary brand colors
  primary: string;
  
  // Background colors
  background: {
    mobileNav: string;
    primary: string;
    secondary: string;
    tertiary: string;
    // Optional slot color variants map (e.g., for slot backgrounds)
    slot?: Record<string, string>;
  };
  
  // Typography colors
  typography: {
    mobileNav: string;
    primary: string;
    secondary: string;
  };
  
  // Semantic colors
  success: string;
  warning: string;
  error: string;
  
  // Action colors
  action: {
    background: {
      primary: string;
    };
    typography: {
      primary: string;
    };
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
