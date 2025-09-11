import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import { useAuthStore, signIn, signUp } from '@project/shared';
import { getRedirectUri } from '../shared/redirectUri';

export default function AuthScreen() {
  const [supabase] = useAuthStore.supabase();
  const [envReady] = useAuthStore.envReady();
  // We don't need the user value here; rely on Supabase session callbacks
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Loading state while env is loading or client being created
  if (!envReady && !supabase) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" />
          <Text style={[styles.subtitle, { marginTop: 16 }]}>Preparing app...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show configuration message only if env is ready but client was not created
  if (envReady && !supabase) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>coCalendar</Text>
          <Text style={styles.subtitle}>Configuration Required</Text>
          <View style={styles.form}>
            <Text style={styles.configMessage}>
              Supabase environment variables are not configured.{'\n\n'}
              Please create a .env file with:{'\n\n'}
              EXPO_PUBLIC_SUPABASE_URL=your_supabase_url{'\n'}
              EXPO_PUBLIC_SUPABASE_KEY=your_supabase_key
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Handle OAuth callback when user returns from browser
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      // Check if this is an OAuth callback
      if (url.includes('access_token') || url.includes('error') || url.includes('code=')) {
        try {
          // If URL contains access_token, we need to handle it differently
          if (url.includes('access_token')) {
            // Extract the access token and create a session manually
            const urlObj = new URL(url);
            const accessToken = urlObj.hash.split('access_token=')[1]?.split('&')[0];
            
            if (!accessToken) {
              throw new Error('No access token found in callback URL');
            }
            
            // Set the session manually
            const { error } = await (supabase as any).auth.setSession({
              access_token: accessToken,
              refresh_token: urlObj.hash.split('refresh_token=')[1]?.split('&')[0] || '',
            });
            
            if (error) {
              console.error('Error setting session:', error);
              Alert.alert('Authentication Error', 'Failed to complete authentication. Please try again.');
            }
          } else {
            // Use exchangeCodeForSession for authorization code flow
            const { error } = await (supabase as any).auth.exchangeCodeForSession(url);
            if (error) {
              console.error('Error exchanging code for session:', error);
              Alert.alert('Authentication Error', 'Failed to complete authentication. Please try again.');
            }
          }
        } catch (error) {
          console.error('Error in OAuth callback handling:', error);
          Alert.alert('Authentication Error', 'An unexpected error occurred during authentication.');
        }
      }
    };

    // Listen for deep links
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription?.remove();
    };
  }, [supabase]);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!supabase) {
      Alert.alert('Error', 'Authentication service not available. Please try again.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        Alert.alert('Success', 'Account created! Please check your email to verify your account.');
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!supabase) {
      Alert.alert('Error', 'Authentication service not available. Please try again.');
      return;
    }

    setGoogleLoading(true);
    try {
      // Clear any existing session first
      await (supabase as any).auth.signOut();
      
      // Use dynamic redirect URI for development
      const redirectUri = getRedirectUri();
      
      const { data, error } = await (supabase as any).auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false,
        },
      });
      
      if (error) throw error;
      
      if (data?.url) {
        // Open Google OAuth directly
        try {
          await Linking.openURL(data.url);
        } catch (linkError) {
          console.error('Error opening URL:', linkError);
          Alert.alert('Error', 'Could not open Google sign-in page');
        }
      }
      
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>coCalendar</Text>
        <Text style={styles.subtitle}>
          {isSignUp ? 'Create an account' : 'Sign in to continue'}
        </Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[styles.googleButton, googleLoading && styles.buttonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator color="#333" />
            ) : (
              <>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsSignUp(!isSignUp)}
          >
            <Text style={styles.switchText}>
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#666',
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4285F4',
    marginRight: 10,
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  switchButton: {
    alignItems: 'center',
  },
  switchText: {
    color: '#007AFF',
    fontSize: 14,
  },
  configMessage: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
