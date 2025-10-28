import { FC, memo, useCallback } from 'react';
import { SlotItem as SlotItemType, useSlotFormStore } from '@project/shared';
import { DraggableSlotWrapper } from './draggable-wrapper';
import { SlotPositioner } from './SlotPositioner';
import { Slot } from './Slot';
import { useNavigation } from '@react-navigation/native';

interface SlotItemProps {
  slot: SlotItemType;
  date: string;
  slotListPanRef: any;
}

const SlotItemBase: FC<SlotItemProps> = ({ slot, date, slotListPanRef }) => {
  const [, setSelectedSlot] = useSlotFormStore.selectedSlot();
  const navigation = useNavigation<any>();

  const handleSlotPress = useCallback(() => {
    setSelectedSlot(slot);
    navigation.navigate('SlotForm');
  }, [setSelectedSlot, navigation]);

  return (
    <SlotPositioner slot={slot} date={date}>
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

  // Compare essential props that affect rendering
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
