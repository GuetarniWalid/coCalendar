import { FC, memo, useCallback, useMemo } from 'react';
import {
  SlotItem as SlotItemType,
  useSlotFormStore,
  useAuthStore,
  retryWithBackoff,
} from '@project/shared';
import { DraggableSlotWrapper } from './draggable-wrapper';
import { SlotPositioner } from './SlotPositioner';
import { Slot } from './Slot';
import { useNavigation } from '@react-navigation/native';
import { SwipeActionButton } from './SwipeActionButton';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';
import { updateSlotCompletion, deleteSlot } from '../../data/update-slot';

const isDayPassed = (startTime: string | null): boolean => {
  if (!startTime) return false;
  const slotDate = new Date(startTime);
  const today = new Date();
  slotDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return slotDate < today;
};

const isSlotEffectivelyCompleted = (slot: SlotItemType): boolean => {
  if (slot.completionStatus === 'completed') {
    return true;
  }
  if (slot.completionStatus === 'incomplete') {
    return false;
  }
  if (!slot.endTime) {
    return isDayPassed(slot.startTime);
  }
  const endTimeDate = new Date(slot.endTime);
  const now = new Date();
  return now > endTimeDate;
};

interface SlotItemProps {
  slot: SlotItemType;
  date: string;
  slotListPanRef: any;
  updateSlotCache: (
    slotId: string,
    sourceDate: string,
    targetDate: string,
    updatedSlot: SlotItemType | null
  ) => void;
}

const SlotItemBase: FC<SlotItemProps> = ({
  slot,
  date,
  slotListPanRef,
  updateSlotCache,
}) => {
  const [, setSelectedSlot] = useSlotFormStore.selectedSlot();
  const navigation = useNavigation<any>();
  const { draggedSlot, hasDayChangedDuringDrag } = useDraggedSlotContext();
  const [{ supabase, user }] = useAuthStore();

  const handleSlotPress = useCallback(() => {
    setSelectedSlot(slot);
    navigation.navigate('SlotForm');
  }, [slot, setSelectedSlot, navigation]);

  const handleDeleteAction = useCallback(async () => {
    if (!supabase || !user) return;

    updateSlotCache(slot.id, date, '', null);

    try {
      const success = await retryWithBackoff(
        () => deleteSlot(supabase, user.id, slot.id),
        3,
        1000
      );

      if (!success) {
        console.error('Failed to delete slot in database, rolling back');
        updateSlotCache('', '', date, slot);
      }
    } catch (error) {
      console.error('Error deleting slot:', error);
      updateSlotCache('', '', date, slot);
    }
  }, [supabase, user, slot, date, updateSlotCache]);

  const handleCompleteAction = useCallback(async () => {
    if (!supabase || !user) return;

    const optimisticSlot: SlotItemType = {
      ...slot,
      completionStatus: 'completed',
    };

    updateSlotCache(slot.id, date, date, optimisticSlot);

    const updatedSlot = await updateSlotCompletion(
      supabase,
      user.id,
      slot.id,
      'completed'
    );

    if (!updatedSlot) {
      console.error('Failed to update slot completion in database, rolling back');
      updateSlotCache(slot.id, date, date, slot);
    }
  }, [supabase, user, slot, date, updateSlotCache]);

  const handleIncompleteAction = useCallback(async () => {
    if (!supabase || !user) return;

    const optimisticSlot: SlotItemType = {
      ...slot,
      completionStatus: 'incomplete',
    };

    updateSlotCache(slot.id, date, date, optimisticSlot);

    const updatedSlot = await updateSlotCompletion(
      supabase,
      user.id,
      slot.id,
      'incomplete'
    );

    if (!updatedSlot) {
      console.error(
        'Failed to update slot incompletion in database, rolling back'
      );
      updateSlotCache(slot.id, date, date, slot);
    }
  }, [supabase, user, slot, date, updateSlotCache]);

  const rightButtonVariant = useMemo(() => {
    return isSlotEffectivelyCompleted(slot) ? 'incomplete' : 'complete';
  }, [slot]);

  const rightButtonAction = useMemo(() => {
    return isSlotEffectivelyCompleted(slot)
      ? handleIncompleteAction
      : handleCompleteAction;
  }, [slot, handleIncompleteAction, handleCompleteAction]);

  return (
    <SlotPositioner slot={slot} date={date}>
      {draggedSlot?.id === slot.id && !hasDayChangedDuringDrag && (
        <>
          <SwipeActionButton
            side="left"
            variant="delete"
            slotDate={date}
            onAction={handleDeleteAction}
          />
          <SwipeActionButton
            side="right"
            variant={rightButtonVariant}
            slotDate={date}
            onAction={rightButtonAction}
          />
        </>
      )}
      <DraggableSlotWrapper
        onPress={handleSlotPress}
        slot={slot}
        slotListPanRef={slotListPanRef}
      >
        <Slot slot={slot} />
      </DraggableSlotWrapper>
    </SlotPositioner>
  );
};

export const SlotItem = memo(SlotItemBase, (prevProps, nextProps) => {
  const prev = prevProps.slot;
  const next = nextProps.slot;

  return (
    prev.id === next.id &&
    prev.title === next.title &&
    prev.startTime === next.startTime &&
    prev.endTime === next.endTime &&
    prev.color === next.color &&
    prev.completionStatus === next.completionStatus &&
    prev.description === next.description &&
    prev.voice_path === next.voice_path &&
    prev.image?.name === next.image?.name &&
    prev.tasks?.length === next.tasks?.length &&
    prev.tasks?.filter(t => t.is_done).length ===
      next.tasks?.filter(t => t.is_done).length &&
    prev.participants?.length === next.participants?.length &&
    prevProps.date === nextProps.date
  );
});
