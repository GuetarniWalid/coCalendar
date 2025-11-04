import createStore from 'teaful';
import { User, SupabaseClient, createClient } from '@supabase/supabase-js';

// Validate environment variables
const validateEnvironment = () => {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Missing Supabase environment variables');
    return null;
  }

  return { supabaseUrl, supabaseKey };
};

// Lazily-initialized Supabase client
let supabaseClient: SupabaseClient | null = null;

// Initial auth state - start with loading true until init completes
const initialAuthState = {
  user: null as User | null,
  loading: true,
  supabase: null as SupabaseClient | null,
  envReady: false as boolean,
  onboardingCompleted: false as boolean,
  checkingOnboarding: true as boolean,
};

// Create the auth store using correct Teaful pattern
export const { useStore: useAuthStore, getStore: getAuthStore } =
  createStore(initialAuthState);

// Global setters for auth state updates
let globalUserSetter: ((user: User | null) => void) | null = null;
let globalLoadingSetter: ((loading: boolean) => void) | null = null;

// Function to register global setters (called from components)
export const registerAuthSetters = (
  userSetter: (user: User | null) => void,
  loadingSetter: (loading: boolean) => void
) => {
  globalUserSetter = userSetter;
  globalLoadingSetter = loadingSetter;
};

// Helper to update store using the same direct-mutation pattern as before
const setAuthState = (partial: Partial<typeof initialAuthState>) => {
  const store = getAuthStore();
  Object.assign(store[0], partial);
};

// Public initializer to create client after env is loaded
export const initializeAuthClient = () => {
  if (supabaseClient) {
    return supabaseClient;
  }

  const envVars = validateEnvironment();
  if (!envVars) {
    // Env not ready; defer
    setAuthState({ loading: false, envReady: false });
    return null;
  }

  try {
    const { supabaseUrl, supabaseKey } = envVars;
    // Create Supabase client
    supabaseClient = createClient(supabaseUrl, supabaseKey);
    setAuthState({ supabase: supabaseClient, envReady: true });

    // Initialize current session on app start
    supabaseClient.auth
      .getSession()
      .then(({ data }) => {
        setAuthState({ user: data.session?.user ?? null, loading: false });
      })
      .catch(() => {
        setAuthState({ loading: false });
      });

    // Subscribe to auth changes
    supabaseClient.auth.onAuthStateChange((_event, session) => {
      setAuthState({ user: session?.user || null, loading: false });
      if (globalUserSetter) {
        globalUserSetter(session?.user || null);
      }
      if (globalLoadingSetter) {
        globalLoadingSetter(false);
      }
    });

    return supabaseClient;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    setAuthState({ loading: false, envReady: true });
    return null;
  }
};

// Auth methods
export const signIn = async (email: string, password: string) => {
  const store = getAuthStore();
  if (!store[0].supabase) {
    console.error('Supabase client not initialized');
    return;
  }

  // Set loading to true
  setAuthState({ loading: true });

  try {
    const { data, error } = await store[0].supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    // Update user state
    setAuthState({ user: data.user, loading: false });
  } catch (error) {
    setAuthState({ loading: false });
    throw error;
  }
};

export const signUp = async (email: string, password: string) => {
  const store = getAuthStore();
  if (!store[0].supabase) {
    console.error('Supabase client not initialized');
    return;
  }

  // Set loading to true
  setAuthState({ loading: true });

  try {
    const { data, error } = await store[0].supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;

    // Update user state
    setAuthState({ user: data.user, loading: false });
  } catch (error) {
    setAuthState({ loading: false });
    throw error;
  }
};

export const signOut = async () => {
  const store = getAuthStore();
  if (!store[0].supabase) {
    console.error('Supabase client not initialized');
    return;
  }

  try {
    const { error } = await store[0].supabase.auth.signOut();
    if (error) throw error;

    // Clear user state and reset onboarding
    setAuthState({ user: null, onboardingCompleted: false });
  } catch (error) {
    throw error;
  }
};

// Check if user has completed onboarding
export const checkOnboardingStatus = async () => {
  const store = getAuthStore();
  if (!store[0].supabase || !store[0].user) {
    setAuthState({ checkingOnboarding: false, onboardingCompleted: false });
    return false;
  }

  try {
    const { data, error } = await store[0].supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', store[0].user.id)
      .single();

    if (error) throw error;

    const completed = data?.onboarding_completed ?? false;
    setAuthState({ onboardingCompleted: completed, checkingOnboarding: false });
    return completed;
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    setAuthState({ checkingOnboarding: false, onboardingCompleted: false });
    return false;
  }
};

// Mark onboarding as completed
export const completeOnboarding = async () => {
  const store = getAuthStore();
  if (!store[0].supabase || !store[0].user) {
    console.error('Cannot complete onboarding: user not authenticated');
    return false;
  }

  try {
    const { error } = await store[0].supabase
      .from('profiles')
      .update({
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      })
      .eq('id', store[0].user.id);

    if (error) throw error;

    setAuthState({ onboardingCompleted: true });
    return true;
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return false;
  }
};
