import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Rive, { AutoBind, Fit, RiveRef } from 'rive-react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  colors,
  useCalendarStore,
  handleFirstButtonPress,
  useNavigationStore,
  useSlotFormStore,
  getSlotBackgroundColor,
} from '@project/shared';
import dayjs from 'dayjs';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';

const stateMachineName = 'State Machine 1';
const resourceName = 'bottom_navigation';
const artboardName = 'Artboard';

export const NAV_HEIGHT = 90;

export const BottomNavigation = ({ state, navigation }: BottomTabBarProps) => {
  const riveRef = useRef<RiveRef>(null);
  const [selectedDate] = useCalendarStore.selectedDate();
  const currentDay = dayjs(selectedDate).format('DD');
  const { draggedSlot } = useDraggedSlotContext();
  const [currentScreen] = useNavigationStore.currentScreen();
  const [selectedSlot, setSelectedSlot] = useSlotFormStore.selectedSlot();
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  const upperBackgroundColor =
    currentScreen === 'SlotForm'
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

  const getCurrentRouteName = (): string => {
    return state.routes[state.index].name;
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

      // Special handling for index 0 - smart Day/Calendar navigation
      if (index === 0) {
        const targetScreen = handleFirstButtonPress();
        if (currentRoute === targetScreen) return; // already focused
        navigation.navigate(targetScreen);
      } else {
        // Navigate using index to screen mapping for other indices
        const screenName = screenMap[index];
        if (screenName) {
          if (currentRoute === screenName) return; // already focused
          // Create a default slot object for new slots
          if (screenName === 'SlotForm') {
            setSelectedSlot({
              id: '', // Will be generated when saved
              title: '',
              startTime: null, // No time set yet
              endTime: null, // No time set yet
              withoutTime: true, // New slots have no time by default
              type: 'private', // New slots have no participants
              completionStatus: 'auto',
              tasks: [],
              participants: [],
            });
          }
          navigation.navigate(screenName);
        }
      }
    });
  };

  return (
    <SafeAreaView
      edges={['bottom']}
      pointerEvents={draggedSlot ? 'none' : 'auto'}
    >
      <View
        style={[
          styles.upperBackground,
          { backgroundColor: upperBackgroundColor },
        ]}
      />
      <View style={styles.bottomBackground} />
      <View
        style={styles.riveContainer}
        onLayout={() => setIsLayoutReady(true)}
      >
        {isLayoutReady && (
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
        )}
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
