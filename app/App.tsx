import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import AuthScreen from './src/packages/auth-view/ui';
import CalendarScreen from './src/packages/calendar-view/ui';
import { DayViewScreen } from './src/packages/day-view/ui';
import SlotFormScreen from './src/packages/slot-form-view/ui';
import { useAuthStore, initializeAuthClient, registerAuthSetters } from '@project/shared';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useAuthStore.user();
  const [, setLoading] = useAuthStore.loading();

  useEffect(() => {
    initializeAuthClient();
    // Wire Teaful setters so the store updates trigger renders
    registerAuthSetters(setUser, setLoading);
  }, []);

  return (
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
                SlotForm: 'slot-form',
              },
            },
          }}
        >
          <Stack.Navigator key={user ? 'app' : 'auth'} screenOptions={{ headerShown: false }}>
            {user ? (
              <>
                <Stack.Screen
                  name="Day"
                  component={DayViewScreen as any}
                  initialParams={{ date: new Date().toISOString().slice(0, 10) }}
                />
                <Stack.Screen name="Calendar" component={CalendarScreen as any} />
                <Stack.Screen name="SlotForm" component={SlotFormScreen as any} />
              </>
            ) : (
              <Stack.Screen name="Auth" component={AuthScreen as any} />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
