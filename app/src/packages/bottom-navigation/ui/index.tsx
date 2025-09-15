import { FC } from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSize, fontWeight } from '@project/shared';
import { CalendarDay, Profile, Breath, Timer } from '@project/icons';
import { BottomNavigationProps } from '../shared/types';
import { Plus } from '@project/icons/app/plus';

export const BottomNavigation: FC<BottomNavigationProps> = ({ activeTab = 'today' }) => {
  const navigation = useNavigation<any>();

  const handleTabPress = (tab: string) => {
    switch (tab) {
      case 'today':
        navigation.navigate('Calendar');
        break;
      case 'profile':
        // TODO: Implement when Profile screen exists
        break;
      case 'breath':
        // TODO: Implement when Breath screen exists
        break;
      case 'timer':
        // TODO: Implement when Timer screen exists
        break;
    }
  };

  const tabs = [
    {
      id: 'today',
      label: 'Today',
      icon: CalendarDay,
      isActive: activeTab === 'today',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: Profile,
      isActive: activeTab === 'profile',
    },
    {
      id: 'breath',
      label: 'Breath',
      icon: Breath,
      isActive: activeTab === 'breath',
    },
    {
      id: 'timer',
      label: 'Timer',
      icon: Timer,
      isActive: activeTab === 'timer',
    },
  ];

  return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        {tabs.map(tab => {
          const IconComponent = tab.icon;
          return (
            <TouchableOpacity key={tab.id} style={styles.tab} onPress={() => handleTabPress(tab.id)} activeOpacity={0.7}>
              <IconComponent size={30} color={tab.isActive ? colors.typography.mobileNav : colors.typography.secondary} />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: tab.isActive ? colors.typography.mobileNav : colors.typography.secondary,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
        <View style={styles.plusButton}>
          <Plus size={22} color={colors.typography.mobileNav} />
        </View>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.background.mobileNav,
    paddingBottom: spacing.sm,
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: 60,
  },
  tabLabel: {
    fontSize: fontSize.xxs,
    fontWeight: fontWeight.medium,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  plusButton: {
    position: 'absolute',
    top: "-60%",
    left: "50%",
    transform: [{ translateX: '-25%' }],
    backgroundColor: colors.background.mobileNav,
    borderRadius: 999,
    width: 76,
    height: 76,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: colors.background.primary,
  },
});
