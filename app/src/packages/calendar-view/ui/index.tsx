import { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Calendar } from '@marceloterreiro/flash-calendar';
import dayjs from 'dayjs';
import { setCurrentScreen } from '@project/shared';

const CalendarScreen = () => {
  const navigation = useNavigation<any>();

  const calendarMonthId = useMemo(
    () => dayjs().startOf('month').format('YYYY-MM-DD'),
    []
  );

  // Track when this screen becomes active
  useFocusEffect(
    useCallback(() => {
      setCurrentScreen('Calendar');
    }, [])
  );

  const onDayPress = (dateId: string) => {
    navigation.navigate('Day', { date: dateId });
  };

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>coCalendar</Text>
        <Text style={styles.subtitle}>Tap a day to view timeline</Text>
      </View>
      <Calendar
        calendarMonthId={calendarMonthId}
        onCalendarDayPress={onDayPress}
      />
    </>
  );
};

export default CalendarScreen;

const styles = StyleSheet.create({
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
