import { Pressable, Text, View } from 'react-native';
import { QUIZ_DAILY_LIMIT, type QuizQuestion } from '../../../domain/quiz';
import { useThemeColors } from '../../../theme/useThemeColors';
import { quizStyles as styles } from '../quizStyles';
import type { ActivePhase, ReviewReturnPhase } from '../types';
import { QuizAnswerChoices } from './QuizAnswerChoices';
import { QuizFeedbackMessage } from './QuizFeedbackMessage';

type Props = {
  phase: ActivePhase;
  question: QuizQuestion | null;
  selectedIndex: number | null;
  answeredCount: number;
  dailyQuestionLabel: number;
  remaining: number;
  onSelectChoice: (index: number) => void;
  onNextAfterFeedback: () => void;
  onOpenReview: (from: ReviewReturnPhase) => void;
  onAbandonQuiz: () => void;
};

export function QuizPlayingView({
  phase,
  question,
  selectedIndex,
  answeredCount,
  dailyQuestionLabel,
  remaining,
  onSelectChoice,
  onNextAfterFeedback,
  onOpenReview,
  onAbandonQuiz,
}: Props) {
  const colors = useThemeColors();

  return (
    <>
      <View style={styles.progressRow}>
        <Pressable
          onPress={onAbandonQuiz}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Abandon quiz"
        >
          <Text style={[styles.link, { color: colors.inkMuted }]}>Abandon</Text>
        </Pressable>
        {answeredCount > 0 ? (
          <Pressable
            onPress={() => onOpenReview(phase === 'feedback' ? 'feedback' : 'playing')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Review answers"
          >
            <Text style={[styles.link, { color: colors.ink }]}>Review</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={[styles.progress, { color: colors.inkMuted, marginBottom: 14 }]}>
        Question {Math.min(dailyQuestionLabel, QUIZ_DAILY_LIMIT)} of {QUIZ_DAILY_LIMIT}
        {' · '}
        {remaining} question{remaining === 1 ? '' : 's'} remaining today
      </Text>

      {question ? (
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.surfaceBorder },
          ]}
        >
          <Text style={[styles.definition, { color: colors.ink }]}>
            {question.correct.oneLiner}
          </Text>
          <QuizAnswerChoices
            choices={question.choices}
            correctIndex={question.correctIndex}
            selectedIndex={selectedIndex}
            mode={phase === 'feedback' ? 'revealed' : 'interactive'}
            onSelect={onSelectChoice}
          />

          {phase === 'feedback' && selectedIndex !== null ? (
            <QuizFeedbackMessage
              correct={selectedIndex === question.correctIndex}
              correctWord={question.correct.word}
            >
              <Pressable
                onPress={onNextAfterFeedback}
                style={[styles.primaryButton, { backgroundColor: colors.ink }]}
                accessibilityRole="button"
              >
                <Text style={[styles.primaryButtonText, { color: colors.background }]}>
                  {remaining <= 0 ? 'See results' : 'Next Question →'}
                </Text>
              </Pressable>
            </QuizFeedbackMessage>
          ) : null}
        </View>
      ) : null}
    </>
  );
}
