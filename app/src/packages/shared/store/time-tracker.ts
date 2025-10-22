import createStore from 'teaful';
import dayjs from 'dayjs';

// Store specifically for tracking real-time completion of slots for the current day only
interface TimeTrackerState {
  currentTime: string; // ISO string of current time
  currentDate: string; // Current date being tracked (YYYY-MM-DD format)
  completedSlotIds: Set<string>; // Set of slot IDs that have been marked as completed
}

const initialState: TimeTrackerState = {
  currentTime: new Date().toISOString(),
  currentDate: dayjs().format('YYYY-MM-DD'),
  completedSlotIds: new Set(),
};

// Create the store with a listener for real-time updates
const {
  useStore: useTimeTrackerStore,
  setStore: setTimeTrackerStore,
  getStore: getTimeTrackerStore,
} = createStore(initialState, onAfterUpdate);

let timeUpdateInterval: NodeJS.Timeout | null = null;

// Listener that runs after any store update
function onAfterUpdate({
  store,
  prevStore,
}: {
  store: TimeTrackerState;
  prevStore: TimeTrackerState;
}) {
  // If the date changed, reset completed slots and restart tracking
  if (store.currentDate !== prevStore.currentDate) {
    const [, setCompletedSlotIds] = getTimeTrackerStore.completedSlotIds();
    setCompletedSlotIds(new Set());
  }
}

// Start real-time tracking for the current day
export function startTimeTracking() {
  // Clear any existing interval
  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval);
  }

  // Update current time every second (only when tracking is active)
  timeUpdateInterval = setInterval(() => {
    const now = new Date();
    const currentDate = dayjs().format('YYYY-MM-DD');

    setTimeTrackerStore.currentTime(now.toISOString());

    // If the date changed, update it
    const [currentStoredDate] = getTimeTrackerStore.currentDate();
    if (currentDate !== currentStoredDate) {
      setTimeTrackerStore.currentDate(currentDate);
    }
  }, 1000);
}

// Stop real-time tracking (when not on day view screen)
export function stopTimeTracking() {
  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval);
    timeUpdateInterval = null;
  }
}

// Check if a slot should be marked as completed based on current time
export function isSlotCompleted(
  slotEndTime: string,
  slotCompleted?: boolean
): boolean {
  if (slotCompleted) return true;

  const [currentTime] = getTimeTrackerStore.currentTime();
  const endTime = new Date(slotEndTime);
  const now = new Date(currentTime);

  return now > endTime;
}

// Mark a slot as manually completed
export function markSlotCompleted(slotId: string) {
  const [completedSlotIds, setCompletedSlotIds] =
    getTimeTrackerStore.completedSlotIds();
  const newSet = new Set(completedSlotIds);
  newSet.add(slotId);
  setCompletedSlotIds(newSet);
}

// Export the store and essential functions
export { useTimeTrackerStore, setTimeTrackerStore };
