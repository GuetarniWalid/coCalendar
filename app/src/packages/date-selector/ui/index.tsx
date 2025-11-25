import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
} from 'react-native';
import dayjs from 'dayjs';
import { DayItem, Text } from '@project/shared';
import { colors, spacing, fontSize, useCalendarStore } from '@project/shared';
import {
  DATE_SELECTOR_NAME_FONT_SIZE,
  DATE_SELECTOR_NAME_MARGIN_BOTTOM,
  DATE_SELECTOR_PADDING_TOP,
  DATE_SELECTOR_PADDING_BOTTOM,
} from '../constants';

const screenWidth = Dimensions.get('window').width;

interface DateSelectorProps {
  selectedBackgroundColor: string;
  selectedTextColor: string;
}

export const DateSelector = ({
  selectedBackgroundColor,
  selectedTextColor,
}: DateSelectorProps) => {
  const [selectedDate, setSelectedDate] = useCalendarStore.selectedDate();
  const [, setChangeAskedBy] = useCalendarStore.changeAskedBy();
  const flatListRef = useRef<FlatList>(null);
  const isTransitioningRef = useRef<boolean>(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleDatePress = useCallback(
    (date: string) => {
      setSelectedDate(date);
      setChangeAskedBy('dateSelector');
    },
    [setSelectedDate, setChangeAskedBy]
  );

  const renderDayItem = useCallback(
    (d: DayItem) => (
      <Pressable
        key={d.date}
        style={[
          styles.dayCell,
          d.isSelected && { backgroundColor: selectedBackgroundColor },
        ]}
        onPress={() => handleDatePress(d.date)}
      >
        <Text
          style={[
            styles.dateName,
            d.isSelected && { color: selectedTextColor },
          ]}
        >
          {d.day}
        </Text>
        <Text
          style={[
            styles.dateNumber,
            d.isSelected && { color: selectedTextColor },
          ]}
          fontWeight="700"
        >
          {dayjs(d.date).format('D')}
        </Text>
        {d.isToday && (
          <View
            style={[
              styles.todayDot,
              {
                backgroundColor: d.isSelected
                  ? selectedTextColor
                  : colors.typography.secondary,
              },
            ]}
          />
        )}
      </Pressable>
    ),
    [handleDatePress]
  );

  const startOfWeek = useMemo(() => {
    const d = dayjs(selectedDate);
    const dayOfWeek = d.day();
    const daysFromMonday = (dayOfWeek + 6) % 7;
    return d.subtract(daysFromMonday, 'day').format('YYYY-MM-DD');
  }, [selectedDate]);

  const daysList = useMemo(() => {
    const start = dayjs(startOfWeek);
    return Array.from({ length: 7 }).map((_, i) => {
      const date = start.add(i, 'day');
      const id = date.format('YYYY-MM-DD');
      return {
        date: id,
        day: date.format('ddd'),
        isSelected: id === selectedDate,
        isToday: id === dayjs().format('YYYY-MM-DD'),
      } as DayItem;
    });
  }, [startOfWeek, selectedDate]);

  const visibleWeekStartRef = useRef<string>(
    daysList[0]?.date ?? dayjs().startOf('week').format('YYYY-MM-DD')
  );

  const currentWeekStart = useMemo(() => {
    return daysList[0]?.date ?? dayjs().startOf('week').format('YYYY-MM-DD');
  }, [daysList]);

  const [overrideCenterWeek, setOverrideCenterWeek] = useState<
    DayItem[] | null
  >(null);

  const buildWeek = (startDate: string, base?: DayItem[]): DayItem[] => {
    const start = dayjs(startDate);
    return Array.from({ length: 7 }).map((_, i) => {
      const date = start.add(i, 'day');
      const id = date.format('YYYY-MM-DD');
      const original =
        base?.find(d => d.date === id) ?? daysList.find(d => d.date === id);
      return (
        original ?? {
          date: id,
          day: date.format('ddd'),
          isSelected: false,
          isToday: id === dayjs().format('YYYY-MM-DD'),
        }
      );
    });
  };

  const effectiveCenterWeek: DayItem[] = overrideCenterWeek ?? daysList;

  const pages = useMemo(() => {
    if (isTransitioning) {
      return [effectiveCenterWeek, effectiveCenterWeek, effectiveCenterWeek];
    }
    const centerStart = effectiveCenterWeek[0]?.date ?? currentWeekStart;
    const prevStart = dayjs(centerStart)
      .subtract(7, 'day')
      .format('YYYY-MM-DD');
    const nextStart = dayjs(centerStart).add(7, 'day').format('YYYY-MM-DD');
    return [
      buildWeek(prevStart, effectiveCenterWeek),
      effectiveCenterWeek,
      buildWeek(nextStart, effectiveCenterWeek),
    ];
  }, [effectiveCenterWeek, currentWeekStart, isTransitioning]);

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(x / screenWidth);
    if (pageIndex === 0 && !isTransitioningRef.current) {
      isTransitioningRef.current = true;
      setIsTransitioning(true);
      setScrollEnabled(false);
      const selectedIndexBase = effectiveCenterWeek.findIndex(
        d => d.isSelected
      );
      const selectedIndex = selectedIndexBase >= 0 ? selectedIndexBase : 0;
      const prevStart = dayjs(visibleWeekStartRef.current)
        .subtract(7, 'day')
        .format('YYYY-MM-DD');
      const prevWeek = buildWeek(prevStart, effectiveCenterWeek).map(
        (d, i) => ({
          ...d,
          isSelected: i === selectedIndex,
        })
      );
      const targetSelectedDate = dayjs(prevStart)
        .add(selectedIndex, 'day')
        .format('YYYY-MM-DD');

      setOverrideCenterWeek(prevWeek);
      visibleWeekStartRef.current = prevStart;
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToIndex({ index: 1, animated: false });
        setTimeout(() => {
          setSelectedDate(targetSelectedDate);
          setChangeAskedBy('dateSelector');
        }, 0);
      });
    } else if (pageIndex === 2 && !isTransitioningRef.current) {
      isTransitioningRef.current = true;
      setIsTransitioning(true);
      setScrollEnabled(false);
      const selectedIndexBase = effectiveCenterWeek.findIndex(
        d => d.isSelected
      );
      const selectedIndex = selectedIndexBase >= 0 ? selectedIndexBase : 0;
      const nextStart = dayjs(visibleWeekStartRef.current)
        .add(7, 'day')
        .format('YYYY-MM-DD');
      const nextWeek = buildWeek(nextStart, effectiveCenterWeek).map(
        (d, i) => ({
          ...d,
          isSelected: i === selectedIndex,
        })
      );
      const targetSelectedDate = dayjs(nextStart)
        .add(selectedIndex, 'day')
        .format('YYYY-MM-DD');
      setOverrideCenterWeek(nextWeek);
      visibleWeekStartRef.current = nextStart;
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToIndex({ index: 1, animated: false });
        setTimeout(() => {
          setSelectedDate(targetSelectedDate);
          setChangeAskedBy('dateSelector');
        }, 0);
      });
    }
  };

  useEffect(() => {
    if (daysList[0]?.date) {
      visibleWeekStartRef.current = daysList[0].date;
    }
    if (
      overrideCenterWeek &&
      overrideCenterWeek[0]?.date === daysList[0]?.date
    ) {
      setOverrideCenterWeek(null);
    }
    isTransitioningRef.current = false;
    setIsTransitioning(false);
    setScrollEnabled(true);
  }, [daysList, overrideCenterWeek]);

  return (
    <View style={styles.container} collapsable={false}>
      <FlatList
        ref={flatListRef}
        data={pages}
        keyExtractor={(_, i) => `week-page-${i}`}
        horizontal
        pagingEnabled
        scrollEnabled={scrollEnabled}
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={1}
        initialNumToRender={3}
        windowSize={3}
        maxToRenderPerBatch={3}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={false}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
        onMomentumScrollEnd={handleMomentumEnd}
        renderItem={({ item }: { item: DayItem[] }) => (
          <View style={[styles.weekRow, { width: screenWidth }]}>
            {item.map(renderDayItem)}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
    position: 'relative',
    zIndex: 10,
    backgroundColor: colors.background.primary,
  },
  weekRow: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    maxWidth: 50,
    paddingTop: DATE_SELECTOR_PADDING_TOP,
    paddingBottom: DATE_SELECTOR_PADDING_BOTTOM,
    position: 'relative',
  },
  dateName: {
    fontSize: DATE_SELECTOR_NAME_FONT_SIZE,
    color: colors.typography.secondary,
    marginBottom: DATE_SELECTOR_NAME_MARGIN_BOTTOM,
  },
  dateNumber: {
    fontSize: fontSize['xl'],
    color: colors.typography.secondary,
  },
  todayDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 999,
    bottom: 14,
    alignSelf: 'center',
  },
});
