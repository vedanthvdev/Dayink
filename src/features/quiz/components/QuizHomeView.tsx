import { Pressable, Text, View } from 'react-native';
import {
  QUIZ_DAILY_LIMIT,
  scoreSession,
  type QuizAnswerRecord,
  type QuizDayReport,
  type QuizPausedSession,
  type QuizType,
} from '../../../domain/quiz';
import type { Level } from '../../../domain/types';
import { useThemeColors } from '../../../theme/useThemeColors';
import { LEVELS, LEVEL_LABEL, TYPE_LABEL } from '../quizLabels';
import { quizStyles as styles } from '../quizStyles';
import type { ReviewReturnPhase } from '../types';

type Props = {
  quizLockedForToday: boolean;
  dayReport: QuizDayReport | null;
  paused: QuizPausedSession | null;
  quizType: QuizType | null;
  level: Level | null;
  seenError: string | null;
  remaining: number;
  answeredToday: number;
  liveScore: ReturnType<typeof scoreSession> | null;
  onSelectQuizType: (type: QuizType) => void;
  onSelectLevel: (level: Level) => void;
  onStart: () => void;
  onContinuePaused: () => void;
  onDiscardPaused: () => void;
  onOpenReview: (from: ReviewReturnPhase, reviewAnswers?: QuizAnswerRecord[]) => void;
  onLeaveToAppHome: () => void;
};

