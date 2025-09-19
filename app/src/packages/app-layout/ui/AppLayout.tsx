import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNavigation } from '@project/bottom-navigation';
import { colors } from '@project/shared';

import type { ReactNode } from 'react';

type AppLayoutProps = {
  activeTab?: 'today' | 'profile' | 'breath' | 'timer';
  children: ReactNode;
};

export const AppLayout = ({ activeTab = 'today', children }: AppLayoutProps) => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {children}
      <BottomNavigation activeTab={activeTab} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background.primary,
    flex: 1,
  },
});
