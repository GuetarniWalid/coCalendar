import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
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
import SlotFormScreen, { TOP_ROW_HEIGHT } from './src/packages/slot-form-view/ui';
import ProfileScreen from './src/packages/profile-view/ui';
import StatisticsScreen from './src/packages/statistics-view/ui';
import TasksScreen from './src/packages/tasks-view/ui';
import { BottomNavigation, NAV_HEIGHT } from './src/packages/bottom-navigation/ui';
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
import { SharedHeader } from './src/packages/shared/ui/SharedHeader';
import { DraggedSlotProvider } from '@project/shared/store/dragged-slot';
import { DraggableLayer } from '@project/draggable-layer';

const Stack = createNativeStackNavigator();

const AppNavigation = () => {
  const [user] = useAuthStore.user();
  const [{ colors }] = useThemeStore();
  const { totalBottomNavHeight, maxTranslation } = useKeyboardLayoutValues(
    NAV_HEIGHT,
    HEADER_HEIGHT,
    TOP_ROW_HEIGHT,
  );
  const keyboard = useReliableKeyboard();

  const animatedStyles = useAnimatedStyle(() => {
    const requestedTranslation = Math.max(0, keyboard.height.value - totalBottomNavHeight);
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
                Calendar: 'calendar',
                Day: 'day/:date?',
                Profile: 'profile',
                SlotForm: 'slot-form',
                Statistics: 'statistics',
                Tasks: 'tasks',
              },
            },
          }}
        >
        <Animated.View style={[{ flex: 1 }, animatedStyles]}>
          <SafeAreaView style={styles.container} edges={['top']}>
          {user && <SharedHeader />}
          <Stack.Navigator
            key={user ? 'app' : 'auth'}
            screenOptions={{ headerShown: false }}
          >
            {user ? (
              <>
                <Stack.Screen
                  name="Day"
                  component={DayViewScreen as any}
                  initialParams={{
                    date: new Date().toISOString().slice(0, 10),
                  }}
                />
                <Stack.Screen
                  name="Calendar"
                  component={CalendarScreen as any}
                />
                <Stack.Screen
                  name="Profile"
                  component={ProfileScreen as any}
                />
                <Stack.Screen
                  name="SlotForm"
                  component={SlotFormScreen as any}
                />
                <Stack.Screen
                  name="Statistics"
                  component={StatisticsScreen as any}
                />
                <Stack.Screen name="Tasks" component={TasksScreen as any} />
              </>
            ) : (
              <Stack.Screen name="Auth" component={AuthScreen as any} />
            )}
          </Stack.Navigator>
          {user && <BottomNavigation />}
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
