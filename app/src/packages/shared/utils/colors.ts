import { colors } from '../theme';

// Type for slot color names
export type SlotColorName = keyof typeof colors.background.slot;

/**
 * Get the default background color for a slot color name
 * @param colorName - The human-readable color name (e.g., 'aquaLight', 'beigeCream')
 * @returns The hex color value for the background
 */
export const getSlotBackgroundColor = (colorName?: SlotColorName): string => {
  const slotColor = colorName ? colors.background.slot[colorName] : null;
  return slotColor?.default || colors.background.slot.default!.default;
};

/**
 * Get the contrast color for a slot color name
 * @param colorName - The human-readable color name (e.g., 'aquaLight', 'beigeCream')
 * @returns The hex color value for the contrast/text color
 */
export const getSlotContrastColor = (colorName?: SlotColorName): string => {
  const slotColor = colorName ? colors.background.slot[colorName] : null;
  return slotColor?.contrast || colors.background.slot.default!.contrast;
};

/**
 * Check if a color name is valid
 * @param colorName - The color name to validate
 * @returns True if the color name exists in our slot colors
 */
export const isValidSlotColorName = (colorName?: SlotColorName): boolean => {
  return !!colorName && colorName in colors.background.slot;
};

/**
 * Get all available slot color names
 * @returns Array of all available slot color names
 */
export const getAvailableSlotColorNames = (): SlotColorName[] => {
  return Object.keys(colors.background.slot) as SlotColorName[];
};

/**
 * Get participant colors based on slot color and participant count
 * @param slotColorName - The slot's color name
 * @param participantCount - Number of participants
 * @returns Array of colors for participants
 */
export const getSlotParticipantColors = (slotColorName?: SlotColorName, participantCount: number = 1): string[] => {
  if (!slotColorName || !colors.background.slot[slotColorName]?.participants) {
    return [colors.primary]; // Default color
  }

  const participantColors = colors.background.slot[slotColorName].participants;
  
  if (!participantColors || participantColors.length === 0) {
    return [colors.primary]; // Fallback to primary
  }
  
  if (participantCount === 1) {
    // Single participant gets the last color in the array
    return [participantColors[participantColors.length - 1]!];
  } else if (participantCount <= 3) {
    // 2-3 participants: reverse order (last, second-to-last, third-to-last)
    const result: string[] = [];
    for (let i = 0; i < Math.min(participantCount, participantColors.length); i++) {
      const color = participantColors[participantColors.length - 1 - i];
      if (color) result.push(color);
    }
    return result.length > 0 ? result : [colors.primary];
  } else {
    // More than 3: show first 2 + overflow indicator
    const color1 = participantColors[participantColors.length - 1];
    const color2 = participantColors[participantColors.length - 2];
    return [
      color1 || colors.primary, // First participant (last color)
      color2 || colors.primary, // Second participant (second-to-last color)
    ];
  }
};