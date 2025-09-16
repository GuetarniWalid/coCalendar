module.exports = {
  expo: {
    name: 'coCalendar',
    slug: 'cocalendar',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    splash: {
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.walidg.cocalendar',
      deploymentTarget: '14.0'
    },
    android: {
      package: 'com.walidg.cocalendar',
      adaptiveIcon: {
        backgroundColor: '#ffffff'
      }
    },
    scheme: 'cocalendar',
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_KEY
    },
    plugins: [
      'expo-font',
      'expo-notifications'
    ]
  }
};
