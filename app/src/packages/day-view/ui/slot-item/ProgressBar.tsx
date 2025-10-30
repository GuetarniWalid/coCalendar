import { useMemo, useState, useEffect, useRef } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  LinearTransition,
  useAnimatedStyle,
  withTiming,
  Easing,
  useSharedValue,
} from 'react-native-reanimated';
import {
  hasSpecificTime,
  calculateSlotProgress,
  getSlotContrastColor,
  SlotColorName,
  fontSize,
} from '@project/shared';
import { useTranslation } from '@project/i18n';
import dayjs from 'dayjs';

interface ProgressBarProps {
  startTime: string | null;
  endTime: string | null;
  slotColor?: SlotColorName | undefined;
}

export const ProgressBar = ({
  startTime,
  endTime,
  slotColor,
}: ProgressBarProps) => {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const t = useTranslation();
  const progressWidth = useSharedValue(0);
  
  // Timer state for remaining time display
  const [tick, setTick] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const shouldShowProgress = useMemo(() => {
    if (!startTime || !endTime) return false;
    return hasSpecificTime(startTime) && hasSpecificTime(endTime);
  }, [startTime, endTime]);

  const isFutureDay = useMemo(() => {
    if (!startTime) return false;
    const today = dayjs().format('YYYY-MM-DD');
    const slotDate = dayjs(startTime).format('YYYY-MM-DD');
    return slotDate > today;
  }, [startTime]);

  const progressColor = useMemo(() => {
    return getSlotContrastColor(slotColor);
  }, [slotColor]);

  const progressData = useMemo(() => {
    const progressResult = calculateSlotProgress(startTime, endTime);

    if (progressResult !== null) {
      // Calculate remaining time in milliseconds for animation
      const now = dayjs();
      const end = dayjs(endTime);
      const remainingMs = end.diff(now);

      return {
        percentage: progressResult.percentage,
        isCompleted: progressResult.isCompleted,
        remainingMs: Math.max(0, remainingMs), // Remaining time in ms for animation
      };
    }

    return null;
  }, [startTime, endTime, currentTime]);

  // Calculate remaining time text with smart update intervals
  const remainingTimeText = useMemo(() => {
    if (!startTime || !endTime) return null;
    
    const now = dayjs();
    const start = dayjs(startTime);
    const end = dayjs(endTime);

    // If not started yet or already completed, don't show remaining time
    if (now.isBefore(start) || now.isAfter(end)) {
      return null;
    }

    const remainingMs = end.diff(now);
    const totalSeconds = Math.floor(remainingMs / 1000);

    // If time is up, return null
    if (totalSeconds <= 0) {
      return null;
    }

    // Format time based on duration
    if (totalSeconds < 60) {
      // Less than 1 minute - show seconds
      const unit = totalSeconds === 1 ? t.secondsSingular : t.secondsPlural;
      return `${t.remainingPrefix} ${totalSeconds} ${unit}`;
    } else {
      const totalMinutes = Math.ceil(totalSeconds / 60);

      if (totalMinutes < 60) {
        // Less than 1 hour - show minutes only
        const unit = totalMinutes === 1 ? t.minutesSingular : t.minutesPlural;
        return `${t.remainingPrefix} ${totalMinutes} ${unit}`;
      } else {
        // 1 hour or more - show hours and minutes
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        if (minutes === 0) {
          return `${t.remainingPrefix} ${hours}h`;
        }
        
        return `${t.remainingPrefix} ${hours}h ${minutes}${t.minutesPlural}`;
      }
    }
  }, [startTime, endTime, tick, t]);

  // Set up timeout to trigger animation when slot starts (if it hasn't started yet)
  useEffect(() => {
    if (!shouldShowProgress) return undefined;

    const now = dayjs();
    const start = dayjs(startTime);

    // If slot hasn't started yet, set a timeout to trigger recalculation when it starts
    if (now.isBefore(start)) {
      const msUntilStart = start.diff(now);
      
      // Add a small buffer (100ms) to ensure we're past the start time
      const timeout = setTimeout(() => {
        setCurrentTime(new Date()); // Trigger progress animation recalculation
        setTick(prev => prev + 1); // Trigger text timer setup
      }, msUntilStart + 100);

      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [startTime, endTime, shouldShowProgress]);

  // Smart timer for remaining time text updates
  useEffect(() => {
    // Clean up any existing timers
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (!startTime || !endTime) return undefined;

    const now = dayjs();
    const start = dayjs(startTime);
    const end = dayjs(endTime);

    // Only set up timer if slot is currently active
    if (now.isBefore(start) || now.isAfter(end)) {
      return undefined;
    }

    const remainingMs = end.diff(now);
    const totalSeconds = Math.floor(remainingMs / 1000);

    if (totalSeconds <= 0) {
      return undefined;
    }

    if (totalSeconds <= 60) {
      // Update every second when 1 minute or less
      intervalRef.current = setInterval(() => {
        setTick(prev => prev + 1);
      }, 1000);
    } else {
      // For minute-based updates, sync to minute boundaries
      const secondsIntoMinute = totalSeconds % 60;
      const msUntilNextMinute = secondsIntoMinute * 1000;

      if (msUntilNextMinute > 0) {
        // First timer: wait until the next minute boundary
        timeoutRef.current = setTimeout(() => {
          setTick(prev => prev + 1);
          
          // Check if we're now at < 60 seconds
          const nowAfterTimeout = dayjs();
          const remainingAfterTimeout = end.diff(nowAfterTimeout);
          const secondsRemaining = Math.floor(remainingAfterTimeout / 1000);

          if (secondsRemaining <= 60) {
            // Switch to second-based updates
            intervalRef.current = setInterval(() => {
              setTick(prev => prev + 1);
            }, 1000);
          } else {
            // Continue with minute-based updates
            intervalRef.current = setInterval(() => {
              setTick(prev => prev + 1);
            }, 60000);
          }
        }, msUntilNextMinute);
      } else {
        // Already at a minute boundary, start interval immediately
        intervalRef.current = setInterval(() => {
          setTick(prev => prev + 1);
        }, 60000);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [startTime, endTime, tick]);

  // Update progress animation when progressData changes
  useEffect(() => {
    if (!progressData) {
      progressWidth.value = 0;
      return;
    }

    if (progressData.isCompleted) {
      progressWidth.value = 100;
      return;
    }

    // Set the initial width to the current percentage (without animation)
    progressWidth.value = progressData.percentage;

    // Then animate from current percentage to 100% over the remaining time
    if (progressData.remainingMs > 0) {
      progressWidth.value = withTiming(100, {
        duration: progressData.remainingMs,
        easing: Easing.linear,
      });
    }
  }, [progressData, progressWidth]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progressWidth.value}%`,
    };
  });

  if (!shouldShowProgress) return null;
  if (isFutureDay) return null;
  if (!progressData) return null;

  return (
    <Animated.View style={styles.container}>
      {remainingTimeText && (
        <Animated.View style={[styles.textContainer]}>
          <Text style={[styles.remainingText, { color: progressColor }]}>
            {remainingTimeText}
          </Text>
        </Animated.View>
      )}
      <Animated.View style={styles.progressTrack} layout={LinearTransition}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: progressColor,
            },
            animatedStyle,
          ]}
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 4,
  },
  textContainer: {
    justifyContent: 'center',
    overflow: 'hidden',
  },
  remainingText: {
    fontSize: fontSize.sm,
    paddingBottom: 12,
  },
  progressTrack: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});
