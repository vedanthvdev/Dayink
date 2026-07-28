import { useEffect, useRef, useState } from 'react';
import {
  LibreBaskerville_400Regular,
  LibreBaskerville_700Bold,
} from '@expo-google-fonts/libre-baskerville';
import {
  SourceSans3_400Regular,
  SourceSans3_600SemiBold,
  SourceSans3_700Bold,
} from '@expo-google-fonts/source-sans-3';
import { createNavigationContainerRef } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { Linking } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BrandedLoader } from './src/components/BrandedLoader';
import type { ShownYearByWordId } from './src/domain/shownYear';
import { RootNavigator } from './src/navigation/RootNavigator';
import type { RootStackParamList } from './src/navigation/types';
import { useIsDark } from './src/theme/useThemeColors';

const navigationRef = createNavigationContainerRef<RootStackParamList>();

function resetToHome() {
  if (!navigationRef.isReady()) return;
  navigationRef.reset({ index: 0, routes: [{ name: 'Home' }] });
}

export default function App() {
  const [fontsLoaded] = useFonts({
    LibreBaskerville_400Regular,
    LibreBaskerville_700Bold,
    SourceSans3_400Regular,
    SourceSans3_600SemiBold,
    SourceSans3_700Bold,
  });
  const isDark = useIsDark();
  const [shownYearByWordId, setShownYearByWordId] = useState<ShownYearByWordId>(
    {},
  );
  const pendingHomeRef = useRef(false);

  const goHome = () => {
    if (!navigationRef.isReady()) {
      pendingHomeRef.current = true;
      return;
    }
    pendingHomeRef.current = false;
    resetToHome();
  };

  useEffect(() => {
    const sub = Linking.addEventListener('url', goHome);
    void Linking.getInitialURL().then((url) => {
      if (url) goHome();
    });
    return () => sub.remove();
  }, []);

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <BrandedLoader />
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <RootNavigator
        navigationRef={navigationRef}
        shownYearByWordId={shownYearByWordId}
        onShownChange={setShownYearByWordId}
        onReady={() => {
          if (pendingHomeRef.current) goHome();
        }}
      />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </SafeAreaProvider>
  );
}
