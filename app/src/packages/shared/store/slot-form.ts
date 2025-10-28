import createStore from 'teaful';
import type { SlotItem } from '../types/calendar';

interface SlotFormState {
  selectedSlot: SlotItem | null;
}

const initialSlotFormState: SlotFormState = {
  selectedSlot: null,
};

export const { useStore: useSlotFormStore, getStore: getSlotFormStore } =
  createStore(initialSlotFormState);
