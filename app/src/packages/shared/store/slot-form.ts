import createStore from 'teaful';

interface SelectedSlotData {
  id: string | null;
  title?: string;
  startTime?: string; // ISO string
  endTime?: string;   // ISO string
  visibility?: 'private' | 'public';
  clientName?: string;
  description?: string;
  color?: string;
}

interface SlotFormState {
  selectedDate: string | null;
  selectedSlot: SelectedSlotData | null;
}

const initialSlotFormState: SlotFormState = {
  selectedDate: null,
  selectedSlot: null,
};

export const { useStore: useSlotFormStore, getStore: getSlotFormStore } = createStore(initialSlotFormState);
