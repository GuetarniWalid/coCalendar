import { FC, memo, useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors, spacing, fontSize, fontWeight, getAvatarPublicUrl } from '@project/shared';
import { Image } from 'expo-image';
import { useTranslation } from '@project/i18n';
import dayjs from 'dayjs';

type RemainingTimeCardProps = {
  nextActivityStartTime: string;
  onPress: () => void;
};

const RemainingTimeCardBase: FC<RemainingTimeCardProps> = ({ nextActivityStartTime, onPress }) => {
  const t = useTranslation();
  const uri = getAvatarPublicUrl({ persona: 'adult-female', activity: 'home_daily_life', name: 'coffee_break', extension: 'webp' });

  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [animatedHeight] = useState(new Animated.Value(0));
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const hasAnimatedInRef = useRef(false);

  // Calculate remaining time to next activity
  const remainingTimeData = useMemo(() => {
    const now = dayjs(currentTime);
    const nextActivity = dayjs(nextActivityStartTime);

    // If the next activity has already started, don't show card
    if (now.isAfter(nextActivity)) {
      return null;
    }

    const remainingMs = nextActivity.diff(now);
    const totalSeconds = Math.floor(remainingMs / 1000);

    // If less than 1 second, don't show card
    if (totalSeconds <= 0) {
      return null;
    }

    // Format time based on duration
    let timeDisplay: string;
    let shouldUpdate: boolean;

    if (totalSeconds < 60) {
      // Less than 1 minute - show seconds only
      timeDisplay = `${totalSeconds}s`;
      shouldUpdate = true; // Update every second
    } else {
      const totalMinutes = Math.ceil(totalSeconds / 60);

      if (totalMinutes < 60) {
        // Less than 1 hour - show minutes only
        // But if we're close to switching to seconds (under 70 seconds), be more precise
        if (totalSeconds < 70) {
          // Show minutes but update every second to catch the transition
          timeDisplay = `${totalMinutes}min`;
          shouldUpdate = true;
        } else {
          timeDisplay = `${totalMinutes}min`;
          shouldUpdate = false; // Update every minute
        }
      } else {
        // 1 hour or more - show hours and minutes
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        timeDisplay = minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
        shouldUpdate = false; // Update every minute
      }
    }

    return {
      timeDisplay,
      shouldUpdate,
    };
  }, [currentTime, nextActivityStartTime]);

  // Update timer with precise timing
  useEffect(() => {
    if (!remainingTimeData) return;

    const updateTime = () => {
      setCurrentTime(new Date());
    };

    const now = dayjs();
    const nextActivity = dayjs(nextActivityStartTime);
    const remainingMs = nextActivity.diff(now);
    const totalSeconds = Math.floor(remainingMs / 1000);

    if (totalSeconds < 70) {
      // When close to switching to seconds, update every second aligned to the clock
      const msUntilNextSecond = 1000 - now.millisecond();

      // First update at the next exact second
      const initialTimeout = setTimeout(() => {
        updateTime();

        // Then update every second
        const timer = setInterval(updateTime, 1000);

        // Clean up the interval when effect changes
        const cleanup = () => clearInterval(timer);
        (window as any)._remainingTimeCardCleanup = cleanup;
      }, msUntilNextSecond);

      return () => {
        clearTimeout(initialTimeout);
        if ((window as any)._remainingTimeCardCleanup) {
          (window as any)._remainingTimeCardCleanup();
          delete (window as any)._remainingTimeCardCleanup;
        }
      };
    } else {
      // Update every minute
      const timer = setInterval(updateTime, 60000);
      return () => clearInterval(timer);
    }
  }, [remainingTimeData, nextActivityStartTime]);

  // Animate height on mount/unmount
  useEffect(() => {
    const shouldShow = remainingTimeData !== null;

    if (!shouldShow && !isAnimatingOut) {
      // Start animating out
      setIsAnimatingOut(true);
      Animated.timing(animatedHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        // Animation finished, safe to hide component
        setIsAnimatingOut(false);
      });
    } else if (shouldShow && !isAnimatingOut) {
      // Animate in
      Animated.timing(animatedHeight, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        hasAnimatedInRef.current = true;
      });
    }
  }, [remainingTimeData, animatedHeight, isAnimatingOut]);

  // Only return null if no data AND not animating AND never animated in (prevents flash)
  if (!remainingTimeData && !isAnimatingOut && !hasAnimatedInRef.current) {
    return null;
  }

  const animatedStyle = {
    height: animatedHeight.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 129 + spacing.sm * 2], // minHeight + margins
    }),
    opacity: animatedHeight,
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity style={styles.container} onPress={onPress}>
        {!!uri && <Image source={uri} style={styles.bgImage} contentFit='contain' cachePolicy='memory-disk' transition={0} pointerEvents='none' recyclingKey='rest-avatar' priority='high' allowDownscaling={false} key='stable-avatar-image' blurRadius={0} />}
        <View style={styles.content}>
          <Text style={styles.text}>{t.remainingTimeText}</Text>
          <Text style={styles.time}>{remainingTimeData ? remainingTimeData.timeDisplay : '0s'}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const RemainingTimeCard = memo(RemainingTimeCardBase, (prevProps, nextProps) => {
  // Only re-render if nextActivityStartTime changes
  return prevProps.nextActivityStartTime === nextProps.nextActivityStartTime;
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxxl,
    borderRadius: 36,
    minHeight: 129,
    backgroundColor: colors.background.slot.default?.default || colors.background.secondary,
  },
  content: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '50%',
    marginLeft: 'auto',
  },
  text: {
    fontSize: fontSize.base,
    color: colors.typography.primary,
    alignSelf: 'center',
  },
  time: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.typography.primary,
    alignSelf: 'center',
  },
  bgImage: {
    position: 'absolute',
    top: -30,
    left: 15,
    width: 150,
    height: 150,
  } as const,
});
