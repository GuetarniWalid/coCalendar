import createStore from 'teaful';
import type { SlotItem } from '../types/calendar';
import dayjs from 'dayjs';
import { fetchSlotsForDate, fetchSlotsInRange } from '../data/fetch-slots';

interface SlotsStoreState {
  cache: Record<string, SlotItem[]>;
  fetchedDates: Set<string>;
  loading: boolean;
  prefetchInFlight: {
    start: string;
    end: string;
    promise: Promise<void>;
  } | null;
  lastPrefetchedRange: {
    start: string;
    end: string;
  } | null;
}

const initialSlotsStoreState: SlotsStoreState = {
  cache: {},
  fetchedDates: new Set<string>(),
  loading: false,
  prefetchInFlight: null,
  lastPrefetchedRange: null,
};

export const { useStore: useSlotsCache, getStore: getSlotsCacheStore } =
  createStore(initialSlotsStoreState);

// ============================================================================
// CACHE MANAGEMENT FUNCTIONS
// ============================================================================

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

// ============================================================================
// LOADING STATE MANAGEMENT
// ============================================================================

export const setLoading = (value: boolean) => {
  const [, setLoadingState] = getSlotsCacheStore.loading();
  setLoadingState(value);
};

export const getLoading = (): boolean => {
  const [loading] = getSlotsCacheStore.loading();
  return loading;
};

// ============================================================================
// FETCH LOGIC
// ============================================================================

export const ensureSlotsLoaded = async (
  date: string,
  supabase: any,
  userId: string
): Promise<void> => {
  if (!userId) return;

  // Serve from cache if available
  const cached = getCachedSlots(date);
  if (cached !== undefined) {
    setLoading(false);
    return;
  }

  // If a prefetch is in-flight and this date is within its range, wait for it first
  const [prefetchInFlight] = getSlotsCacheStore.prefetchInFlight();
  if (prefetchInFlight) {
    const { start, end, promise } = prefetchInFlight;
    if (date >= start && date <= end) {
      try {
        await promise;
        const afterPrefetch = getCachedSlots(date);
        if (afterPrefetch !== undefined) {
          setLoading(false);
          return;
        }
        // Covered by prefetch and no entry added => empty day
        setCachedSlots(date, []);
        markDateAsFetched(date);
        setLoading(false);
        return;
      } catch {
        // If prefetch failed, fall through to direct fetch
      }
    }
  }

  // True cache miss: show loader, fetch and cache
  setLoading(true);
  try {
    const formattedSlots = await fetchSlotsForDate(supabase, userId, date);
    setCachedSlots(date, formattedSlots);
    markDateAsFetched(date);
  } catch (error) {
    console.error('Error fetching slots:', error);
  } finally {
    setLoading(false);
  }
};

// Prefetch a sliding window around the selected date to minimize per-day loads
export const prefetchSlidingWindow = async (
  centerDate: string,
  supabase: any,
  userId: string
): Promise<void> => {
  try {
    if (!userId) return;

    const PREFETCH_BEFORE_DAYS = 21; // 3 weeks back
    const PREFETCH_AFTER_DAYS = 21; // 3 weeks forward
    const start = dayjs(centerDate)
      .subtract(PREFETCH_BEFORE_DAYS, 'day')
      .format('YYYY-MM-DD');
    const end = dayjs(centerDate)
      .add(PREFETCH_AFTER_DAYS, 'day')
      .format('YYYY-MM-DD');

    // If an in-flight prefetch already covers this window, let it finish
    const [prefetchInFlight] = getSlotsCacheStore.prefetchInFlight();
    if (prefetchInFlight) {
      const r = prefetchInFlight;
      if (start >= r.start && end <= r.end) {
        return;
      }
    }

    // If the last completed prefetch covers this window, skip
    const [lastPrefetchedRange] = getSlotsCacheStore.lastPrefetchedRange();
    if (lastPrefetchedRange) {
      const r = lastPrefetchedRange;
      if (start >= r.start && end <= r.end) {
        return;
      }
    }

    // Check if we need to fetch anything - skip if all dates already fetched
    let cursor = dayjs(start);
    const last = dayjs(end);
    let hasUnfetchedDates = false;
    while (cursor.isSame(last, 'day') || cursor.isBefore(last, 'day')) {
      const dateId = cursor.format('YYYY-MM-DD');
      if (!isDateFetched(dateId)) {
        hasUnfetchedDates = true;
        break;
      }
      cursor = cursor.add(1, 'day');
    }

    if (!hasUnfetchedDates) {
      const [, setLastPrefetchedRange] =
        getSlotsCacheStore.lastPrefetchedRange();
      setLastPrefetchedRange({ start, end });
      return;
    }

    // Create and store the prefetch promise
    const promise = fetchSlotsInRange(supabase, userId, start, end)
      .then(result => {
        // Merge into cache, but NEVER overwrite existing entries
        Object.keys(result).forEach(dateId => {
          if (getCachedSlots(dateId) === undefined && result[dateId]) {
            setCachedSlots(dateId, result[dateId]);
            markDateAsFetched(dateId);
          }
        });

        // Mark empty days explicitly in cache within the prefetched range
        let cursor = dayjs(start);
        const last = dayjs(end);
        while (cursor.isSame(last, 'day') || cursor.isBefore(last, 'day')) {
          const dateId = cursor.format('YYYY-MM-DD');
          if (getCachedSlots(dateId) === undefined) {
            setCachedSlots(dateId, []);
            markDateAsFetched(dateId);
          }
          cursor = cursor.add(1, 'day');
        }

        // Record completed prefetch window
        const [, setLastPrefetchedRange] =
          getSlotsCacheStore.lastPrefetchedRange();
        setLastPrefetchedRange({ start, end });
      })
      .finally(() => {
        const [, setPrefetchInFlight] = getSlotsCacheStore.prefetchInFlight();
        setPrefetchInFlight(null);
      });

    const [, setPrefetchInFlight] = getSlotsCacheStore.prefetchInFlight();
    setPrefetchInFlight({ start, end, promise });

    await promise;
  } catch (e) {
    console.warn('Prefetch sliding window failed', e);
  }
};
