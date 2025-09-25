import { FC, useEffect, useRef } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Rive, { AutoBind, Fit, RiveRef } from 'rive-react-native';
import { colors, useCalendarStore, handleFirstButtonPress } from '@project/shared';
import { BottomNavigationProps } from '../shared/types';
import dayjs from 'dayjs';
import { useNavigation } from '@react-navigation/native';

const stateMachineName = 'State Machine 1';
const resourceName = 'bottom_navigation';
const artboardName = 'Artboard';
const NAV_HEIGHT = 90;

export const BottomNavigation: FC<BottomNavigationProps> = ({ 
  activeTab: _activeTab = 1,
  onTabPress 
}) => {
  const riveRef = useRef<RiveRef>(null);
  const [selectedDate] = useCalendarStore.selectedDate();
  const currentDay = dayjs(selectedDate).format('DD');
  const navigation = useNavigation<any>();

  // Screen mapping array - maps index to screen name (except index 0 which toggles)
  const screenMap = [null, 'Profile', 'SlotForm', 'Statistics', 'Tasks'];

  useEffect(() => {
    const rive = riveRef.current;
    if (!rive) return;
    rive.play();
    rive.setString('day', currentDay);
  }, [currentDay]);

  const handlePressablePress = (index: number) => {
    const rive = riveRef.current;
    if (!rive) return;
    
    // Trigger animation immediately for instant feedback
    rive.play();
    rive.setNumber('item selected', index + 1);
    
    // Defer navigation to next frame to avoid blocking animation
    requestAnimationFrame(() => {
      if (onTabPress) {
        onTabPress(index);
      } else {
        // Special handling for index 0 - smart Day/Calendar navigation
        if (index === 0) {
          const targetScreen = handleFirstButtonPress();
          navigation.navigate(targetScreen);
        } else {
          // Navigate using index to screen mapping for other indices
          const screenName = screenMap[index];
          if (screenName) {
            navigation.navigate(screenName);
          }
        }
      }
    });
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.riveContainer}>
        <Rive
          style={styles.rive}
          ref={riveRef}
          resourceName={resourceName}
          artboardName={artboardName}
          stateMachineName={stateMachineName}
          autoplay={true}
          dataBinding={AutoBind(true)}
          fit={Fit.Layout}
          onPlay={() => {
            const rive = riveRef.current;
            if (!rive) return;
            rive.setColor('background', colors.bottomNavigation.background);
            rive.setColor('selector', colors.bottomNavigation.selector);
            rive.setColor('primary', colors.typography.primary);
            rive.setColor('selector contrast', colors.bottomNavigation.selectorContrast);
          }}  
          onError={(error) => {
            console.log('Error loading Rive animation', error);
          }}
        />
        <View style={styles.overlay}>
          {Array.from({ length: 5 }, (_, index) => (
            <Pressable
              key={index}
              style={styles.pressable}
              onPress={() => handlePressablePress(index)}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bottomNavigation.background,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 5,
  },
  riveContainer: {
    position: 'relative',
  },
  rive: {
    height: NAV_HEIGHT,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  pressable: {
    flex: 1,
  },
});
