import { View, StyleSheet } from 'react-native';
import { VisibleMonthYear, DayTasksProgress, DateSelector, useDayView, HEADER_ROW_PADDING_BOTTOM } from '@project/day-view';
import { useNavigationStore } from '../store/navigation';
import { colors } from '../theme';

export const SharedHeader = () => {
  const [currentScreen] = useNavigationStore.currentScreen();
  const { slots, loading } = useDayView();

  const shouldShowHeader = currentScreen === 'Day' || currentScreen === 'SlotForm';

  if (!shouldShowHeader) {
    return null;
  }

  return (
    <>
      <View style={styles.headerRow}>
        <VisibleMonthYear />
        <DayTasksProgress slots={slots} loading={loading} />
      </View>
      <DateSelector />
    </>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
    paddingLeft: 24,
    paddingBottom: HEADER_ROW_PADDING_BOTTOM,
    backgroundColor: colors.background.primary,
  },
});
