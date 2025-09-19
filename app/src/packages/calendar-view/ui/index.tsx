import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Calendar } from '@marceloterreiro/flash-calendar';
import dayjs from 'dayjs';
import { AppLayout } from '@project/app-layout';
 
const CalendarScreen = () => {
  const navigation = useNavigation<any>();

  const calendarMonthId = useMemo(() => dayjs().startOf('month').format('YYYY-MM-DD'), []);

  const onDayPress = (dateId: string) => {
    navigation.navigate('Day', { date: dateId });
  };

  return (
    <AppLayout activeTab='today'>
      <View style={styles.header}>
        <Text style={styles.title}>coCalendar</Text>
        <Text style={styles.subtitle}>Tap a day to view timeline</Text>
      </View>
      <Calendar
        calendarMonthId={calendarMonthId}
        onCalendarDayPress={onDayPress}
      />
    </AppLayout>
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
