import { Pressable, Text, View } from 'react-native';
import type { QuizChoice } from '../../../domain/quiz';
import { fonts } from '../../../theme/typography';
import { useThemeColors } from '../../../theme/useThemeColors';
import { quizStyles as styles } from '../quizStyles';

/**
 * `interactive` — answerable question.
 * `revealed` — answered question with the outcome shown, presses ignored.
 * `readonly` — past answer in review, not focusable.
 */
type Mode = 'interactive' | 'revealed' | 'readonly';

type Props = {
  choices: QuizChoice[];
  correctIndex: number;
  selectedIndex: number | null;
  mode: Mode;
  onSelect?: (index: number) => void;
};

export function QuizAnswerChoices({
  choices,
  correctIndex,
  selectedIndex,
  mode,
  onSelect,
}: Props) {
  const colors = useThemeColors();
  const showResult = mode !== 'interactive';

  return (
    <View style={styles.choices}>
      {choices.map((choice, index) => {
        const selected = selectedIndex === index;
        const isCorrect = index === correctIndex;
        const emphasize = showResult && (selected || isCorrect);
        let backgroundColor = colors.chipIdle;
        let borderColor = 'transparent';
        if (showResult && isCorrect) {
          backgroundColor = colors.beginnerSoft;
          borderColor = colors.beginner;
        } else if (showResult && selected && !isCorrect) {
          backgroundColor = colors.hardSoft;
          borderColor = colors.hard;
        } else if (selected) {
          backgroundColor = colors.intermediateSoft;
          borderColor = colors.selectedBorder;
        }

        const label = (
          <>
            <Text
              style={[
                styles.answerLabel,
                {
                  color: colors.inkMuted,
                  fontFamily: emphasize ? fonts.bodySemi : fonts.body,
                },
              ]}
            >
              {String.fromCharCode(65 + index)}.
            </Text>
            <Text
              style={[
                styles.answerWord,
                {
                  color: colors.ink,
                  fontFamily: emphasize ? fonts.bodySemi : fonts.body,
                },
              ]}
            >
              {choice.word}
            </Text>
          </>
        );

        if (mode === 'readonly') {
          return (
            <View
              key={`${choice.wordId}-r-${index}`}
              style={[styles.answer, { backgroundColor, borderColor }]}
            >
              {label}
            </View>
          );
        }

        const disabled = mode === 'revealed';
        return (
          <Pressable
            key={`${choice.wordId}-${index}`}
            disabled={disabled}
            onPress={() => onSelect?.(index)}
            style={[styles.answer, { backgroundColor, borderColor }]}
            accessibilityRole="button"
            accessibilityState={{ selected, disabled }}
          >
            {label}
          </Pressable>
        );
      })}
    </View>
  );
}
