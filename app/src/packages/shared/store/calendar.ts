import createStore from 'teaful';
import dayjs from 'dayjs';

interface CalendarState {
  selectedDate: string; // YYYY-MM-DD
}

const initialCalendarState: CalendarState = {
  selectedDate: dayjs().format('YYYY-MM-DD'),
};

export const { useStore: useCalendarStore, getStore: getCalendarStore } = createStore(initialCalendarState);

// Helper to update calendar state via Teaful without React effects
export const setCalendarSelectedDate = (date: string) => {
  const store = getCalendarStore();
  if (!date || store[0].selectedDate === date) return;
  // Update only when different to avoid render loops
  store[0].selectedDate = date;
};


