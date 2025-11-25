import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { useEffect, memo } from 'react';
import { StyleSheet, Appearance } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import * as Linking from 'expo-linking';
import {
  useFonts,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';
import AuthScreen from './src/packages/auth-view/ui';
import CalendarScreen from './src/packages/calendar-view/ui';
import { DayViewScreen } from './src/packages/day-view/ui';
import SlotFormScreen, {
  TOP_ROW_HEIGHT,
} from './src/packages/slot-form-view/ui';
import ProfileScreen from './src/packages/profile-view/ui';
import StatisticsScreen from './src/packages/statistics-view/ui';
import TasksScreen from './src/packages/tasks-view/ui';
import AvatarPickerScreen from './src/packages/avatar-picker-view/ui';
import {
  BottomNavigation,
  NAV_HEIGHT,
} from './src/packages/bottom-navigation/ui';
import {
  useAuthStore,
  initializeAuthClient,
  registerAuthSetters,
  useThemeStore,
  initializeTheme,
  handleSystemThemeChange,
  useKeyboardLayoutValues,
  useReliableKeyboard,
} from '@project/shared';
import { HEADER_HEIGHT } from '@project/day-view';
import { DraggedSlotProvider } from '@project/shared/store/dragged-slot';
import { DraggableLayer } from '@project/draggable-layer';

const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainAppScreen = memo(() => {
  return (
    <Tab.Navigator
      initialRouteName="Day"
      screenOptions={{ headerShown: false }}
      tabBar={(props: BottomTabBarProps) => <BottomNavigation {...props} />}
    >
      <Tab.Screen
        name="Day"
        component={DayViewScreen as any}
        initialParams={{
          date: new Date().toISOString().slice(0, 10),
        }}
      />
      <Tab.Screen name="Calendar" component={CalendarScreen as any} />
      <Tab.Screen name="Profile" component={ProfileScreen as any} />
      <Tab.Screen name="SlotForm" component={SlotFormScreen as any} />
      <Tab.Screen name="Statistics" component={StatisticsScreen as any} />
      <Tab.Screen name="Tasks" component={TasksScreen as any} />
    </Tab.Navigator>
  );
});

const AppNavigation = () => {
  const [user] = useAuthStore.user();
  const [{ colors }] = useThemeStore();
  const { totalBottomNavHeight, maxTranslation } = useKeyboardLayoutValues(
    NAV_HEIGHT,
    HEADER_HEIGHT,
    TOP_ROW_HEIGHT
  );
  const keyboard = useReliableKeyboard();

  const animatedStyles = useAnimatedStyle(() => {
    const requestedTranslation = Math.max(
      0,
      keyboard.height.value - totalBottomNavHeight
    );
    const translation = Math.min(requestedTranslation, maxTranslation);
    return {
      transform: [{ translateY: -translation }],
    };
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
  });

  return (
    <NavigationContainer
      linking={{
        prefixes: [Linking.createURL('/'), 'cocalendar://'],
        config: {
          screens: {
            Auth: 'auth/*',
            MainApp: {
              screens: {
                Day: 'day/:date?',
                Calendar: 'calendar',
                Profile: 'profile',
                SlotForm: 'slot-form',
                Statistics: 'statistics',
                Tasks: 'tasks',
              },
            },
            AvatarPicker: 'avatar-picker',
          },
        },
      }}
    >
      <Animated.View style={[{ flex: 1 }, animatedStyles]}>
        <SafeAreaView style={styles.container} edges={['top']}>
          <RootStack.Navigator
            initialRouteName={user ? 'MainApp' : 'Auth'}
            screenOptions={{ headerShown: false }}
          >
            {user ? (
              <>
                <RootStack.Screen
                  name="MainApp"
                  component={MainAppScreen as any}
                />
                <RootStack.Screen
                  name="AvatarPicker"
                  component={AvatarPickerScreen as any}
                  options={{
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                  }}
                />
              </>
            ) : (
              <RootStack.Screen name="Auth" component={AuthScreen as any} />
            )}
          </RootStack.Navigator>
        </SafeAreaView>
      </Animated.View>
    </NavigationContainer>
  );
};

const AppContent = () => {
  const [, setUser] = useAuthStore.user();
  const [, setLoading] = useAuthStore.loading();

  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  useEffect(() => {
    initializeAuthClient();
    registerAuthSetters(setUser, setLoading);
    initializeTheme();

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      handleSystemThemeChange(colorScheme ?? null);
    });

    return () => subscription.remove();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppNavigation />
      </SafeAreaProvider>
      <DraggableLayer />
    </GestureHandlerRootView>
  );
};

export default function App() {
  return (
    <DraggedSlotProvider>
      <AppContent />
    </DraggedSlotProvider>
  );
}
