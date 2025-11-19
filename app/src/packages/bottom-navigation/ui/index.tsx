import { FC, useEffect, useRef } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Rive, { AutoBind, Fit, RiveRef } from 'rive-react-native';
import {
  colors,
  useCalendarStore,
  handleFirstButtonPress,
  useNavigationStore,
  useSlotFormStore,
  getSlotBackgroundColor,
} from '@project/shared';
import { BottomNavigationProps } from '../shared/types';
import dayjs from 'dayjs';
import { useNavigation } from '@react-navigation/native';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';

const stateMachineName = 'State Machine 1';
const resourceName = 'bottom_navigation';
const artboardName = 'Artboard';

export const NAV_HEIGHT = 90;

export const BottomNavigation: FC<BottomNavigationProps> = ({
  activeTab: _activeTab = 1,
  onTabPress,
}) => {
  const riveRef = useRef<RiveRef>(null);
  const [selectedDate] = useCalendarStore.selectedDate();
  const currentDay = dayjs(selectedDate).format('DD');
  const navigation = useNavigation<any>();
  const { draggedSlot } = useDraggedSlotContext();
  const [currentScreen] = useNavigationStore.currentScreen();
  const [selectedSlot, setSelectedSlot] = useSlotFormStore.selectedSlot();

  const upperBackgroundColor = currentScreen === 'SlotForm'
    ? getSlotBackgroundColor(selectedSlot?.color)
    : colors.background.primary;

  // Screen mapping array - maps index to screen name (except index 0 which toggles)
  const screenMap = [null, 'Profile', 'SlotForm', 'Statistics', 'Tasks'];

  useEffect(() => {
    const rive = riveRef.current;
    if (!rive) return;
    rive.play();
    rive.setString('day', currentDay);
  }, [currentDay]);

  useEffect(() => {
    const rive = riveRef.current;
    if (!rive) return;

    const screenToIndex: Record<string, number> = {
      Day: 0,
      Calendar: 0,
      Profile: 1,
      SlotForm: 2,
      Statistics: 3,
      Tasks: 4,
    };

    const index = screenToIndex[currentScreen];
    if (index !== undefined) {
      rive.play();
      rive.setNumber('item selected', index + 1);
    }
  }, [currentScreen]);

  const getCurrentRouteName = (): string | undefined => {
    const state = navigation.getState?.();
    // Top-level route name
    // @ts-ignore - navigation state shape
    return state?.routes?.[state.index]?.name as string | undefined;
  };

  const handlePressablePress = (index: number) => {
    const rive = riveRef.current;
    if (!rive) return;

    // Trigger animation immediately for instant feedback
    rive.play();
    rive.setNumber('item selected', index + 1);

    // Defer navigation to next frame to avoid blocking animation
    requestAnimationFrame(() => {
      const currentRoute = getCurrentRouteName();

      if (onTabPress) {
        onTabPress(index);
      } else {
        // Special handling for index 0 - smart Day/Calendar navigation
        if (index === 0) {
          const targetScreen = handleFirstButtonPress();
          if (currentRoute === targetScreen) return; // already focused
          // Reset stack to prevent stacking multiple Day/Calendar screens
          navigation.reset({
            index: 0,
            routes: [{ name: targetScreen }],
          });
        } else {
          // Navigate using index to screen mapping for other indices
          const screenName = screenMap[index];
          if (screenName) {
            if (currentRoute === screenName) return; // already focused
            // Clear selected slot when navigating to SlotForm via bottom nav
            if (screenName === 'SlotForm') {
              setSelectedSlot(null);
            }
            navigation.navigate(screenName);
          }
        }
      }
    });
  };

  return (
    <SafeAreaView
      edges={['bottom']}
      pointerEvents={draggedSlot ? 'none' : 'auto'}
    >
      <View style={[styles.upperBackground, { backgroundColor: upperBackgroundColor }]} />
      <View style={styles.bottomBackground} />
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
            rive.setColor(
              'selector contrast',
              colors.bottomNavigation.selectorContrast
            );
          }}
          onError={error => {
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
  upperBackground: {
    height: '50%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  bottomBackground: {
    height: '50%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bottomNavigation.background,
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
