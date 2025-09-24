import { FC, useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { colors, spacing, progressBarConfig, hasSpecificTime, calculateSlotProgress, formatRemainingTime } from '@project/shared';
import { useTranslation } from '@project/i18n';

interface ProgressBarProps {
  startTime: string;
  endTime: string;
  slotColor?: string | undefined;
}

const ProgressBarBase: FC<ProgressBarProps> = ({ startTime, endTime, slotColor }) => {
  const [currentTime, setCurrentTime] = useState(() => new Date()); // Initialize with current time immediately
  const t = useTranslation();
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const animatedTextHeight = useRef(new Animated.Value(0)).current;
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Check if this slot should show progress (has specific times)
  const shouldShowProgress = useMemo(() => {
    return hasSpecificTime(startTime) && hasSpecificTime(endTime);
  }, [startTime, endTime]);
  
  // Calculate progress data - recalculate on every currentTime change for precision
  const progressData = useMemo(() => {
    if (!shouldShowProgress) return null;
    
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
        isCompleted: progressResult.isCompleted
      };
    }
    
    return null;
  }, [startTime, endTime, shouldShowProgress, currentTime, t]);
  
  // Set up real-time updates - separate effect for initial setup
  useEffect(() => {
    if (!shouldShowProgress) return;
    
    // Immediate update to sync with mobile system time
    setCurrentTime(new Date());
  }, [startTime, endTime, shouldShowProgress]);
  
  // Initialize animations with correct values (no animation for completed tasks)
  useEffect(() => {
    if (progressData && !isInitialized) {
      // For completed tasks, set values immediately without animation
      if (progressData.isCompleted) {
        animatedWidth.setValue(100);
        animatedTextHeight.setValue(0); // No text for completed tasks
      } else {
        // For active tasks, set initial values and let animations handle updates
        animatedWidth.setValue(progressData.percentage);
        animatedTextHeight.setValue(progressData.remainingTime ? 1 : 0);
      }
      setIsInitialized(true);
    }
  }, [progressData, isInitialized, animatedWidth, animatedTextHeight]);
  
  // Set up continuous timer for active slots  
  useEffect(() => {
    if (!shouldShowProgress || !progressData) return;
    
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
  }, [startTime, endTime, shouldShowProgress, progressData]);
  
  // Set up precise timeouts for slot boundaries
  useEffect(() => {
    if (!shouldShowProgress) return;
    
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
  }, [startTime, endTime, shouldShowProgress]);
  
  const progressWidth = useMemo(() => progressData ? Math.max(0, Math.min(100, progressData.percentage)) : 0, [progressData]);
  
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
  }, [progressData?.remainingTime, isInitialized]);

  
  // Find the contrast color based on the slot color
  const progressColor = useMemo(() => {
    if (!slotColor) {
      return colors.background.slot.default?.contrast || colors.success;
    }
    
    // Find the slot color definition that matches the provided color
    const slotColorEntry = Object.values(colors.background.slot).find(
      colorDef => colorDef.default === slotColor
    );
    
    return slotColorEntry?.contrast || colors.background.slot.default?.contrast || colors.success;
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
          }
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
              backgroundColor: progressColor 
            }
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
    lineHeight: progressBarConfig.textFontSize * progressBarConfig.textLineHeight, // Calculated line height
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
