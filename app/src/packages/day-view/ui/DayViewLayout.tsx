import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VisibleMonthYear } from './VisibleMonthYear';
import { DayTasksProgress } from './DayTasksProgress';
import { DateSelector } from './DateSelector';
import { BottomNavigation } from '@project/bottom-navigation';
import { colors } from '@project/shared';
 
import type { ReactNode } from 'react';

type DayViewLayoutProps = {
  progressPercentage?: number;
  children: ReactNode;
};

export const DayViewLayout = ({ progressPercentage = 0, children }: DayViewLayoutProps) => {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerRow}>
          <VisibleMonthYear />
          <DayTasksProgress progressPercentage={progressPercentage} />
        </View>
        <DateSelector />
        {children}
      </SafeAreaView>
      <BottomNavigation activeTab="today" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
    paddingLeft: 24,
    paddingBottom: 8,
  },
});


