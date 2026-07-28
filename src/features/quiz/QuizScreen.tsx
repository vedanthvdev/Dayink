import { ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ShownYearByWordId } from '../../domain/shownYear';
import { useThemeColors } from '../../theme/useThemeColors';
import { QuizHomeView } from './components/QuizHomeView';
import { QuizPlayingView } from './components/QuizPlayingView';
import { QuizResultsView } from './components/QuizResultsView';
import { QuizReviewView } from './components/QuizReviewView';
import { quizStyles as styles } from './quizStyles';
import { useQuizSession } from './useQuizSession';

type Props = {
  shownYearByWordId: ShownYearByWordId;
  onBack: () => void;
};

export function QuizScreen({ shownYearByWordId, onBack }: Props) {
  const colors = useThemeColors();
  const session = useQuizSession({ shownYearByWordId, onBack });

  if (session.loading) {
    return (
      <LinearGradient colors={colors.gradient} style={styles.gradient}>
        <SafeAreaView style={[styles.safe, styles.centered]}>
          <ActivityIndicator color={colors.ink} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={colors.gradient}
      start={{ x: 0.05, y: 0 }}
      end={{ x: 0.95, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.inner}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {session.phase === 'home' ? (
            <QuizHomeView
              quizLockedForToday={session.quizLockedForToday}
              dayReport={session.dayReport}
              paused={session.paused}
              quizType={session.quizType}
              level={session.level}
              seenError={session.seenError}
              remaining={session.remaining}
              answeredToday={session.answeredToday}
              liveScore={session.liveScore}
              onSelectQuizType={session.selectQuizType}
              onSelectLevel={session.selectLevel}
              onStart={() => void session.onStart()}
              onContinuePaused={session.onContinuePaused}
              onDiscardPaused={() => void session.discardPaused()}
              onOpenReview={session.openReview}
              onLeaveToAppHome={session.leaveToAppHome}
            />
          ) : null}

          {session.phase === 'playing' || session.phase === 'feedback' ? (
            <QuizPlayingView
              phase={session.phase}
              question={session.question}
              selectedIndex={session.selectedIndex}
              answeredCount={session.answers.length}
              dailyQuestionLabel={session.dailyQuestionLabel}
              remaining={session.remaining}
              onSelectChoice={(index) => void session.onSelectChoice(index)}
              onNextAfterFeedback={session.onNextAfterFeedback}
              onOpenReview={session.openReview}
              onAbandonQuiz={() => void session.onAbandonQuiz()}
            />
          ) : null}

          {session.phase === 'review' ? (
            <QuizReviewView
              answers={session.answers}
              reviewIndex={session.reviewIndex}
              reviewReturnPhase={session.reviewReturnPhase}
              onCloseReview={session.closeReview}
              onShowPreviousAnswer={session.showPreviousAnswer}
              onShowNextAnswer={session.showNextAnswer}
              onAbandonQuiz={() => void session.onAbandonQuiz()}
            />
          ) : null}

          {session.phase === 'results' ? (
            <QuizResultsView
              answers={session.answers}
              quizType={session.quizType}
              level={session.level}
              remaining={session.remaining}
              onOpenReview={session.openReview}
              onResetToHome={session.resetToHome}
              onLeaveToAppHome={session.leaveToAppHome}
            />
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
