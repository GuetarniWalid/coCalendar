import { FC, useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import {
  spacing,
  progressBarConfig,
  hasSpecificTime,
  calculateSlotProgress,
  formatRemainingTime,
  getSlotContrastColor,
  SlotColorName,
} from '@project/shared';
import { useTranslation } from '@project/i18n';
import dayjs from 'dayjs';

interface ProgressBarProps {
  startTime: string | null;
  endTime: string | null;
  slotColor?: SlotColorName | undefined;
}

const ProgressBarBase: FC<ProgressBarProps> = ({
  startTime,
  endTime,
  slotColor,
}) => {
  const [currentTime, setCurrentTime] = useState(() => new Date()); // Initialize with current time immediately
  const t = useTranslation();
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const animatedTextHeight = useRef(new Animated.Value(0)).current;
  const [isInitialized, setIsInitialized] = useState(false);

  // Track the current day to handle day transitions for long-running apps
  const [trackedDay, setTrackedDay] = useState(() =>
    dayjs().format('YYYY-MM-DD')
  );

  // Check if this slot should show progress (has specific times)
  const shouldShowProgress = useMemo(() => {
    if (!startTime || !endTime) return false;
    return hasSpecificTime(startTime) && hasSpecificTime(endTime);
  }, [startTime, endTime]);

  // Check if slot has completed (end time has passed)
  // This improves performance by showing static filled bars for past slots
  const isCompleted = useMemo(() => {
    if (!endTime) return false;
    const now = dayjs();
    const endDateTime = dayjs(endTime);
    return now.isAfter(endDateTime);
  }, [endTime]);

  // Check if slot is on a future day (not today)
  // This improves performance by not showing progress bars for future days
  const isFutureDay = useMemo(() => {
    if (!startTime) return false;
    const today = dayjs().format('YYYY-MM-DD');
    const slotDate = dayjs(startTime).format('YYYY-MM-DD');
    return slotDate > today;
  }, [startTime]);

  // Early return checks for optimization
  if (!shouldShowProgress) {
    return null;
  }

  // For future days, don't show progress bar at all (no calculations needed)
  if (isFutureDay) {
    return null;
  }

  // For completed slots (end time has passed), show a simple filled progress bar without animations
  if (isCompleted) {
    const progressColor = useMemo(() => {
      return getSlotContrastColor(slotColor);
    }, [slotColor]);

    return (
      <View style={styles.container}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: '100%',
                backgroundColor: progressColor,
              },
            ]}
          />
        </View>
      </View>
    );
  }

  // For non-completed slots - Calculate progress data with animations and timers
  // Calculate progress data - recalculate on every currentTime change for precision
  const progressData = useMemo(() => {
    // Only calculate for non-completed slots (could be future or active)
    if (!shouldShowProgress || isCompleted) return null;

    // Always use the most current time for calculations
    const progressResult = calculateSlotProgress(startTime, endTime);
    const remainingTime = formatRemainingTime(startTime, endTime, {
      remainingPrefix: t.remainingPrefix,
      minutesSingular: t.minutesSingular,
      minutesPlural: t.minutesPlural,
      secondsSingular: t.secondsSingular,
      secondsPlural: t.secondsPlural,
    });

    // Show progress bar if we have progress data
    if (progressResult !== null) {
      return {
        percentage: progressResult.percentage,
        remainingTime: progressResult.isCompleted ? null : remainingTime, // Hide text when completed
        isCompleted: progressResult.isCompleted,
      };
    }

    return null;
  }, [startTime, endTime, shouldShowProgress, currentTime, t, isCompleted]);

  // Daily reset mechanism for long-running apps
  useEffect(() => {
    const checkDayChange = () => {
      const currentDay = dayjs().format('YYYY-MM-DD');
      if (currentDay !== trackedDay) {
        setTrackedDay(currentDay);
        setCurrentTime(new Date()); // Force recalculation of day-based logic
      }
    };

    // Check immediately
    checkDayChange();

    // Set up interval to check for day changes every minute
    const dayCheckInterval = setInterval(checkDayChange, 60000); // Check every minute

    return () => clearInterval(dayCheckInterval);
  }, [trackedDay]);

  // Set up real-time updates - separate effect for initial setup (only for non-completed current day slots)
  useEffect(() => {
    if (!shouldShowProgress || isCompleted || isFutureDay) return;

    // Immediate update to sync with mobile system time
    setCurrentTime(new Date());
  }, [startTime, endTime, shouldShowProgress, isCompleted, isFutureDay]);

  // Set up a timer to transition to completed when slot ends (only for current day)
  useEffect(() => {
    if (!shouldShowProgress || isCompleted || isFutureDay) return;

    const endDateTime = dayjs(endTime);
    const now = dayjs();

    // If slot will end in the future, set a timeout to trigger re-render when it ends
    if (now.isBefore(endDateTime)) {
      const timeUntilEnd = endDateTime.diff(now);

      const timeout = setTimeout(() => {
        setCurrentTime(new Date()); // Force re-render to recalculate isCompleted
      }, timeUntilEnd);

      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [startTime, endTime, shouldShowProgress, isCompleted, isFutureDay]);

  // Initialize animations with correct values (no animation for completed tasks)
  useEffect(() => {
    if (progressData && !isInitialized) {
      // For completed tasks, set values immediately without animation
      if (progressData.isCompleted) {
        animatedWidth.setValue(100);
        animatedTextHeight.setValue(0); // No text for completed tasks
      } else {
        // For active tasks, start from 0 and let animations handle smooth appearance
        animatedWidth.setValue(progressData.percentage);
        animatedTextHeight.setValue(0); // Start from 0 for smooth animation
      }
      setIsInitialized(true);
    }
  }, [progressData, isInitialized, animatedWidth, animatedTextHeight]);

  // Trigger initial text height animation after initialization
  useEffect(() => {
    if (isInitialized && progressData && !progressData.isCompleted) {
      const hasText = !!progressData.remainingTime;

      // Small delay to ensure initialization is complete
      setTimeout(() => {
        Animated.timing(animatedTextHeight, {
          toValue: hasText ? 1 : 0,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }).start();
      }, 50); // 50ms delay for smooth initial appearance
    }
  }, [isInitialized, progressData, animatedTextHeight]);

  // Set up continuous timer for active slots (only for non-completed current day slots)
  useEffect(() => {
    if (
      !shouldShowProgress ||
      !progressData ||
      isCompleted ||
      isFutureDay ||
      !startTime ||
      !endTime
    )
      return;

    const endTimeDate = new Date(endTime);
    const startTimeDate = new Date(startTime);
    const now = new Date();

    // For active slots, update every second synchronized to system clock
    if (now >= startTimeDate && now <= endTimeDate) {
      // Calculate delay to next second boundary for perfect sync
      const currentMs = now.getMilliseconds();
      const delayToNextSecond = 1000 - currentMs;

      let intervalId: NodeJS.Timeout | null = null;

      // First, sync to the next second boundary
      const syncTimeout = setTimeout(() => {
        setCurrentTime(new Date());

        // Then set up interval synchronized to exact seconds
        intervalId = setInterval(() => {
          setCurrentTime(new Date());
        }, 1000);
      }, delayToNextSecond);

      return () => {
        clearTimeout(syncTimeout);
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    }

    return undefined;
  }, [
    startTime,
    endTime,
    shouldShowProgress,
    progressData,
    isCompleted,
    isFutureDay,
  ]);

  // Set up precise timeouts for slot boundaries (only for non-completed current day slots)
  useEffect(() => {
    if (
      !shouldShowProgress ||
      isCompleted ||
      isFutureDay ||
      !startTime ||
      !endTime
    )
      return;

    const endTimeDate = new Date(endTime);
    const startTimeDate = new Date(startTime);
    const now = new Date();

    // For slots that will start soon, set timeout for start time
    if (now < startTimeDate) {
      const timeUntilStart = startTimeDate.getTime() - now.getTime();

      const timeout = setTimeout(() => {
        setCurrentTime(new Date());
      }, timeUntilStart);

      return () => clearTimeout(timeout);
    }

    // For slots that will end soon, set precise timeout for end time
    if (now < endTimeDate) {
      const timeUntilEnd = endTimeDate.getTime() - now.getTime();

      const timeout = setTimeout(() => {
        setCurrentTime(new Date());
      }, timeUntilEnd);

      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [startTime, endTime, shouldShowProgress, isCompleted, isFutureDay]);

  const progressWidth = useMemo(
    () =>
      progressData ? Math.max(0, Math.min(100, progressData.percentage)) : 0,
    [progressData]
  );

  // Animate progress bar width changes for smooth transitions
  useEffect(() => {
    if (progressData && isInitialized) {
      // Only animate if component is initialized and not completed
      const shouldAnimate = !progressData.isCompleted;

      if (shouldAnimate) {
        Animated.timing(animatedWidth, {
          toValue: progressWidth,
          duration: 800, // Slightly faster for smoother feel
          easing: Easing.out(Easing.quad), // Natural easing for smooth feel
          useNativeDriver: false, // Width animations can't use native driver
        }).start();
      } else {
        // For completed tasks, set immediately
        animatedWidth.setValue(progressWidth);
      }
    } else if (!progressData) {
      // Reset animation when no progress data
      animatedWidth.setValue(0);
    }
  }, [progressWidth, isInitialized, progressData]);

  // Animate text container height for smooth transitions
  useEffect(() => {
    if (!isInitialized) return;

    const hasText = !!progressData?.remainingTime;

    Animated.timing(animatedTextHeight, {
      toValue: hasText ? 1 : 0,
      duration: 300, // Faster than progress animation to avoid conflicts
      easing: Easing.out(Easing.quad),
      useNativeDriver: false, // Height animation requires layout thread
    }).start();
  }, [progressData?.remainingTime, isInitialized, animatedTextHeight]);

  // Find the contrast color based on the slot color
  const progressColor = useMemo(() => {
    return getSlotContrastColor(slotColor);
  }, [slotColor]);

  // Don't render if no progress data - but this comes after all hooks
  if (!progressData) return null;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.textContainer,
          {
            height: animatedTextHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, progressBarConfig.textContainerHeight], // Calculated from theme tokens
              extrapolate: 'clamp',
            }),
            overflow: 'hidden',
          },
        ]}
      >
        {progressData.remainingTime && (
          <Text style={[styles.remainingText, { color: progressColor }]}>
            {progressData.remainingTime}
          </Text>
        )}
      </Animated.View>
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: animatedWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
              backgroundColor: progressColor,
            },
          ]}
        />
      </View>
    </View>
  );
};

export const ProgressBar = ProgressBarBase;

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: spacing.xs,
  },
  textContainer: {
    justifyContent: 'center',
  },
  remainingText: {
    fontSize: progressBarConfig.textFontSize, // Use configured font size
    lineHeight:
      progressBarConfig.textFontSize * progressBarConfig.textLineHeight, // Calculated line height
    paddingBottom: progressBarConfig.textPadding, // Use configured padding
    // Color is set dynamically to match progress bar color
  },
  progressTrack: {
    height: progressBarConfig.trackHeight, // Use configured track height
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    // backgroundColor is set dynamically based on slot color
  },
});
