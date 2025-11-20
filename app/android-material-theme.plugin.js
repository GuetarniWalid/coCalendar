const {
  withAndroidStyles,
  withAndroidColors,
  withAndroidColorsNight,
  AndroidConfig,
} = require('@expo/config-plugins');

module.exports = function androidMaterialTheme(config) {
  // Step 1: Define light mode colors
  config = withAndroidColors(config, async (config) => {
    const lightColors = {
      colorPrimary: '#943E3B',
      colorOnPrimary: '#FFFFFF',
      colorSurface: '#FFFFFF',
      colorOnSurface: '#3C3B3B',
      colorOnSurfaceVariant: '#3C3B3B',
      colorSurfaceContainerHighest: '#FFF9DE',
      colorSurfaceContainerHigh: '#FFFEFA',
      colorPrimaryContainer: '#D47F69',
      colorOnPrimaryContainer: '#FFFFFF',
      colorTertiaryContainer: '#D47F69',
      colorOnTertiaryContainer: '#FFFFFF',
      colorOutline: '#D47F69',
      colorOnBackground: '#3C3B3B',
    };

    Object.entries(lightColors).forEach(([name, value]) => {
      config.modResults = AndroidConfig.Colors.assignColorValue(
        config.modResults,
        { name, value }
      );
    });

    return config;
  });

  // Step 2: Define dark mode colors
  config = withAndroidColorsNight(config, async (config) => {
    const darkColors = {
      colorPrimary: '#f88e87',
      colorOnPrimary: '#3C3B3B',
      colorSurface: '#1E1E1E',
      colorOnSurface: '#E6E1E5',
      colorOnSurfaceVariant: '#CAC4D0',
      colorSurfaceContainerHighest: '#2E2E2E',
      colorSurfaceContainerHigh: '#272727',
      colorPrimaryContainer: '#5D3F3C',
      colorOnPrimaryContainer: '#FFDAD5',
      colorTertiaryContainer: '#5D3F3C',
      colorOnTertiaryContainer: '#FFDAD5',
      colorOutline: '#938F99',
      colorOnBackground: '#E6E1E5',
    };

    Object.entries(darkColors).forEach(([name, value]) => {
      config.modResults = AndroidConfig.Colors.assignColorValue(
        config.modResults,
        { name, value }
      );
    });

    return config;
  });

  // Step 3: Update styles to use color references
  config = withAndroidStyles(config, async (config) => {
    const styles = config.modResults.resources.style;

    if (!styles) {
      console.warn('No styles found in Android resources');
      return config;
    }

    // Update AppTheme to Material 3
    config.modResults.resources.style = styles.map((style) => {
      if (style['$'] && style['$'].name === 'AppTheme') {
        return {
          ...style,
          $: {
            ...style.$,
            parent: 'Theme.Material3.DayNight.NoActionBar',
          },
          item: [
            ...(style.item || []),
            {
              $: { name: 'materialTimePickerTheme' },
              _: '@style/ThemeOverlay.App.TimePicker',
            },
          ],
        };
      }
      return style;
    });

    // Add custom Material 3 TimePicker theme overlay with color references
    config.modResults.resources.style.push({
      $: {
        name: 'ThemeOverlay.App.TimePicker',
        parent: 'ThemeOverlay.Material3.MaterialTimePicker',
      },
      item: [
        {
          $: { name: 'colorOnSurfaceVariant' },
          _: '@color/colorOnSurfaceVariant',
        },
        {
          $: { name: 'colorOnSurface' },
          _: '@color/colorOnSurface',
        },
        {
          $: { name: 'colorSurfaceContainerHighest' },
          _: '@color/colorSurfaceContainerHighest',
        },
        {
          $: { name: 'colorTertiaryContainer' },
          _: '@color/colorTertiaryContainer',
        },
        {
          $: { name: 'colorOnTertiaryContainer' },
          _: '@color/colorOnTertiaryContainer',
        },
        {
          $: { name: 'colorSurfaceContainerHigh' },
          _: '@color/colorSurfaceContainerHigh',
        },
        {
          $: { name: 'colorOutline' },
          _: '@color/colorOutline',
        },
        {
          $: { name: 'colorPrimary' },
          _: '@color/colorPrimary',
        },
        {
          $: { name: 'colorOnPrimary' },
          _: '@color/colorOnPrimary',
        },
        {
          $: { name: 'colorOnPrimaryContainer' },
          _: '@color/colorOnPrimaryContainer',
        },
        {
          $: { name: 'colorPrimaryContainer' },
          _: '@color/colorPrimaryContainer',
        },
        {
          $: { name: 'colorSurface' },
          _: '@color/colorSurface',
        },
        {
          $: { name: 'colorOnBackground' },
          _: '@color/colorOnBackground',
        },
      ],
    });

    return config;
  });

  return config;
};
