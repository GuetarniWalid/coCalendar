import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { spacing } from './spacing';
import { fontSize, fontWeight } from './typography';
import { borderRadius } from './borderRadius';

// Re-export all tokens for convenience
export { colors, spacing, fontSize, fontWeight, borderRadius };

// Only truly common/shared styles that are used across multiple components
export const commonStyles = StyleSheet.create({
  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    color: colors.typography.secondary,
    marginTop: spacing.md,
    fontSize: fontSize.base,
  },
  
  // Scroll
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    padding: spacing.xl,
  },
  
  // Empty states
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  
  empty: {
    textAlign: 'center',
    color: colors.typography.secondary,
    fontSize: fontSize.base,
    marginBottom: spacing.md,
  },
  
  emptySubtext: {
    textAlign: 'center',
    color: colors.typography.secondary,
    fontSize: fontSize.sm,
  },
});

// Type exports for TypeScript
export type ColorToken = keyof typeof colors;
export type SpacingToken = keyof typeof spacing;
export type BorderRadiusToken = keyof typeof borderRadius;
export type FontSizeToken = keyof typeof fontSize;
export type FontWeightToken = keyof typeof fontWeight;
