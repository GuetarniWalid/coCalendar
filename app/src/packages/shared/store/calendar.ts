import createStore from 'teaful';
import dayjs from 'dayjs';

interface CalendarState {
  selectedDate: string; // YYYY-MM-DD
}

const initialCalendarState: CalendarState = {
  selectedDate: dayjs().format('YYYY-MM-DD'),
};

export const {
  useStore: useCalendarStore,
  setStore: setCalendarStore,
  getStore: getCalendarStore,
} = createStore(initialCalendarState);