export function QuizHomeView({
  quizLockedForToday,
  dayReport,
  paused,
  quizType,
  level,
  seenError,
  remaining,
  answeredToday,
  liveScore,
  onSelectQuizType,
  onSelectLevel,
  onStart,
  onContinuePaused,
  onDiscardPaused,
  onOpenReview,
  onLeaveToAppHome,
}: Props) {
  const colors = useThemeColors();

  return (
    <>
      <Pressable
        onPress={onLeaveToAppHome}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Back to home"
      >
        <Text style={[styles.back, { color: colors.inkMuted }]}>← Back</Text>
      </Pressable>
      <Text style={[styles.title, { color: colors.ink }]}>Quiz</Text>

      {quizLockedForToday ? (
        <>
          <Text style={[styles.subtitle, { color: colors.inkMuted }]}>
            Here’s how you did today.
          </Text>
          <View
            style={[
              styles.reportCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.surfaceBorder,
              },
            ]}
          >
            <Text style={[styles.reportEyebrow, { color: colors.beginner }]}>
              Today’s report card
            </Text>

            <View style={styles.reportBlock}>
              <Text style={[styles.reportLabel, { color: colors.inkMuted }]}>
                Score
              </Text>
              <Text style={[styles.reportScore, { color: colors.ink }]}>
                {dayReport
                  ? `${dayReport.correct}/${dayReport.total}`
                  : `${answeredToday}/${QUIZ_DAILY_LIMIT}`}
              </Text>
            </View>

            {dayReport ? (
              <>
                <View style={styles.reportBlock}>
                  <Text style={[styles.reportLabel, { color: colors.inkMuted }]}>
                    Accuracy
                  </Text>
                  <Text style={[styles.reportValue, { color: colors.beginner }]}>
                    {dayReport.percent}% correct
                  </Text>
                </View>

                <View style={styles.reportSplit}>
                  <View style={styles.reportHalf}>
                    <Text style={[styles.reportLabel, { color: colors.inkMuted }]}>
                      Correct
                    </Text>
                    <Text style={[styles.reportValue, { color: colors.ink }]}>
                      {dayReport.correct}
                    </Text>
                  </View>
                  <View style={styles.reportHalf}>
                    <Text style={[styles.reportLabel, { color: colors.inkMuted }]}>
                      Incorrect
                    </Text>
                    <Text style={[styles.reportValue, { color: colors.ink }]}>
                      {dayReport.incorrect}
                    </Text>
                  </View>
                </View>

                <View style={styles.reportBlock}>
                  <Text style={[styles.reportLabel, { color: colors.inkMuted }]}>
                    Difficulty
                  </Text>
                  <Text style={[styles.reportValue, { color: colors.ink }]}>
                    {LEVEL_LABEL[dayReport.level]}
                  </Text>
                </View>

                <View style={styles.reportBlock}>
                  <Text style={[styles.reportLabel, { color: colors.inkMuted }]}>
                    Quiz type
                  </Text>
                  <Text style={[styles.reportValue, { color: colors.ink }]}>
                    {TYPE_LABEL[dayReport.quizType]}
                  </Text>
                </View>
              </>
            ) : null}

            <Text style={[styles.reportNote, { color: colors.inkMuted }]}>
              Come back tomorrow for a new set.
            </Text>
          </View>
          <Pressable
            onPress={() => {
              if (dayReport?.answers.length) {
                onOpenReview('home', dayReport.answers);
              }
            }}
            disabled={!dayReport?.answers.length}
            style={[
              styles.primaryButton,
              {
                backgroundColor: colors.ink,
                opacity: dayReport?.answers.length ? 1 : 0.4,
              },
            ]}
            accessibilityRole="button"
          >
            <Text style={[styles.primaryButtonText, { color: colors.background }]}>
              Review Answers
            </Text>
          </Pressable>
          <Pressable
            onPress={onLeaveToAppHome}
            style={[styles.secondaryButton, { marginTop: 16 }]}
            accessibilityRole="button"
          >
            <Text style={[styles.secondaryButtonText, { color: colors.ink }]}>
              Return to home page
            </Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={[styles.subtitle, { color: colors.inkMuted }]}>
            Test words you’ve seen, or try a random challenge.
          </Text>

          <View
            style={[
              styles.meter,
              {
                backgroundColor: colors.surface,
                borderColor: colors.surfaceBorder,
              },
            ]}
          >
            <Text style={[styles.meterTitle, { color: colors.ink }]}>
              Daily Quiz: {QUIZ_DAILY_LIMIT} questions available
            </Text>
            <Text style={[styles.meterBody, { color: colors.inkMuted }]}>
              You’ve completed: {answeredToday}/{QUIZ_DAILY_LIMIT}
            </Text>
            <Text style={[styles.meterStrong, { color: colors.ink }]}>
              {remaining} question{remaining === 1 ? '' : 's'} remaining today
            </Text>
            {liveScore ? (
              <Text style={[styles.meterStrong, { color: colors.beginner, marginTop: 10 }]}>
                Today’s score: {liveScore.correct}/{liveScore.total} (
                {liveScore.percent}%)
              </Text>
            ) : (
              <Text style={[styles.meterBody, { color: colors.inkMuted, marginTop: 8 }]}>
                Today’s score will appear here as you play.
              </Text>
            )}
          </View>

          {paused ? (
            <View
              style={[
                styles.pausedCard,
                {
                  backgroundColor: colors.beginnerSoft,
                  borderColor: colors.beginner,
                },
              ]}
            >
              <Text style={[styles.meterTitle, { color: colors.ink }]}>
                Quiz in progress
              </Text>
              <Text style={[styles.meterBody, { color: colors.inkMuted }]}>
                {TYPE_LABEL[paused.quizType]} · {LEVEL_LABEL[paused.level]} ·{' '}
                {paused.answers.length} answered
              </Text>
              <Pressable
                onPress={onContinuePaused}
                style={[
                  styles.primaryButton,
                  { backgroundColor: colors.ink, marginTop: 14 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Continue quiz where you left off"
              >
                <Text style={[styles.primaryButtonText, { color: colors.background }]}>
                  Continue where you left off
                </Text>
              </Pressable>
              <Pressable
                onPress={onDiscardPaused}
                style={[styles.secondaryButton, { marginTop: 4 }]}
                accessibilityRole="button"
              >
                <Text style={[styles.secondaryButtonText, { color: colors.ink }]}>
                  Discard and start over
                </Text>
              </Pressable>
            </View>
          ) : null}

          <Text style={[styles.sectionLabel, { color: colors.inkMuted }]}>
            Step 1 · Quiz type
          </Text>
          <View style={styles.rowGap}>
            {(['seen', 'random'] as QuizType[]).map((type) => {
              const selected = quizType === type;
              return (
                <Pressable
                  key={type}
                  onPress={() => onSelectQuizType(type)}
                  style={[
                    styles.choiceCard,
                    {
                      backgroundColor: selected
                        ? colors.beginnerSoft
                        : colors.surface,
                      borderColor: selected
                        ? colors.selectedBorder
                        : colors.surfaceBorder,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Text style={[styles.choiceTitle, { color: colors.ink }]}>
                    {type === 'seen' ? 'Words I’ve Seen' : 'Random Quiz'}
                  </Text>
                  <Text style={[styles.choiceBody, { color: colors.inkMuted }]}>
                    {type === 'seen'
                      ? 'Only words you’ve already unlocked in the app.'
                      : 'Any word from the selected difficulty level.'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.sectionLabel, { color: colors.inkMuted }]}>
            Step 2 · Difficulty
          </Text>
          <View style={styles.levelRow}>
            {LEVELS.map((item) => {
              const selected = level === item;
              const accent =
                item === 'beginner'
                  ? colors.beginner
                  : item === 'intermediate'
                    ? colors.intermediate
                    : colors.hard;
              return (
                <Pressable
                  key={item}
                  onPress={() => onSelectLevel(item)}
                  style={[
                    styles.levelChip,
                    {
                      backgroundColor: selected ? accent : colors.chipIdle,
                      borderColor: selected
                        ? colors.selectedBorder
                        : 'transparent',
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Text
                    style={[
                      styles.levelChipText,
                      {
                        color: selected
                          ? colors.background
                          : colors.chipIdleText,
                      },
                    ]}
                  >
                    {LEVEL_LABEL[item]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {seenError ? (
            <Text style={[styles.error, { color: colors.hard }]}>{seenError}</Text>
          ) : null}

          <Pressable
            onPress={onStart}
            disabled={!quizType || !level}
            style={[
              styles.primaryButton,
              {
                backgroundColor: !quizType || !level ? colors.wash : colors.ink,
                opacity: !quizType || !level ? 0.5 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={paused ? 'Start a new quiz' : 'Start quiz'}
          >
            <Text style={[styles.primaryButtonText, { color: colors.background }]}>
              {paused ? 'Start new quiz' : 'Start Quiz'}
            </Text>
          </Pressable>
          {paused ? (
            <Text style={[styles.limitNote, { color: colors.inkMuted }]}>
              Starting a new quiz discards your paused progress.
            </Text>
          ) : null}
        </>
      )}
    </>
  );
}
