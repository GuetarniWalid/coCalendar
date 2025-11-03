import { FC, memo, useCallback } from 'react';
import { SlotItem as SlotItemType, useSlotFormStore } from '@project/shared';
import { DraggableSlotWrapper } from './draggable-wrapper';
import { SlotPositioner } from './SlotPositioner';
import { Slot } from './Slot';
import { useNavigation } from '@react-navigation/native';
import { SwipeActionButton } from './SwipeActionButton';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';

interface SlotItemProps {
  slot: SlotItemType;
  date: string;
  slotListPanRef: any;
}

const SlotItemBase: FC<SlotItemProps> = ({ slot, date, slotListPanRef }) => {
  const [, setSelectedSlot] = useSlotFormStore.selectedSlot();
  const navigation = useNavigation<any>();
  const { draggedSlot, hasDayChangedDuringDrag } = useDraggedSlotContext();

  const handleSlotPress = useCallback(() => {
    setSelectedSlot(slot);
    navigation.navigate('SlotForm');
  }, [slot, setSelectedSlot, navigation]);

  const handleDeleteAction = useCallback(() => {
    // TODO: Implement delete action
    console.log('delete action');
  }, []);

  const handleSuccessAction = useCallback(() => {
    // TODO: Implement success action
    console.log('success action');
  }, []);

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
    prev.completed === next.completed &&
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
