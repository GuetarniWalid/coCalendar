// Simple Teaful stores - each concern in its own file
export {
  useAuthStore,
  signIn,
  signUp,
  signOut,
  registerAuthSetters,
  initializeAuthClient,
} from './auth';
export {
  useThemeStore,
  setThemeMode,
  toggleThemeMode,
  initializeTheme,
  setTheme,
  handleSystemThemeChange,
} from './theme';
export { useSlotFormStore } from './slot-form';
export { useCalendarStore } from './calendar';
export {
  useNavigationStore,
  setNavigationStore,
  handleFirstButtonPress,
  setCurrentScreen,
} from './navigation';
export type { ViewType, ScreenType } from './navigation';
export {
  useSlotsCache,
  updateSlotCache,
  invalidateCache,
  setCachedSlots,
  getCachedSlots,
  markDateAsFetched,
  isDateFetched,
  setLoading,
  getLoading,
  ensureSlotsLoaded,
  prefetchSlidingWindow,
} from './slots-store';
