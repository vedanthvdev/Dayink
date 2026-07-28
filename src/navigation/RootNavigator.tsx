import {
  NavigationContainer,
  useNavigation,
  type NavigationContainerRefWithCurrent,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { HistoryScreen } from '../features/history';
import { HomeScreen } from '../features/home';
import { QuizScreen } from '../features/quiz';
import { useShownYear } from '../providers/ShownYearProvider';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

type Props = {
  navigationRef: NavigationContainerRefWithCurrent<RootStackParamList>;
  onReady?: () => void;
};

function HomeRoute() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setShownYearByWordId } = useShownYear();
  return (
    <HomeScreen
      onShownChange={setShownYearByWordId}
      onOpenHistory={() => navigation.navigate('History')}
      onOpenQuiz={() => navigation.navigate('Quiz')}
    />
  );
}

function HistoryRoute() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { shownYearByWordId } = useShownYear();
  return (
    <HistoryScreen
      shownYearByWordId={shownYearByWordId}
      onBack={() => navigation.goBack()}
    />
  );
}

function QuizRoute() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { shownYearByWordId } = useShownYear();
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
export function RootNavigator({ navigationRef, onReady }: Props) {
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
        <Stack.Screen name="Home" component={HomeRoute} />
        <Stack.Screen name="History" component={HistoryRoute} />
        <Stack.Screen name="Quiz" component={QuizRoute} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
