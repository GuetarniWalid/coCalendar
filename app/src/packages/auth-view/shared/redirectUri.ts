import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

/**
 * Get the app scheme from configuration with fallback
 */
const getAppScheme = (): string => {
  const scheme = Constants.expoConfig?.scheme;
  
  if (typeof scheme === 'string' && scheme.length > 0) {
    return scheme;
  }
  
  // Fallback to default scheme
  return 'cocalendar';
};

/**
 * Generate the appropriate redirect URI for OAuth based on environment
 * @throws {Error} If unable to generate redirect URI
 */
export const getRedirectUri = (): string => {
  try {
    const scheme = getAppScheme();

    if (__DEV__) {
      // In development (Expo Go), let expo-linking generate the correct dev URL
      // Example: exp://127.0.0.1:19000/--/auth/callback
      const devUrl = Linking.createURL('auth/callback');
      
      if (!devUrl) {
        throw new Error('Failed to generate development redirect URI');
      }
      
      return devUrl;
    } else {
      // In production, use the app scheme
      return `${scheme}://auth/callback`;
    }
  } catch (error) {
    console.error('Error generating redirect URI:', error);
    // Fallback to a safe default
    return 'cocalendar://auth/callback';
  }
};

/**
 * Get the scheme from app config (exported for testing)
 */
export { getAppScheme };
