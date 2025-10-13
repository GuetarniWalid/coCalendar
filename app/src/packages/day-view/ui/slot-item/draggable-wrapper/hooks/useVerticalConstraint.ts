import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';
import { applyVerticalConstraint } from '../shared/utils';
import { VERTICAL_CONSTRAINT_DISTANCE } from '../shared/constants';

/**
 * Hook to manage vertical constraint for dragged slots
 * 
 * When enabled, the slot can only move a limited distance up/down from its starting position
 * When disabled, the slot is free to move anywhere vertically
 */
export const useVerticalConstraint = () => {
  const { 
    verticalConstraintEnabled,
    draggedSlotInitialOffsetY,
  } = useDraggedSlotContext();

  /**
   * Apply vertical constraint to a translation value
   * @param translation - Current Y translation from gesture
   * @returns Constrained translation value
   */
  const constrainVerticalOffset = (translation: number): number => {
    'worklet';
    
    return applyVerticalConstraint(
      translation,
      draggedSlotInitialOffsetY.value,
      VERTICAL_CONSTRAINT_DISTANCE,
      verticalConstraintEnabled.value
    );
  };

  return {
    verticalConstraintEnabled,
    draggedSlotInitialOffsetY,
    constrainVerticalOffset,
  };
};

