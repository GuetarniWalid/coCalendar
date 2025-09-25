import { colors } from '../theme';

// Type for slot color names
export type SlotColorName = keyof typeof colors.background.slot;

/**
 * Get the default background color for a slot color name
 * @param colorName - The human-readable color name (e.g., 'aquaLight', 'beigeCream')
 * @returns The hex color value for the background
 */
export const getSlotBackgroundColor = (colorName?: SlotColorName | undefined): string => {
  if (!colorName) {
    return colors.background.slot.default!.default;
  }

  const slotColor = colors.background.slot[colorName];
  return slotColor?.default || colors.background.slot.default!.default;
};

/**
 * Get the contrast color for a slot color name
 * @param colorName - The human-readable color name (e.g., 'aquaLight', 'beigeCream')
 * @returns The hex color value for the contrast/text color
 */
export const getSlotContrastColor = (colorName?: SlotColorName | undefined): string => {
  if (!colorName) {
    return colors.background.slot.default!.contrast;
  }

  const slotColor = colors.background.slot[colorName];
  return slotColor?.contrast || colors.background.slot.default!.contrast;
};

/**
 * Check if a color name is valid
 * @param colorName - The color name to validate
 * @returns True if the color name exists in our slot colors
 */
export const isValidSlotColorName = (colorName?: SlotColorName | undefined): boolean => {
  if (!colorName) return false;
  return colorName in colors.background.slot;
};

/**
 * Get all available slot color names
 * @returns Array of all available slot color names
 */
export const getAvailableSlotColorNames = (): SlotColorName[] => {
  return Object.keys(colors.background.slot) as SlotColorName[];
};
