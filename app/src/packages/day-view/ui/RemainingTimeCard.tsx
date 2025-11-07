import { FC, memo, useMemo, useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, { FlipInEasyX, FlipOutEasyX } from 'react-native-reanimated';
import {
  Text,
  colors,
  spacing,
  fontSize,
  getAvatarPublicUrl,
} from '@project/shared';
import { Image } from 'expo-image';
import { useTranslation } from '@project/i18n';
import dayjs from 'dayjs';

type RemainingTimeCardProps = {
  nextActivityStartTime: string;
};

const RemainingTimeCardBase: FC<RemainingTimeCardProps> = ({
  nextActivityStartTime,
}) => {
  const t = useTranslation();
  const uri = getAvatarPublicUrl({
    persona: 'adult-female',
    activity: 'home_daily_life',
    name: 'coffee_break',
    extension: 'webp',
  });

  const [tick, setTick] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate remaining time to next activity
  const timeDisplay = useMemo(() => {
    const now = dayjs();
    const nextActivity = dayjs(nextActivityStartTime);
    const remainingMs = nextActivity.diff(now);
    const totalSeconds = Math.floor(remainingMs / 1000);

    // Format time based on duration
    if (totalSeconds <= 60) {
      // 60 seconds or less - show seconds only
      return `${totalSeconds}s`;
    } else {
      const totalMinutes = Math.ceil(totalSeconds / 60);

      if (totalMinutes < 60) {
        // Less than 1 hour - show minutes only
        return `${totalMinutes}min`;
      } else {
        // 1 hour or more - show hours and minutes
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
      }
    }
  }, [nextActivityStartTime, tick]);

  // Set up timer to update display at appropriate interval
  useEffect(() => {
    // Clean up any existing timers
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const now = dayjs();
    const nextActivity = dayjs(nextActivityStartTime);
    const remainingMs = nextActivity.diff(now);
    const totalSeconds = Math.floor(remainingMs / 1000);

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

          // Then set up interval for subsequent minute updates
          intervalRef.current = setInterval(() => {
            setTick(prev => prev + 1);
          }, 60000);
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
  }, [nextActivityStartTime, tick]);

  return (
    <Animated.View entering={FlipInEasyX} exiting={FlipOutEasyX}>
      <Pressable style={styles.container}>
        {!!uri && (
          <Image
            source={uri}
            style={styles.bgImage}
            contentFit="contain"
            cachePolicy="memory-disk"
            transition={0}
            pointerEvents="none"
            recyclingKey="rest-avatar"
            priority="high"
            allowDownscaling={false}
            key="stable-avatar-image"
            blurRadius={0}
          />
        )}
        <View style={styles.content}>
          <Text style={styles.text}>{t.remainingTimeText}</Text>
          <Text style={styles.time} fontWeight="bold">{timeDisplay}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export const RemainingTimeCard = memo(
  RemainingTimeCardBase,
  (prevProps, nextProps) => {
    // Only re-render if nextActivityStartTime changes
    return prevProps.nextActivityStartTime === nextProps.nextActivityStartTime;
  }
);

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxxl,
    borderRadius: 36,
    minHeight: 129,
    backgroundColor:
      colors.background.slot.default?.default || colors.background.secondary,
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
