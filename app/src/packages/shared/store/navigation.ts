import createStore from 'teaful';

export type ViewType = 'Day' | 'Calendar';
export type ScreenType = 'Day' | 'Calendar' | 'Profile' | 'SlotForm' | 'Statistics' | 'Tasks' | 'Auth';

const initialState = {
  currentScreen: 'Day' as ScreenType,
  lastDayCalendarView: 'Day' as ViewType,
};

export const { useStore: useNavigationStore, getStore: getNavigationStore, setStore: setNavigationStore } = createStore(initialState);

export const handleFirstButtonPress = (): ScreenType => {
  const [currentScreen] = getNavigationStore.currentScreen();
  const [lastDayCalendarView] = getNavigationStore.lastDayCalendarView();
  
  // If we're on Day or Calendar, toggle between them
  if (currentScreen === 'Day' || currentScreen === 'Calendar') {
    const newView = currentScreen === 'Day' ? 'Calendar' : 'Day';
    setNavigationStore.currentScreen(newView);
    setNavigationStore.lastDayCalendarView(newView);
    return newView;
  }
  
  // If we're on any other screen, return to last Day/Calendar view
  setNavigationStore.currentScreen(lastDayCalendarView);
  return lastDayCalendarView;
};

export const setCurrentScreen = (screen: ScreenType) => {
  setNavigationStore.currentScreen(screen);
  
  // If it's Day or Calendar, also update the last Day/Calendar view
  if (screen === 'Day' || screen === 'Calendar') {
    setNavigationStore.lastDayCalendarView(screen);
  }
};
