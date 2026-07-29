import type { ExpoConfig, ConfigContext } from 'expo/config';

/**
 * Apple Team ID (Membership details on developer.apple.com).
 * Override with EXPO_APPLE_TEAM_ID / APPLE_TEAM_ID if needed.
 */
const appleTeamId =
  process.env.EXPO_APPLE_TEAM_ID || process.env.APPLE_TEAM_ID || '5365T47XWN';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Dayink',
  slug: 'dayink',
  owner: 'chintuvedanth',
  version: '3.2.2',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  scheme: 'dayink',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.dayink.app',
    appleTeamId,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
    entitlements: {
      'com.apple.security.application-groups': ['group.com.dayink.app'],
    },
  },
  android: {
    package: 'com.dayink.app',
    adaptiveIcon: {
      backgroundColor: '#1A2620',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-font',
    [
      'expo-audio',
      {
        microphonePermission: false,
        recordAudioAndroid: false,
        enableBackgroundPlayback: false,
        enableBackgroundRecording: false,
      },
    ],
    'expo-asset',
    '@bacons/apple-targets',
    // iOS 27 SDK requires UIScene lifecycle or the app traps at launch.
    './plugins/withIosSceneLifecycle.js',
    './plugins/withAndroidComposeCompiler.js',
  ],
  extra: {
    splashBackground: '#F7F3EA',
    eas: {
      projectId: '7d212128-d3cb-4dc5-8e49-c2859c0a3179',
    },
  },
});
