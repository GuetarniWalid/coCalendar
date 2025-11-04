import { FC, memo, useCallback } from 'react';
import {
  SlotItem as SlotItemType,
  useSlotFormStore,
  useAuthStore,
} from '@project/shared';
import { DraggableSlotWrapper } from './draggable-wrapper';
import { SlotPositioner } from './SlotPositioner';
import { Slot } from './Slot';
import { useNavigation } from '@react-navigation/native';
import { SwipeActionButton } from './SwipeActionButton';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';
import { updateSlotCompletion } from '../../data/update-slot';

interface SlotItemProps {
  slot: SlotItemType;
  date: string;
  slotListPanRef: any;
  updateSlotCache: (
    slotId: string,
    sourceDate: string,
    targetDate: string,
    updatedSlot: SlotItemType
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

  const handleDeleteAction = useCallback(() => {
    // TODO: Implement delete action
    console.log('delete action');
  }, []);

  const handleSuccessAction = useCallback(async () => {
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
            variant="success"
            slotDate={date}
            onAction={handleSuccessAction}
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
