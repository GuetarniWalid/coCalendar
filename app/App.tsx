import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import AuthScreen from './src/packages/auth-view/ui';
import OnboardingScreen from './src/packages/onboarding-view/ui';
import CalendarScreen from './src/packages/calendar-view/ui';
import { DayViewScreen } from './src/packages/day-view/ui';
import SlotFormScreen from './src/packages/slot-form-view/ui';
import ProfileScreen from './src/packages/profile-view/ui';
import StatisticsScreen from './src/packages/statistics-view/ui';
import TasksScreen from './src/packages/tasks-view/ui';
import { BottomNavigation } from './src/packages/bottom-navigation/ui';
import {
  useAuthStore,
  initializeAuthClient,
  registerAuthSetters,
  checkOnboardingStatus,
  completeOnboarding,
  setCurrentScreen,
  colors,
} from '@project/shared';
import { DraggedSlotProvider } from '@project/shared/store/dragged-slot';
import { DraggableLayer } from '@project/draggable-layer';

const Stack = createNativeStackNavigator();

const AppContent = () => {
  const [user, setUser] = useAuthStore.user();
  const [, setLoading] = useAuthStore.loading();
  const [onboardingCompleted] = useAuthStore.onboardingCompleted();
  const [checkingOnboarding] = useAuthStore.checkingOnboarding();

  useEffect(() => {
    initializeAuthClient();
    // Wire Teaful setters so the store updates trigger renders
    registerAuthSetters(setUser, setLoading);
  }, []);

  // Check onboarding status when user logs in
  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
    }
  }, [user]);

  const handleCompleteOnboarding = async () => {
    const success = await completeOnboarding();
    if (success) {
      // Navigate to Day view after completing onboarding
      setCurrentScreen('Day');
    }
  };

  // Show loading while checking onboarding status
  if (user && checkingOnboarding) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  // Determine which screen to show
  const shouldShowOnboarding = user && !onboardingCompleted;
  const shouldShowApp = user && onboardingCompleted;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer
          linking={{
            prefixes: [Linking.createURL('/'), 'cocalendar://'],
            config: {
              screens: {
                Auth: 'auth/*',
                Onboarding: 'onboarding',
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
          <SafeAreaView style={styles.container} edges={['top']}>
            <Stack.Navigator
              key={shouldShowApp ? 'app' : shouldShowOnboarding ? 'onboarding' : 'auth'}
              screenOptions={{ headerShown: false }}
            >
              {shouldShowOnboarding ? (
                <Stack.Screen name="Onboarding">
                  {() => <OnboardingScreen onComplete={handleCompleteOnboarding} />}
                </Stack.Screen>
              ) : shouldShowApp ? (
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
            {shouldShowApp && <BottomNavigation />}
          </SafeAreaView>
        </NavigationContainer>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
});
