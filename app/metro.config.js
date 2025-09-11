const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add resolver configuration for package aliases
config.resolver.alias = {
  '@project': './src/packages',
  '@project/day-view': './src/packages/day-view',
  '@project/shared': './src/packages/shared',
  '@project/icons': './src/packages/icons',
  '@project/i18n': './src/packages/i18n'
};

// Standard resolver configuration
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Watch additional folders for monorepo
config.watchFolders = [
  path.resolve(__dirname, 'src/packages'),
];

module.exports = config;
