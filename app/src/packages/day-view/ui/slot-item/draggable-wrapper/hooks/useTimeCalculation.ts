import { useEffect, useState, useRef } from 'react';
import { SharedValue } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import dayjs from 'dayjs';
import { VERTICAL_SNAP_THRESHOLD, TIME_CALCULATION_INTERVAL, TIME_ZONE_1, TIME_ZONE_5, TIME_ZONE_10, TIME_ZONE_30 } from '../shared/constants';

/**
 * Rounds time to nearest multiple of grid minutes based on direction
 * @param time ISO string
 * @param grid minutes grid (1,5,10,30,60)
 * @param direction 1 = later, -1 = earlier
 */
const roundToGrid = (time: string | null, grid: number, direction: number): string | null => {
  if (!time) return null;

  try {
    const date = dayjs(time);
    const minutes = date.minute();
    const remainder = minutes % grid;

    if (remainder === 0) return time;

    if (direction > 0) {
      // Round up to next grid
      return date
        .add(grid - remainder, 'minute')
        .toDate()
        .toISOString();
    } else {
      // Round down to previous grid
      return date.subtract(remainder, 'minute').toDate().toISOString();
    }
  } catch {
    return time;
  }
};

/**
 * Determines increment rate (in minutes per tick) based on distance from origin (zone system)
 */
const getIncrementRateForZone = (absOffsetY: number): number => {
  if (absOffsetY < TIME_ZONE_1) return 1; // 1 min
  if (absOffsetY < TIME_ZONE_5) return 5; // 5 min
  if (absOffsetY < TIME_ZONE_10) return 10; // 10 min
  if (absOffsetY < TIME_ZONE_30) return 30; // 30 min
  return 60; // 60 min
};

/**
 * Checks if the slot is in the snap zone
 */
const isInSnapZone = (offsetY: number): boolean => {
  return Math.abs(offsetY) <= VERTICAL_SNAP_THRESHOLD;
};

/**
 * Hook to calculate and manage adjusted time display during drag
 *
 * Zone-based rate system:
 * - Time increments/decrements every 500ms while in non-snap zone
 * - Rate depends on distance from origin (4 zones)
 * - In snap zone: stops changing but keeps current value
 *
 * Special behavior:
 * - Each tick: if grid>1 and current time is not aligned to the grid, snap first; then next tick increments by grid
 */
export const useTimeCalculation = (draggedSlotOffsetY: SharedValue<number>, isDragging: boolean, originalTime: string | null) => {
  const [adjustedTime, setAdjustedTime] = useState<string | null>(originalTime);

  // Track state across ticks - use refs to avoid stale closures
  const originalTimeRef = useRef<string | null>(originalTime);
  const adjustedTimeRef = useRef<string | null>(originalTime);
  const previousTimeRef = useRef<string | null>(originalTime);
  const hasStartedRef = useRef(false);
  const previousDraggingRef = useRef(false);
  const previousGridRef = useRef<number | null>(null);

  // Sync refs with props and state
  useEffect(() => {
    originalTimeRef.current = originalTime;
  }, [originalTime]);

  useEffect(() => {
    adjustedTimeRef.current = adjustedTime;
  }, [adjustedTime]);

  // Util: apply time change iff value differs;
  const applyTime = (nextIso: string | null) => {
    const current = adjustedTimeRef.current;
    if (!nextIso || current === nextIso) {
      return false;
    }
    setAdjustedTime(nextIso);
    adjustedTimeRef.current = nextIso;
    previousTimeRef.current = nextIso;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    return true;
  };

  // Placeholder ref to hold tick function (assigned inside effect to avoid stale closure)
  const incrementTime = useRef<() => void>(() => {});

  // Update adjusted time when original time changes (e.g., when draggedSlotData is set)
  useEffect(() => {
    if (originalTime && !adjustedTime) {
      applyTime(originalTime);
    }
  }, [originalTime]);

  // Set up interval for continuous time updates
  useEffect(() => {
    // Reset on new drag start
    if (isDragging && !previousDraggingRef.current) {
      if (originalTime) {
        applyTime(originalTime);
      }
      hasStartedRef.current = false;
      previousGridRef.current = null;
    }

    previousDraggingRef.current = isDragging;

    if (!isDragging) {
      return;
    }

    // Only start interval if we have a valid original time
    if (!originalTime) {
      return;
    }

    // Assign fresh tick function capturing latest refs
    incrementTime.current = () => {
      const offsetY = draggedSlotOffsetY.value;
      const absOffsetY = Math.abs(offsetY);
      const inSnapZone = isInSnapZone(offsetY);

      // In snap zone - stop updating but keep current value
      if (inSnapZone) {
        return;
      }

      const direction = offsetY < 0 ? -1 : 1;
      const grid = getIncrementRateForZone(absOffsetY);

      // First time leaving snap: seed and, if grid>1, snap to grid; then immediately step to avoid 500ms gap
      if (!hasStartedRef.current) {
        const seed = adjustedTimeRef.current || originalTimeRef.current;
        if (seed) {
          const seeded = grid === 1 ? seed : roundToGrid(seed, grid, direction) || seed;
          applyTime(seeded);
        }
        hasStartedRef.current = true;
        // Immediate step after seed to avoid perceived dead time
        const afterSeedBase = adjustedTimeRef.current || originalTimeRef.current;
        if (afterSeedBase) {
          const stepped = dayjs(afterSeedBase)
            .add(grid * direction, 'minute')
            .toDate()
            .toISOString();
          applyTime(stepped);
        }
        previousGridRef.current = grid;
        return;
      }

      // If grid changed due to zone change, snap current adjusted time to new grid and immediately step
      if (previousGridRef.current !== grid) {
        const current = adjustedTimeRef.current || originalTimeRef.current;
        if (current) {
          const snapped = grid === 1 ? current : roundToGrid(current, grid, direction) || current;
          const didSnap = applyTime(snapped);
          // Immediate step even if snapped == current to avoid 500ms delay
          const base = (didSnap ? snapped : current) as string;
          const stepped = dayjs(base)
            .add(grid * direction, 'minute')
            .toDate()
            .toISOString();
          applyTime(stepped);
          previousGridRef.current = grid;
          return;
        }
      }

      // Regular tick: apply grid step
      const currentTime = adjustedTimeRef.current || originalTimeRef.current;
      if (!currentTime) return;
      const newTime = dayjs(currentTime)
        .add(grid * direction, 'minute')
        .toDate()
        .toISOString();
      applyTime(newTime);
    };

    const interval = setInterval(() => {
      incrementTime.current();
    }, TIME_CALCULATION_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [isDragging, originalTime]);

  // Ensure we always show the latest originalTime on drag start before leaving snap
  useEffect(() => {
    if (!isDragging) return;
    const currentOriginal = originalTimeRef.current;
    if (!currentOriginal) return;
    if (!hasStartedRef.current && adjustedTimeRef.current !== currentOriginal) {
      applyTime(currentOriginal);
    }
  }, [isDragging, originalTime]);

  return {
    adjustedTime,
  };
};
