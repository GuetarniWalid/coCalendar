import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import AuthScreen from './src/packages/auth-view/ui';
import CalendarScreen from './src/packages/calendar-view/ui';
import { DayViewScreen } from './src/packages/day-view/ui';
import SlotFormScreen from './src/packages/slot-form-view/ui';
import ProfileScreen from './src/packages/profile-view/ui';
import StatisticsScreen from './src/packages/statistics-view/ui';
import TasksScreen from './src/packages/tasks-view/ui';
import { BottomNavigation } from './src/packages/bottom-navigation/ui';
import { useAuthStore, initializeAuthClient, registerAuthSetters, colors } from '@project/shared';
import { PortalProvider } from "react-native-teleport";
import { DraggedSlotProvider, useDraggedSlotContext } from '@project/shared/store/dragged-slot';
import { DraggableLayer } from '@project/draggable-layer';

const Stack = createNativeStackNavigator();

const AppContent = () => {
  const [user, setUser] = useAuthStore.user();
  const [, setLoading] = useAuthStore.loading();
  const { draggedSlotIndexRN } = useDraggedSlotContext();

  useEffect(() => {
    initializeAuthClient();
    // Wire Teaful setters so the store updates trigger renders
    registerAuthSetters(setUser, setLoading);
  }, []);

  return (
    <>
      <PortalProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
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
              <SafeAreaView style={styles.container} edges={['top']}>
                <Stack.Navigator key={user ? 'app' : 'auth'} screenOptions={{ headerShown: false }}>
                  {user ? (
                    <>
                      <Stack.Screen
                        name="Day"
                        component={DayViewScreen as any}
                        initialParams={{ date: new Date().toISOString().slice(0, 10) }}
                      />
                      <Stack.Screen name="Calendar" component={CalendarScreen as any} />
                      <Stack.Screen name="Profile" component={ProfileScreen as any} />
                      <Stack.Screen name="SlotForm" component={SlotFormScreen as any} />
                      <Stack.Screen name="Statistics" component={StatisticsScreen as any} />
                      <Stack.Screen name="Tasks" component={TasksScreen as any} />
                    </>
                  ) : (
                    <Stack.Screen name="Auth" component={AuthScreen as any} />
                  )}
                </Stack.Navigator>
                {user && <BottomNavigation />}
              </SafeAreaView>
            </NavigationContainer>
          </SafeAreaProvider>
          {/* Render draggable layer when slot is being dragged */}
          {draggedSlotIndexRN !== null && <DraggableLayer />}
        </GestureHandlerRootView>
      </PortalProvider>
    </>
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
});
