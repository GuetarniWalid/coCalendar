import { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { useAuthStore } from '@project/shared';
import { SlotItem } from '@project/shared';
import { useCalendarStore } from '@project/shared';
import { fetchSlotsForDate, fetchSlotsInRange } from '../data/fetch-slots';

export const useDayView = (_initialDate: string) => {
  const [{ supabase, user }] = useAuthStore();
  const [selectedDate] = useCalendarStore.selectedDate();
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRevisions, setDateRevisions] = useState<Record<string, number>>(
    {}
  ); // Track revisions per date

  // In-memory cache for slots per date id
  const slotsCacheRef = useRef<Record<string, SlotItem[]>>({});
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
    if (cached) {
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
          if (afterPrefetch) {
            setSlots(afterPrefetch);
            setLoading(false);
            return;
          }
          // Covered by prefetch and no entry added => empty day
          slotsCacheRef.current[selectedDate] = [];
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

      prefetchRangeRef.current = { start, end };
      const promise = fetchSlotsInRange(supabase, user.id, start, end)
        .then(result => {
          // Merge into cache
          slotsCacheRef.current = { ...slotsCacheRef.current, ...result };
          // Mark empty days explicitly in cache within the prefetched range
          let cursor = dayjs(start);
          const last = dayjs(end);
          while (cursor.isSame(last, 'day') || cursor.isBefore(last, 'day')) {
            const dateId = cursor.format('YYYY-MM-DD');
            if (!(dateId in slotsCacheRef.current)) {
              slotsCacheRef.current[dateId] = [];
            }
            cursor = cursor.add(1, 'day');
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

    // Increment revisions only for affected dates
    setDateRevisions(prev => ({
      ...prev,
      [sourceDate]: (prev[sourceDate] || 0) + 1,
      [targetDate]: (prev[targetDate] || 0) + 1,
    }));
  };

  return {
    slots,
    loading,
    dateRevisions,
    getSlotsForDate: (date: string): SlotItem[] | undefined => {
      return slotsCacheRef.current[date];
    },
    updateSlotCache,
  };
};
