import { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { useAuthStore } from '@project/shared';
import { SlotItem, generateWeekDays } from '@project/shared';
import { useCalendarStore } from '@project/shared';
import { setCalendarSelectedDate } from '@project/shared/store/calendar';
import { fetchSlotsForDate, fetchSlotsInRange } from '../data/fetch-slots';

// Returns YYYY-MM-DD for the Monday of the week containing date
const getMondayOfWeek = (date: string): string => {
	const d = dayjs(date);
	const dayOfWeek = d.day(); // 0 (Sun) .. 6 (Sat)
	const daysFromMonday = (dayOfWeek + 6) % 7; // 0 when Monday
	return d.subtract(daysFromMonday, 'day').format('YYYY-MM-DD');
};

// Checks if a date (YYYY-MM-DD) lies within the 7-day window starting at weekStart
const isWithinWeek = (date: string, weekStart: string): boolean => {
	const start = dayjs(weekStart);
	const target = dayjs(date);
	return target.isSame(start, 'day') || (target.isAfter(start, 'day') && target.diff(start, 'day') < 7);
};

export const useDayView = (initialDate: string) => {
	const [{ supabase, user }] = useAuthStore();
	const [selectedDate] = useCalendarStore.selectedDate();
	const [slots, setSlots] = useState<SlotItem[]>([]);
	const [loading, setLoading] = useState(true);

	// In-memory cache for slots per date id
	const slotsCacheRef = useRef<Record<string, SlotItem[]>>({});
	// Track ongoing prefetch and range it covers
	const prefetchPromiseRef = useRef<Promise<void> | null>(null);
	const prefetchRangeRef = useRef<{ start: string; end: string } | null>(null);

	// Ensure week starts on Monday
	const initialWeekStart = getMondayOfWeek(initialDate || selectedDate);
	const [weekStart, setWeekStart] = useState(initialWeekStart);
	const [daysList, setDaysList] = useState(
		generateWeekDays(initialWeekStart).map((d) => ({ ...d, isSelected: d.date === (initialDate || selectedDate) }))
	);

	// If a route-provided initialDate differs, sync it to global calendar once
	if (initialDate && selectedDate !== initialDate) {
		setCalendarSelectedDate(initialDate);
	}

	useEffect(() => {
		fetchSlots();
		// Prefetch surrounding days if user is present
		if (user) prefetchAdjacentWeek();
	}, [selectedDate, user, weekStart]);

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
					setSlots([]);
					setLoading(false);
					return;
				} catch {}
			}
		}
		// True cache miss: show loader, fetch and cache
		setLoading(true);
		try {
			const formattedSlots = await fetchSlotsForDate(supabase, user.id, selectedDate);
			slotsCacheRef.current[selectedDate] = formattedSlots;
			setSlots(formattedSlots);
		} catch (error) {
			console.error('Error fetching slots:', error);
		} finally {
			setLoading(false);
		}
	};

	// Prefetch the whole current week plus the next and previous weeks
	const prefetchAdjacentWeek = async () => {
		try {
			const weekDays = generateWeekDays(weekStart);
			if (!weekDays || weekDays.length < 7) return;
			const start = weekDays[0]?.date ?? weekStart;
			const end = weekDays[6]?.date ?? weekStart;
			const prevStart = dayjs(start).subtract(7, 'day').format('YYYY-MM-DD');
			const nextEnd = dayjs(end).add(7, 'day').format('YYYY-MM-DD');
			if (!user) return;
			prefetchRangeRef.current = { start: prevStart, end: nextEnd };
			const promise = fetchSlotsInRange(supabase, user.id, prevStart, nextEnd)
				.then((result) => {
					// Merge into cache
					slotsCacheRef.current = { ...slotsCacheRef.current, ...result };
					// Mark empty days explicitly in cache within the prefetched range
					let cursor = dayjs(prevStart);
					const last = dayjs(nextEnd);
					while (cursor.isSame(last, 'day') || cursor.isBefore(last, 'day')) {
						const dateId = cursor.format('YYYY-MM-DD');
						if (!(dateId in slotsCacheRef.current)) {
							slotsCacheRef.current[dateId] = [];
						}
						cursor = cursor.add(1, 'day');
					}
					// If current selection arrived via prefetch, use it immediately
					if (result[selectedDate]) {
						setSlots(result[selectedDate]);
						setLoading(false);
					}
				})
				.finally(() => {
					prefetchPromiseRef.current = null;
					prefetchRangeRef.current = null;
				});
			prefetchPromiseRef.current = promise;
			await promise;
		} catch (e) {
			console.warn('Prefetch week failed', e);
		}
	};

	const onDayPress = (date: string) => {
		setCalendarSelectedDate(date);
		// If tapped day is outside the current week window, shift the window to that week
		if (!isWithinWeek(date, weekStart)) {
			const newWeekStart = getMondayOfWeek(date);
			setWeekStart(newWeekStart);
			setDaysList(generateWeekDays(newWeekStart).map((d) => ({ ...d, isSelected: d.date === date })));
			return;
		}
		// Otherwise, only update selection within current week
		setDaysList((prev) => prev.map((d) => ({ ...d, isSelected: d.date === date })));
	};

	// When selectedDate changes externally (e.g., via DateSelector), align week window and selection
	useEffect(() => {
		if (!selectedDate) return;
		if (!isWithinWeek(selectedDate, weekStart)) {
			const newWeekStart = getMondayOfWeek(selectedDate);
			setWeekStart(newWeekStart);
			setDaysList(generateWeekDays(newWeekStart).map((d) => ({ ...d, isSelected: d.date === selectedDate })));
		} else {
			setDaysList((prev) => prev.map((d) => ({ ...d, isSelected: d.date === selectedDate })));
		}
	}, [selectedDate]);

	const onWeekScroll = (direction: 'prev' | 'next') => {
		const delta = direction === 'next' ? 7 : -7;
		const newStart = dayjs(weekStart).add(delta, 'day').format('YYYY-MM-DD');
		
		// Preserve the same weekday by using the offset within the current week
		const weekdayOffset = Math.max(0, Math.min(6, dayjs(selectedDate).diff(dayjs(weekStart), 'day')));
		const newSelectedDate = dayjs(newStart).add(weekdayOffset, 'day').format('YYYY-MM-DD');
		
		setWeekStart(newStart);
		setCalendarSelectedDate(newSelectedDate);
		const newDays = generateWeekDays(newStart).map((d) => ({ ...d, isSelected: d.date === newSelectedDate }));
		setDaysList(newDays);
	};

	return {
		selectedDate,
		slots,
		loading,
		daysList,
		weekStart,
		onDayPress,
		onWeekScroll,
		getSlotsForDate: (date: string): SlotItem[] | undefined => {
			return slotsCacheRef.current[date];
		},
		refetch: fetchSlots,
	};
};
