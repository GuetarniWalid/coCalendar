import { FC, memo, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  getAvatarPublicUrl,
  useTimeTrackerStore,
} from '@project/shared';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  LinearTransition,
} from 'react-native-reanimated';
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

  // Use Teaful time tracker for currentTime instead of individual useState
  const [currentTime] = useTimeTrackerStore.currentTime();
  const heightAnimation = useSharedValue(0);
  const hasShownRef = useRef(false);

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

    if (totalSeconds <= 59) {
      // 59 seconds or less - show seconds only
      timeDisplay = `${totalSeconds}s`;
      shouldUpdate = true; // Update every second
    } else {
      const totalMinutes = Math.ceil(totalSeconds / 60);

      if (totalMinutes < 60) {
        // Less than 1 hour - show minutes only
        timeDisplay = `${totalMinutes}min`;
        shouldUpdate = totalSeconds <= 120; // Update every second when 2 minutes or less
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

  // Handle smooth show/hide animations with reanimated
  const shouldShow = remainingTimeData !== null;

  useEffect(() => {
    if (shouldShow && !hasShownRef.current) {
      // Animate in
      heightAnimation.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.quad),
      });
      hasShownRef.current = true;
    } else if (!shouldShow && hasShownRef.current) {
      // Animate out
      heightAnimation.value = withTiming(0, {
        duration: 300,
        easing: Easing.in(Easing.quad),
      });
      hasShownRef.current = false;
    }
  }, [shouldShow, heightAnimation]);

  // Animated style using reanimated
  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: heightAnimation.value * (129 + spacing.sm * 2), // minHeight + margins
      opacity: heightAnimation.value,
    };
  });

  // Only return null if never shown and not supposed to show
  if (!remainingTimeData && !hasShownRef.current) {
    return null;
  }

  return (
    <Animated.View style={animatedStyle} layout={LinearTransition}>
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
          <Text style={styles.time}>
            {remainingTimeData ? remainingTimeData.timeDisplay : '0s'}
          </Text>
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
