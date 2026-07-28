import { useCallback, useEffect, useRef } from 'react';
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
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BrandedLoader } from './src/components/BrandedLoader';
import { RootNavigator } from './src/navigation/RootNavigator';
import type { RootStackParamList } from './src/navigation/types';
import { ShownYearProvider } from './src/providers/ShownYearProvider';
import { ThemeProvider, useIsDark } from './src/theme';

const navigationRef = createNavigationContainerRef<RootStackParamList>();

function resetToHome() {
  if (!navigationRef.isReady()) return;
  navigationRef.reset({ index: 0, routes: [{ name: 'Home' }] });
}

function AppShell({ fontsLoaded }: { fontsLoaded: boolean }) {
  const isDark = useIsDark();
  const pendingHomeRef = useRef(false);

  const goHome = useCallback(() => {
    if (!navigationRef.isReady()) {
      pendingHomeRef.current = true;
      return;
    }
    pendingHomeRef.current = false;
    resetToHome();
  }, []);

  useEffect(() => {
    const sub = Linking.addEventListener('url', goHome);
    void Linking.getInitialURL().then((url) => {
      if (url) goHome();
    });
    return () => sub.remove();
  }, [goHome]);

  if (!fontsLoaded) {
    return (
      <>
        <BrandedLoader />
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </>
    );
  }

  return (
    <>
      <ShownYearProvider>
        <RootNavigator
          navigationRef={navigationRef}
          onReady={() => {
            if (pendingHomeRef.current) goHome();
          }}
        />
      </ShownYearProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    LibreBaskerville_400Regular,
    LibreBaskerville_700Bold,
    SourceSans3_400Regular,
    SourceSans3_600SemiBold,
    SourceSans3_700Bold,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppShell fontsLoaded={fontsLoaded} />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
