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
