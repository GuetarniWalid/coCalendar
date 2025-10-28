import createStore from 'teaful';
import dayjs from 'dayjs';

interface CalendarState {
  selectedDate: string; // YYYY-MM-DD
  previousSelectedDate: string | null; // YYYY-MM-DD
  changeAskedBy: 'slotList' | 'dateSelector' | null;
}

const initialCalendarState: CalendarState = {
  selectedDate: dayjs().format('YYYY-MM-DD'),
  previousSelectedDate: null,
  changeAskedBy: null,
};

function onAfterUpdate({ store, prevStore }: { store: CalendarState; prevStore: CalendarState }) {
  if (store.selectedDate !== prevStore.selectedDate) {
    const [, setPreviousSelectedDate] = getCalendarStore.previousSelectedDate();
    setPreviousSelectedDate(prevStore.selectedDate);
  }
}

export const {
  useStore: useCalendarStore,
  setStore: setCalendarStore,
  getStore: getCalendarStore,
} = createStore(initialCalendarState, onAfterUpdate);
