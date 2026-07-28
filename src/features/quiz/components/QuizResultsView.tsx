import { Pressable, Text, View } from 'react-native';
import { scoreSession, type QuizAnswerRecord, type QuizType } from '../../../domain/quiz';
import type { Level } from '../../../domain/types';
import { useThemeColors } from '../../../theme/useThemeColors';
import { LEVEL_LABEL, TYPE_LABEL } from '../quizLabels';
import { quizStyles as styles } from '../quizStyles';
import type { ReviewReturnPhase } from '../types';

type Props = {
  answers: QuizAnswerRecord[];
  quizType: QuizType | null;
  level: Level | null;
  remaining: number;
  onOpenReview: (from: ReviewReturnPhase) => void;
  onResetToHome: () => void;
  onLeaveToAppHome: () => void;
};

export function QuizResultsView({
  answers,
  quizType,
  level,
  remaining,
  onOpenReview,
  onResetToHome,
  onLeaveToAppHome,
}: Props) {
  const colors = useThemeColors();
  const scored = scoreSession(answers);

  return (
    <>
      <Text style={[styles.title, { color: colors.ink }]}>Quiz Complete!</Text>
      <View
        style={[
          styles.reportCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.surfaceBorder,
          },
        ]}
      >
        <View style={styles.reportBlock}>
          <Text style={[styles.reportLabel, { color: colors.inkMuted }]}>Score</Text>
          <Text style={[styles.reportScore, { color: colors.ink }]}>
            {scored.correct}/{scored.total}
          </Text>
        </View>
        <View style={styles.reportBlock}>
          <Text style={[styles.reportLabel, { color: colors.inkMuted }]}>Accuracy</Text>
          <Text style={[styles.reportValue, { color: colors.beginner }]}>
            {scored.percent}% correct
          </Text>
        </View>
        <View style={styles.reportSplit}>
          <View style={styles.reportHalf}>
            <Text style={[styles.reportLabel, { color: colors.inkMuted }]}>Correct</Text>
            <Text style={[styles.reportValue, { color: colors.ink }]}>
              {scored.correct}
            </Text>
          </View>
          <View style={styles.reportHalf}>
            <Text style={[styles.reportLabel, { color: colors.inkMuted }]}>
              Incorrect
            </Text>
            <Text style={[styles.reportValue, { color: colors.ink }]}>
              {scored.incorrect}
            </Text>
          </View>
        </View>
        {quizType && level ? (
          <>
            <View style={styles.reportBlock}>
              <Text style={[styles.reportLabel, { color: colors.inkMuted }]}>
                Difficulty
              </Text>
              <Text style={[styles.reportValue, { color: colors.ink }]}>
                {LEVEL_LABEL[level]}
              </Text>
            </View>
            <View style={styles.reportBlock}>
              <Text style={[styles.reportLabel, { color: colors.inkMuted }]}>
                Quiz type
              </Text>
              <Text style={[styles.reportValue, { color: colors.ink }]}>
                {TYPE_LABEL[quizType]}
              </Text>
            </View>
          </>
        ) : null}
        {remaining <= 0 ? (
          <Text style={[styles.reportNote, { color: colors.inkMuted }]}>
            Come back tomorrow for a new set.
          </Text>
        ) : (
          <Text style={[styles.reportNote, { color: colors.inkMuted }]}>
            {remaining} question{remaining === 1 ? '' : 's'} remaining today
          </Text>
        )}
      </View>

      <Pressable
        onPress={() => onOpenReview('results')}
        disabled={answers.length === 0}
        style={[
          styles.primaryButton,
          {
            backgroundColor: colors.ink,
            opacity: answers.length === 0 ? 0.4 : 1,
          },
        ]}
      >
        <Text style={[styles.primaryButtonText, { color: colors.background }]}>
          Review Answers
        </Text>
      </Pressable>
      {remaining > 0 ? (
        <Pressable
          onPress={onResetToHome}
          style={[styles.secondaryButton, { marginTop: 16 }]}
          accessibilityRole="button"
        >
          <Text style={[styles.secondaryButtonText, { color: colors.ink }]}>
            Back to Quiz
          </Text>
        </Pressable>
      ) : null}
      <Pressable
        onPress={onLeaveToAppHome}
        style={[styles.secondaryButton, { marginTop: remaining > 0 ? 8 : 16 }]}
        accessibilityRole="button"
        accessibilityLabel="Return to home page"
      >
        <Text style={[styles.secondaryButtonText, { color: colors.ink }]}>
          Return to home page
        </Text>
      </Pressable>
    </>
  );
}
