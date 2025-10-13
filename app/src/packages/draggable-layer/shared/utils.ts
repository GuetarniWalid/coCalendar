/**
 * Convert hex color to RGB values
 */
export const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

/**
 * Convert hex color to rgba string with opacity
 */
export const hexToRgba = (hex: string, alpha: number) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Apply vertical constraint to a translation value
 * @param translation - Current translation value
 * @param initialOffset - Initial offset when drag started
 * @param maxDistance - Maximum distance allowed from initial position
 * @param enabled - Whether constraint is enabled
 * @returns Constrained translation value
 */
export const applyVerticalConstraint = (
  translation: number,
  initialOffset: number,
  maxDistance: number,
  enabled: boolean
): number => {
  'worklet';
  
  if (!enabled) {
    return translation;
  }

  const minOffset = initialOffset - maxDistance;
  const maxOffset = initialOffset + maxDistance;

  if (translation < minOffset) {
    return minOffset;
  }
  if (translation > maxOffset) {
    return maxOffset;
  }

  return translation;
};

