import { Pressable, Text, View } from 'react-native';
import type { QuizAnswerRecord } from '../../../domain/quiz';
import { useThemeColors } from '../../../theme/useThemeColors';
import { quizStyles as styles } from '../quizStyles';
import type { ReviewReturnPhase } from '../types';
import { QuizAnswerChoices } from './QuizAnswerChoices';
import { QuizFeedbackMessage } from './QuizFeedbackMessage';

type Props = {
  answers: QuizAnswerRecord[];
  reviewIndex: number;
  reviewReturnPhase: ReviewReturnPhase;
  onCloseReview: () => void;
  onShowPreviousAnswer: () => void;
  onShowNextAnswer: () => void;
  onAbandonQuiz: () => void;
};

export function QuizReviewView({
  answers,
  reviewIndex,
  reviewReturnPhase,
  onCloseReview,
  onShowPreviousAnswer,
  onShowNextAnswer,
  onAbandonQuiz,
}: Props) {
  const colors = useThemeColors();
  const row = answers[reviewIndex];

  return (
    <>
      <View style={styles.progressRow}>
        <Pressable
          onPress={onCloseReview}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back to quiz"
        >
          <Text style={[styles.link, { color: colors.inkMuted }]}>← Back</Text>
        </Pressable>
        {reviewReturnPhase !== 'results' && reviewReturnPhase !== 'home' ? (
          <Pressable
            onPress={onAbandonQuiz}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Abandon quiz"
          >
            <Text style={[styles.link, { color: colors.inkMuted }]}>Abandon</Text>
          </Pressable>
        ) : null}
      </View>

      {answers.length === 0 || !row ? (
        <Text style={[styles.subtitle, { color: colors.inkMuted }]}>
          No answered questions yet.
        </Text>
      ) : (
        <>
          <Text style={[styles.progress, { color: colors.inkMuted, marginBottom: 14 }]}>
            Answer {reviewIndex + 1} of {answers.length}
          </Text>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.surfaceBorder,
              },
            ]}
          >
            <Text style={[styles.definition, { color: colors.ink }]}>
              {row.question.correct.oneLiner}
            </Text>
            <QuizAnswerChoices
              choices={row.question.choices}
              correctIndex={row.question.correctIndex}
              selectedIndex={row.selectedIndex}
              mode="readonly"
            />
            <QuizFeedbackMessage
              correct={row.correct}
              correctWord={row.question.correct.word}
            />
          </View>

          <View style={styles.reviewNav}>
            <Pressable
              disabled={reviewIndex <= 0}
              onPress={onShowPreviousAnswer}
              style={[
                styles.reviewNavButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.surfaceBorder,
                  opacity: reviewIndex <= 0 ? 0.4 : 1,
                },
              ]}
              accessibilityRole="button"
            >
              <Text style={[styles.secondaryButtonText, { color: colors.ink }]}>
                ← Previous
              </Text>
            </Pressable>
            <Pressable
              disabled={reviewIndex >= answers.length - 1}
              onPress={onShowNextAnswer}
              style={[
                styles.reviewNavButton,
                {
                  backgroundColor: colors.ink,
                  borderColor: colors.ink,
                  opacity: reviewIndex >= answers.length - 1 ? 0.4 : 1,
                },
              ]}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.secondaryButtonText,
                  {
                    color:
                      reviewIndex >= answers.length - 1
                        ? colors.inkMuted
                        : colors.background,
                  },
                ]}
              >
                Next →
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </>
  );
}
