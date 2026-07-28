import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useThemeColors } from '../../../theme/useThemeColors';
import { quizStyles as styles } from '../quizStyles';

type Props = {
  correct: boolean;
  correctWord: string;
  /** Optional trailing action, e.g. the Next Question button. */
  children?: ReactNode;
};

export function QuizFeedbackMessage({ correct, correctWord, children }: Props) {
  const colors = useThemeColors();

  return (
    <View style={styles.feedbackBox}>
      {correct ? (
        <Text style={[styles.feedbackOk, { color: colors.beginner }]}>
          Congrats! Correct!
        </Text>
      ) : (
        <>
          <Text style={[styles.feedbackBad, { color: colors.hard }]}>
            Oops! That’s not quite right.
          </Text>
          <Text style={[styles.feedbackCorrect, { color: colors.ink }]}>
            The correct answer is: {correctWord}.
          </Text>
        </>
      )}
      {children}
    </View>
  );
}
