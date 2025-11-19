import createStore from 'teaful';
import type { SlotItem } from '../types/calendar';

interface SlotsCacheState {
  cache: Record<string, SlotItem[]>;
  fetchedDates: Set<string>;
}

const initialSlotsCacheState: SlotsCacheState = {
  cache: {},
  fetchedDates: new Set<string>(),
};

export const { useStore: useSlotsCache, getStore: getSlotsCacheStore } =
  createStore(initialSlotsCacheState);

export const updateSlotCache = (
  slotId: string,
  sourceDate: string,
  targetDate: string,
  updatedSlot: SlotItem | null
) => {
  const [currentCache, setCache] = getSlotsCacheStore.cache();

  // Remove from source date
  if (currentCache[sourceDate]) {
    currentCache[sourceDate] = currentCache[sourceDate].filter(
      (s: SlotItem) => s.id !== slotId
    );
  }

  // Add to target date
  if (updatedSlot && currentCache[targetDate]) {
    const existingIndex = currentCache[targetDate].findIndex(
      (s: SlotItem) => s.id === updatedSlot.id
    );
    if (existingIndex >= 0) {
      currentCache[targetDate][existingIndex] = updatedSlot;
    } else {
      currentCache[targetDate].push(updatedSlot);
    }
  }

  setCache({ ...currentCache });
};

export const invalidateCache = (dates: string[]) => {
  const [currentCache, setCache] = getSlotsCacheStore.cache();
  const [currentFetched, setFetchedDates] = getSlotsCacheStore.fetchedDates();

  dates.forEach(date => {
    delete currentCache[date];
    currentFetched.delete(date);
  });

  setCache({ ...currentCache });
  setFetchedDates(new Set(currentFetched));
};

export const setCachedSlots = (date: string, slots: SlotItem[]) => {
  const [currentCache, setCache] = getSlotsCacheStore.cache();
  currentCache[date] = slots;
  setCache({ ...currentCache });
};

export const getCachedSlots = (date: string): SlotItem[] | undefined => {
  const [currentCache] = getSlotsCacheStore.cache();
  return currentCache[date];
};

export const markDateAsFetched = (date: string) => {
  const [currentFetched, setFetchedDates] = getSlotsCacheStore.fetchedDates();
  currentFetched.add(date);
  setFetchedDates(new Set(currentFetched));
};

export const isDateFetched = (date: string): boolean => {
  const [currentFetched] = getSlotsCacheStore.fetchedDates();
  return currentFetched.has(date);
};
