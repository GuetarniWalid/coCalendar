import { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { useAuthStore } from '@project/shared';
import { SlotItem } from '@project/shared';
import { useCalendarStore } from '@project/shared';
import { fetchSlotsForDate, fetchSlotsInRange } from '../data/fetch-slots';

export const useDayView = () => {
  const [{ supabase, user }] = useAuthStore();
  const [selectedDate] = useCalendarStore.selectedDate();
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cacheVersion, setCacheVersion] = useState(0);

  // In-memory cache for slots per date id
  const slotsCacheRef = useRef<Record<string, SlotItem[]>>({});
  // Track which dates have been fetched from the database to prevent re-fetching
  const fetchedDatesRef = useRef<Set<string>>(new Set());
  // Track ongoing prefetch and ranges
  const prefetchPromiseRef = useRef<Promise<void> | null>(null); // in-flight promise
  const prefetchRangeRef = useRef<{ start: string; end: string } | null>(null); // in-flight range
  const lastPrefetchedRangeRef = useRef<{ start: string; end: string } | null>(
    null
  ); // last completed range

  useEffect(() => {
    fetchSlots();
    if (user) prefetchSlidingWindow();
  }, [selectedDate, user]);

  const fetchSlots = async () => {
    if (!user) return;
    // Serve from cache if available
    const cached = slotsCacheRef.current[selectedDate];
    if (cached !== undefined) {
      setSlots(cached);
      setLoading(false);
      return;
    }
    // If a prefetch is in-flight and this date is within its range, wait for it first
    if (prefetchPromiseRef.current && prefetchRangeRef.current) {
      const { start, end } = prefetchRangeRef.current;
      if (selectedDate >= start && selectedDate <= end) {
        try {
          await prefetchPromiseRef.current;
          const afterPrefetch = slotsCacheRef.current[selectedDate];
          if (afterPrefetch !== undefined) {
            setSlots(afterPrefetch);
            setLoading(false);
            return;
          }
          // Covered by prefetch and no entry added => empty day
          slotsCacheRef.current[selectedDate] = [];
          fetchedDatesRef.current.add(selectedDate);
          setSlots([]);
          setLoading(false);
          return;
        } catch {}
      }
    }

    // True cache miss: show loader, fetch and cache
    setLoading(true);
    try {
      const formattedSlots = await fetchSlotsForDate(
        supabase,
        user.id,
        selectedDate
      );
      slotsCacheRef.current[selectedDate] = formattedSlots;
      fetchedDatesRef.current.add(selectedDate);
      setSlots(formattedSlots);
      setCacheVersion(v => v + 1);
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prefetch a sliding window around the selected date to minimize per-day loads
  const prefetchSlidingWindow = async () => {
    try {
      if (!user) return;
      const PREFETCH_BEFORE_DAYS = 21; // 3 weeks back
      const PREFETCH_AFTER_DAYS = 21; // 3 weeks forward
      const start = dayjs(selectedDate)
        .subtract(PREFETCH_BEFORE_DAYS, 'day')
        .format('YYYY-MM-DD');
      const end = dayjs(selectedDate)
        .add(PREFETCH_AFTER_DAYS, 'day')
        .format('YYYY-MM-DD');

      // If an in-flight prefetch already covers this window, let it finish
      if (prefetchPromiseRef.current && prefetchRangeRef.current) {
        const r = prefetchRangeRef.current;
        if (start >= r.start && end <= r.end) {
          return;
        }
      }

      // If the last completed prefetch covers this window, skip
      if (lastPrefetchedRangeRef.current) {
        const r = lastPrefetchedRangeRef.current;
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
        if (!fetchedDatesRef.current.has(dateId)) {
          hasUnfetchedDates = true;
          break;
        }
        cursor = cursor.add(1, 'day');
      }

      if (!hasUnfetchedDates) {
        lastPrefetchedRangeRef.current = { start, end };
        return;
      }

      prefetchRangeRef.current = { start, end };
      const promise = fetchSlotsInRange(supabase, user.id, start, end)
        .then(result => {
          let cacheUpdated = false;

          // Merge into cache, but NEVER overwrite existing entries
          Object.keys(result).forEach(dateId => {
            if (slotsCacheRef.current[dateId] === undefined && result[dateId]) {
              slotsCacheRef.current[dateId] = result[dateId];
              fetchedDatesRef.current.add(dateId);
              cacheUpdated = true;
            }
          });

          // Mark empty days explicitly in cache within the prefetched range
          let cursor = dayjs(start);
          const last = dayjs(end);
          while (cursor.isSame(last, 'day') || cursor.isBefore(last, 'day')) {
            const dateId = cursor.format('YYYY-MM-DD');
            if (slotsCacheRef.current[dateId] === undefined) {
              slotsCacheRef.current[dateId] = [];
              fetchedDatesRef.current.add(dateId);
              cacheUpdated = true;
            }
            cursor = cursor.add(1, 'day');
          }

          // Increment cache version if we added new data
          if (cacheUpdated) {
            setCacheVersion(v => v + 1);
          }

          // If current selection arrived via prefetch, use it immediately
          const currentDateSlots = slotsCacheRef.current[selectedDate];
          if (currentDateSlots !== undefined) {
            setSlots(currentDateSlots);
            setLoading(false);
          }
          // Record completed prefetch window
          lastPrefetchedRangeRef.current = { start, end };
        })
        .finally(() => {
          prefetchPromiseRef.current = null;
          prefetchRangeRef.current = null;
        });
      prefetchPromiseRef.current = promise;
      await promise;
    } catch (e) {
      console.warn('Prefetch sliding window failed', e);
    }
  };

  // Method to update cache when a slot is moved between days
  const updateSlotCache = (
    slotId: string,
    sourceDate: string,
    targetDate: string,
    updatedSlot: SlotItem | null
  ) => {
    // Remove slot from source date cache
    if (slotsCacheRef.current[sourceDate]) {
      slotsCacheRef.current[sourceDate] = slotsCacheRef.current[
        sourceDate
      ].filter(s => s.id !== slotId);
    }

    // Add updated slot to target date cache if update was successful
    if (updatedSlot && slotsCacheRef.current[targetDate]) {
      // Check if slot already exists in target (shouldn't happen but be safe)
      const existingIndex = slotsCacheRef.current[targetDate].findIndex(
        s => s.id === updatedSlot.id
      );
      if (existingIndex >= 0) {
        slotsCacheRef.current[targetDate][existingIndex] = updatedSlot;
      } else {
        slotsCacheRef.current[targetDate].push(updatedSlot);
      }
    }

    setCacheVersion(v => v + 1);
  };

  // Method to invalidate cache for specific dates (to refetch fresh data from DB)
  const invalidateCache = (dates: string[]) => {
    dates.forEach(date => {
      delete slotsCacheRef.current[date];
      fetchedDatesRef.current.delete(date);
    });
    setCacheVersion(v => v + 1);
  };

  return {
    slots,
    loading,
    updateSlotCache,
    invalidateCache,
    slotsCacheRef,
    cacheVersion,
  };
};
