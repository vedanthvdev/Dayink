import 'react-native-reanimated';
import { useEffect, useState } from 'react';
import {
  LibreBaskerville_400Regular,
  LibreBaskerville_700Bold,
} from '@expo-google-fonts/libre-baskerville';
import {
  SourceSans3_400Regular,
  SourceSans3_600SemiBold,
  SourceSans3_700Bold,
} from '@expo-google-fonts/source-sans-3';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { Linking, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BrandedLoader } from './src/components/BrandedLoader';
import type { ShownYearByWordId } from './src/domain/shownYear';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { QuizScreen } from './src/screens/QuizScreen';
import { useIsDark } from './src/theme/useThemeColors';

type AppScreen = 'home' | 'history' | 'quiz';

export default function App() {
  const [fontsLoaded] = useFonts({
    LibreBaskerville_400Regular,
    LibreBaskerville_700Bold,
    SourceSans3_400Regular,
    SourceSans3_600SemiBold,
    SourceSans3_700Bold,
  });
  const isDark = useIsDark();
  const [screen, setScreen] = useState<AppScreen>('home');
  const [shownYearByWordId, setShownYearByWordId] = useState<ShownYearByWordId>({});

  useEffect(() => {
    const goHome = () => setScreen('home');
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

  const onHome = screen === 'home';
  const onHistory = screen === 'history';
  const onQuiz = screen === 'quiz';

  return (
    <SafeAreaProvider>
      {/* Keep Home mounted so overnight refresh and in-memory state survive History/Quiz. */}
      <View
        style={[styles.fill, onHome ? styles.visible : styles.hidden]}
        pointerEvents={onHome ? 'auto' : 'none'}
        accessibilityElementsHidden={!onHome}
        importantForAccessibility={onHome ? 'yes' : 'no-hide-descendants'}
      >
        <HomeScreen
          onShownChange={setShownYearByWordId}
          onOpenHistory={() => setScreen('history')}
          onOpenQuiz={() => setScreen('quiz')}
        />
      </View>
      <View
        style={[styles.fill, onHistory ? styles.visible : styles.hidden]}
        pointerEvents={onHistory ? 'auto' : 'none'}
        accessibilityElementsHidden={!onHistory}
        importantForAccessibility={onHistory ? 'yes' : 'no-hide-descendants'}
      >
        <HistoryScreen
          shownYearByWordId={shownYearByWordId}
          onBack={() => setScreen('home')}
        />
      </View>
      <View
        style={[styles.fill, onQuiz ? styles.visible : styles.hidden]}
        pointerEvents={onQuiz ? 'auto' : 'none'}
        accessibilityElementsHidden={!onQuiz}
        importantForAccessibility={onQuiz ? 'yes' : 'no-hide-descendants'}
      >
        <QuizScreen
          shownYearByWordId={shownYearByWordId}
          isActive={onQuiz}
          onBack={() => setScreen('home')}
        />
      </View>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  fill: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  visible: {
    opacity: 1,
    zIndex: 1,
  },
  hidden: {
    opacity: 0,
    zIndex: 0,
  },
});
