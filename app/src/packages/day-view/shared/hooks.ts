import { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { useAuthStore } from '@project/shared';
import { SlotItem } from '@project/shared';
import { useCalendarStore } from '@project/shared';
import {
  getCachedSlots,
  setCachedSlots,
  isDateFetched,
  markDateAsFetched,
} from '@project/shared';
import { fetchSlotsForDate, fetchSlotsInRange } from '../data/fetch-slots';

export const useDayView = () => {
  const [{ supabase, user }] = useAuthStore();
  const [selectedDate] = useCalendarStore.selectedDate();
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [loading, setLoading] = useState(true);

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
    const cached = getCachedSlots(selectedDate);
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
          const afterPrefetch = getCachedSlots(selectedDate);
          if (afterPrefetch !== undefined) {
            setSlots(afterPrefetch);
            setLoading(false);
            return;
          }
          // Covered by prefetch and no entry added => empty day
          setCachedSlots(selectedDate, []);
          markDateAsFetched(selectedDate);
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
      setCachedSlots(selectedDate, formattedSlots);
      markDateAsFetched(selectedDate);
      setSlots(formattedSlots);
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
        if (!isDateFetched(dateId)) {
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

          // If current selection arrived via prefetch, use it immediately
          const currentDateSlots = getCachedSlots(selectedDate);
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

  return {
    slots,
    loading,
  };
};
