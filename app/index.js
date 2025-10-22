import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import App from './App';
import {
  initializeAuthClient,
  prefetchAvatars,
  buildAvatarUrls,
  COMMON_FEMALE_HOME_DAILY_LIFE,
} from '@project/shared';

// Initialize Supabase before rendering the app to ensure env vars are applied
initializeAuthClient();

// Warm avatar cache in background (non-blocking)
try {
  const urls = buildAvatarUrls(COMMON_FEMALE_HOME_DAILY_LIFE);
  prefetchAvatars(urls).catch(() => {});
} catch (e) {
  // No-op if env is not ready or list is invalid
}

registerRootComponent(App);
