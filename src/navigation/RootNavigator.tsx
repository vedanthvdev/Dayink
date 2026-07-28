import {
  NavigationContainer,
  useNavigation,
  type NavigationContainerRefWithCurrent,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import type { ShownYearByWordId } from '../domain/shownYear';
import { HistoryScreen } from '../screens/HistoryScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { QuizScreen } from '../screens/QuizScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

type Props = {
  navigationRef: NavigationContainerRefWithCurrent<RootStackParamList>;
  shownYearByWordId: ShownYearByWordId;
  onShownChange: (next: ShownYearByWordId) => void;
  onReady?: () => void;
};

function HomeRoute({
  onShownChange,
}: {
  onShownChange: (next: ShownYearByWordId) => void;
}) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <HomeScreen
      onShownChange={onShownChange}
      onOpenHistory={() => navigation.navigate('History')}
      onOpenQuiz={() => navigation.navigate('Quiz')}
    />
  );
}

function HistoryRoute({
  shownYearByWordId,
}: {
  shownYearByWordId: ShownYearByWordId;
}) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <HistoryScreen
      shownYearByWordId={shownYearByWordId}
      onBack={() => navigation.goBack()}
    />
  );
}

function QuizRoute({
  shownYearByWordId,
}: {
  shownYearByWordId: ShownYearByWordId;
}) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <QuizScreen
      shownYearByWordId={shownYearByWordId}
      onBack={() => navigation.goBack()}
    />
  );
}

/**
 * Native stack gives iOS edge-swipe and Android back. Home stays under
 * History/Quiz in the stack, so overnight Home state survives those screens.
 */
export function RootNavigator({
  navigationRef,
  shownYearByWordId,
  onShownChange,
  onReady,
}: Props) {
  return (
    <NavigationContainer ref={navigationRef} onReady={onReady}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
          // iOS 26+ defaults this to true (full-screen back). Keep classic left-edge only.
          fullScreenGestureEnabled: false,
        }}
      >
        <Stack.Screen name="Home">
          {() => <HomeRoute onShownChange={onShownChange} />}
        </Stack.Screen>
        <Stack.Screen name="History">
          {() => <HistoryRoute shownYearByWordId={shownYearByWordId} />}
        </Stack.Screen>
        <Stack.Screen name="Quiz">
          {() => <QuizRoute shownYearByWordId={shownYearByWordId} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
