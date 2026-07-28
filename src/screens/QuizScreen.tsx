import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ShownYearByWordId } from '../domain/shownYear';
import type { Level } from '../domain/types';
import {
  QUIZ_DAILY_LIMIT,
  canStartSeenQuiz,
  emptyQuizDailyUsage,
  isQuizDevTesting,
  makeDayReport,
  makeSessionSummary,
  mergeDayReport,
  nextQuestion,
  remainingQuestionsToday,
  scoreSession,
  withAnsweredQuestion,
  type QuizAnswerRecord,
  type QuizDailyUsage,
  type QuizDayReport,
  type QuizPausedSession,
  type QuizQuestion,
  type QuizType,
} from '../domain/quiz';
import type { RootStackParamList } from '../navigation/types';
import {
  appendQuizSessionSummary,
  clearQuizDayReport,
  clearQuizPausedSession,
  loadQuizDailyUsage,
  loadQuizDayReport,
  loadQuizPausedSession,
  saveQuizDailyUsage,
  saveQuizDayReport,
  saveQuizPausedSession,
} from '../storage/quizPreferences';
import { fonts } from '../theme/typography';
import { useThemeColors } from '../theme/useThemeColors';

const LEVELS: Level[] = ['beginner', 'intermediate', 'hard'];

const LEVEL_LABEL: Record<Level, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  hard: 'Hard',
};

const TYPE_LABEL: Record<QuizType, string> = {
  seen: 'Words I’ve Seen',
  random: 'Random Quiz',
};

type Phase = 'home' | 'playing' | 'feedback' | 'review' | 'results';
type ActivePhase = 'playing' | 'feedback';
type ReviewReturnPhase = ActivePhase | 'results' | 'home';

type Props = {
  shownYearByWordId: ShownYearByWordId;
  onBack: () => void;
};

function snapshotPaused(input: {
  quizType: QuizType;
  level: Level;
  answers: QuizAnswerRecord[];
  usedWordIds: Set<string>;
  question: QuizQuestion | null;
  selectedIndex: number | null;
  questionNumber: number;
  phase: ActivePhase;
}): QuizPausedSession {
  return {
    quizType: input.quizType,
    level: input.level,
    answers: input.answers,
    usedWordIds: [...input.usedWordIds],
    question: input.question,
    selectedIndex: input.selectedIndex,
    questionNumber: input.questionNumber,
    phase: input.phase,
    pausedAt: new Date().toISOString(),
  };
}

export function QuizScreen({ shownYearByWordId, onBack }: Props) {
  const colors = useThemeColors();
  const isActive = useIsFocused();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const allowLeaveRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState<QuizDailyUsage | null>(null);
  const [paused, setPaused] = useState<QuizPausedSession | null>(null);
  const [dayReport, setDayReport] = useState<QuizDayReport | null>(null);
  const [phase, setPhase] = useState<Phase>('home');
  const [quizType, setQuizType] = useState<QuizType | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [seenError, setSeenError] = useState<string | null>(null);
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [usedWordIds, setUsedWordIds] = useState<Set<string>>(new Set());
  const [answers, setAnswers] = useState<QuizAnswerRecord[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewReturnPhase, setReviewReturnPhase] =
    useState<ReviewReturnPhase>('playing');
  const [questionNumber, setQuestionNumber] = useState(1);

  const remaining = useMemo(() => remainingQuestionsToday(usage), [usage]);
  const answeredToday = QUIZ_DAILY_LIMIT - remaining;
  /** Day's 10 are used; show report card instead of start controls. */
  const quizLockedForToday = remaining <= 0;
  const dailyQuestionLabel =
    phase === 'playing' ? answeredToday + 1 : answeredToday;

  const liveScore = useMemo(() => {
    const fromReport = dayReport?.answers ?? [];
    const fromPaused = paused?.answers ?? [];
    if (fromReport.length === 0 && fromPaused.length === 0) return null;
    return scoreSession([...fromReport, ...fromPaused]);
  }, [paused, dayReport]);

  const leaveToAppHome = useCallback(() => {
    allowLeaveRef.current = true;
    setPhase('home');
    setQuizType(null);
    setLevel(null);
    setSeenError(null);
    setQuestion(null);
    setUsedWordIds(new Set());
    setAnswers([]);
    setSelectedIndex(null);
    setReviewIndex(0);
    setReviewReturnPhase('playing');
    setQuestionNumber(1);
    onBack();
  }, [onBack]);

  const refreshStoredState = useCallback(async (options?: { sealOrphanedPaused?: boolean }) => {
    const [loadedUsage, loadedPaused, loadedReport] = await Promise.all([
      loadQuizDailyUsage(),
      loadQuizPausedSession(),
      loadQuizDayReport(),
    ]);
    let nextPaused = loadedPaused;
    let nextReport = loadedReport;

    // Seal a leftover paused run only when idle on quiz home (not mid-question).
    if (
      options?.sealOrphanedPaused &&
      remainingQuestionsToday(loadedUsage) <= 0 &&
      loadedPaused &&
      loadedPaused.answers.length > 0
    ) {
      const sealed = mergeDayReport(
        loadedReport,
        makeDayReport({
          quizType: loadedPaused.quizType,
          level: loadedPaused.level,
          answers: loadedPaused.answers,
        }),
      );
      await saveQuizDayReport(sealed);
      await clearQuizPausedSession();
      nextPaused = null;
      nextReport = sealed;
    }

    setUsage(loadedUsage);
    setPaused(nextPaused);
    setDayReport(nextReport);
    return { loadedUsage, nextPaused, nextReport };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await refreshStoredState({ sealOrphanedPaused: true });
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshStoredState]);

  useEffect(() => {
    if (!isActive) return;
    // Don't overwrite an in-progress question/feedback session when re-focusing.
    setPhase((current) => {
      if (current === 'playing' || current === 'feedback' || current === 'review') {
        return current;
      }
      void refreshStoredState({ sealOrphanedPaused: current === 'home' });
      return current === 'results' ? 'home' : current;
    });
  }, [isActive, refreshStoredState]);

  const resetToHome = useCallback(() => {
    setPhase('home');
    setQuizType(null);
    setLevel(null);
    setSeenError(null);
    setQuestion(null);
    setUsedWordIds(new Set());
    setAnswers([]);
    setSelectedIndex(null);
    setReviewIndex(0);
    setReviewReturnPhase('playing');
    setQuestionNumber(1);
  }, []);

  const persistPaused = useCallback(async (session: QuizPausedSession) => {
    await saveQuizPausedSession(session);
    setPaused(session);
  }, []);

  const discardPaused = useCallback(async () => {
    await clearQuizPausedSession();
    setPaused(null);
  }, []);

  const finishWithAnswers = useCallback(
    async (finalAnswers: QuizAnswerRecord[], type: QuizType, selectedLevel: Level) => {
      setAnswers(finalAnswers);
      await clearQuizPausedSession();
      setPaused(null);
      if (finalAnswers.length === 0) {
        setSeenError('Couldn’t build a quiz from the available words. Try another level or type.');
        setPhase('home');
        return;
      }
      const summary = makeSessionSummary({
        quizType: type,
        level: selectedLevel,
        answers: finalAnswers,
      });
      await appendQuizSessionSummary(summary);
      const existing = await loadQuizDayReport();
      const report = mergeDayReport(
        existing,
        makeDayReport({
          quizType: type,
          level: selectedLevel,
          answers: finalAnswers,
        }),
      );
      await saveQuizDayReport(report);
      setDayReport(report);
      setPhase('results');
    },
    [],
  );

  const loadNextQuestion = useCallback(
    (
      type: QuizType,
      selectedLevel: Level,
      used: Set<string>,
      priorAnswers: QuizAnswerRecord[],
      remainingBudget: number,
      nextNumber: number,
    ) => {
      if (remainingBudget <= 0) {
        void finishWithAnswers(priorAnswers, type, selectedLevel);
        return;
      }
      const built = nextQuestion({
        quizType: type,
        level: selectedLevel,
        shown: shownYearByWordId,
        usedWordIds: used,
      });
      if (!built) {
        void finishWithAnswers(priorAnswers, type, selectedLevel);
        return;
      }
      setQuestion(built);
      setQuestionNumber(nextNumber);
      setSelectedIndex(null);
      setPhase('playing');
      void persistPaused(
        snapshotPaused({
          quizType: type,
          level: selectedLevel,
          answers: priorAnswers,
          usedWordIds: used,
          question: built,
          selectedIndex: null,
          questionNumber: nextNumber,
          phase: 'playing',
        }),
      );
    },
    [shownYearByWordId, finishWithAnswers, persistPaused],
  );

  const onStart = useCallback(async () => {
    if (!quizType || !level) return;

    // Dev: each Start gets a fresh 10 so you can re-run the same day.
    let left: number;
    if (isQuizDevTesting()) {
      const cleared = emptyQuizDailyUsage();
      await saveQuizDailyUsage(cleared);
      setUsage(cleared);
      await clearQuizDayReport();
      setDayReport(null);
      left = QUIZ_DAILY_LIMIT;
    } else {
      const currentUsage = await loadQuizDailyUsage();
      setUsage(currentUsage);
      left = remainingQuestionsToday(currentUsage);
      if (left <= 0) return;
    }

    if (quizType === 'seen') {
      const gate = canStartSeenQuiz(level, shownYearByWordId);
      if (!gate.ok) {
        setSeenError(gate.reason);
        return;
      }
      setSeenError(null);
    }

    await discardPaused();
    const used = new Set<string>();
    setUsedWordIds(used);
    setAnswers([]);
    setQuestionNumber(1);
    loadNextQuestion(quizType, level, used, [], left, 1);
  }, [
    quizType,
    level,
    shownYearByWordId,
    loadNextQuestion,
    discardPaused,
  ]);

  const onContinuePaused = useCallback(() => {
    if (!paused) return;
    if (remainingQuestionsToday(usage) <= 0) {
      void finishWithAnswers(paused.answers, paused.quizType, paused.level);
      return;
    }
    setQuizType(paused.quizType);
    setLevel(paused.level);
    setAnswers(paused.answers);
    setUsedWordIds(new Set(paused.usedWordIds));
    setQuestion(paused.question);
    setSelectedIndex(paused.selectedIndex);
    setQuestionNumber(paused.questionNumber);
    setSeenError(null);
    setPhase(paused.phase);
  }, [paused, usage, finishWithAnswers]);

  const onAbandonQuiz = useCallback(async () => {
    // Report / results review: leave without creating a paused session.
    if (
      phase === 'review' &&
      (reviewReturnPhase === 'results' || reviewReturnPhase === 'home')
    ) {
      resetToHome();
      return;
    }
    if (!quizType || !level) {
      resetToHome();
      return;
    }

    // Daily limit already hit (e.g. abandon after the 10th answer): seal results.
    if (remainingQuestionsToday(usage) <= 0 && answers.length > 0) {
      await finishWithAnswers(answers, quizType, level);
      return;
    }

    const activePhase: ActivePhase =
      phase === 'feedback' || selectedIndex !== null ? 'feedback' : 'playing';
    const session = snapshotPaused({
      quizType,
      level,
      answers,
      usedWordIds,
      question,
      selectedIndex,
      questionNumber,
      phase: activePhase,
    });
    await persistPaused(session);
    resetToHome();
  }, [
    phase,
    reviewReturnPhase,
    quizType,
    level,
    selectedIndex,
    answers,
    usedWordIds,
    question,
    questionNumber,
    usage,
    persistPaused,
    resetToHome,
    finishWithAnswers,
  ]);

  const openReview = useCallback(
    (from: ReviewReturnPhase, reviewAnswers?: QuizAnswerRecord[]) => {
      const rows = reviewAnswers ?? answers;
      if (reviewAnswers) setAnswers(reviewAnswers);
      setReviewReturnPhase(from);
      setReviewIndex(Math.max(0, rows.length - 1));
      setPhase('review');
    },
    [answers],
  );

  // Pause in-progress work when the native stack pops (edge swipe / Android back).
  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e) => {
      if (allowLeaveRef.current) {
        allowLeaveRef.current = false;
        return;
      }
      if (
        phase === 'home' ||
        phase === 'results' ||
        (phase === 'review' &&
          (reviewReturnPhase === 'results' || reviewReturnPhase === 'home'))
      ) {
        return;
      }
      e.preventDefault();
      void (async () => {
        try {
          await onAbandonQuiz();
        } finally {
          // Always complete the leave — don't leave the user stuck if persist fails.
          allowLeaveRef.current = true;
          navigation.dispatch(e.data.action);
        }
      })();
    });
    return unsub;
  }, [navigation, phase, reviewReturnPhase, onAbandonQuiz]);

  const onSelectChoice = useCallback(
    async (index: number) => {
      if (!question || !quizType || !level || selectedIndex !== null) return;
      const correct = index === question.correctIndex;
      const record: QuizAnswerRecord = {
        question,
        selectedIndex: index,
        correct,
      };
      const nextAnswers = [...answers, record];
      const nextUsed = new Set(usedWordIds);
      nextUsed.add(question.correct.id);

      setSelectedIndex(index);
      setAnswers(nextAnswers);
      setUsedWordIds(nextUsed);

      const updatedUsage = withAnsweredQuestion(usage);
      setUsage(updatedUsage);
      await saveQuizDailyUsage(updatedUsage);
      setPhase('feedback');
      await persistPaused(
        snapshotPaused({
          quizType,
          level,
          answers: nextAnswers,
          usedWordIds: nextUsed,
          question,
          selectedIndex: index,
          questionNumber,
          phase: 'feedback',
        }),
      );
    },
    [
      question,
      quizType,
      level,
      selectedIndex,
      answers,
      usedWordIds,
      usage,
      questionNumber,
      persistPaused,
    ],
  );

  const onNextAfterFeedback = useCallback(() => {
    if (!quizType || !level) return;
    const left = remainingQuestionsToday(usage);
    if (left <= 0) {
      void finishWithAnswers(answers, quizType, level);
      return;
    }
    loadNextQuestion(quizType, level, usedWordIds, answers, left, questionNumber + 1);
  }, [
    quizType,
    level,
    usage,
    usedWordIds,
    answers,
    questionNumber,
    loadNextQuestion,
    finishWithAnswers,
  ]);

  if (loading) {
    return (
      <LinearGradient colors={colors.gradient} style={styles.gradient}>
        <SafeAreaView style={[styles.safe, styles.centered]}>
          <ActivityIndicator color={colors.ink} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const scored = {
    total: answers.length,
    correct: answers.filter((a) => a.correct).length,
    incorrect: answers.filter((a) => !a.correct).length,
    percent:
      answers.length === 0
        ? 0
        : Math.round((answers.filter((a) => a.correct).length / answers.length) * 100),
  };

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
          {phase === 'home' ? (
            <>
              <Pressable
                onPress={leaveToAppHome}
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
                        openReview('home', dayReport.answers);
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
                    onPress={leaveToAppHome}
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
                        <Text
                          style={[styles.primaryButtonText, { color: colors.background }]}
                        >
                          Continue where you left off
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => void discardPaused()}
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
                          onPress={() => {
                            setQuizType(type);
                            setSeenError(null);
                          }}
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
                          onPress={() => {
                            setLevel(item);
                            setSeenError(null);
                          }}
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
                    onPress={() => void onStart()}
                    disabled={!quizType || !level}
                    style={[
                      styles.primaryButton,
                      {
                        backgroundColor:
                          !quizType || !level ? colors.wash : colors.ink,
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
          ) : null}

          {phase === 'playing' || phase === 'feedback' ? (
            <>
              <View style={styles.progressRow}>
                <Pressable
                  onPress={() => void onAbandonQuiz()}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Abandon quiz"
                >
                  <Text style={[styles.link, { color: colors.inkMuted }]}>Abandon</Text>
                </Pressable>
                {answers.length > 0 ? (
                  <Pressable
                    onPress={() =>
                      openReview(phase === 'feedback' ? 'feedback' : 'playing')
                    }
                    hitSlop={8}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.link, { color: colors.ink }]}>Review</Text>
                  </Pressable>
                ) : null}
              </View>
              <Text style={[styles.progress, { color: colors.inkMuted, marginBottom: 14 }]}>
                Question {Math.min(dailyQuestionLabel, QUIZ_DAILY_LIMIT)} of{' '}
                {QUIZ_DAILY_LIMIT}
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
                  <View style={styles.choices}>
                    {question.choices.map((choice, index) => {
                      const selected = selectedIndex === index;
                      const showResult = phase === 'feedback';
                      const isCorrect = index === question.correctIndex;
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
                      return (
                        <Pressable
                          key={`${choice.wordId}-${index}`}
                          disabled={phase === 'feedback'}
                          onPress={() => void onSelectChoice(index)}
                          style={[styles.answer, { backgroundColor, borderColor }]}
                          accessibilityRole="button"
                          accessibilityState={{ selected, disabled: phase === 'feedback' }}
                        >
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
                        </Pressable>
                      );
                    })}
                  </View>

                  {phase === 'feedback' && selectedIndex !== null ? (
                    <View style={styles.feedbackBox}>
                      {selectedIndex === question.correctIndex ? (
                        <Text style={[styles.feedbackOk, { color: colors.beginner }]}>
                          Congrats! Correct!
                        </Text>
                      ) : (
                        <>
                          <Text style={[styles.feedbackBad, { color: colors.hard }]}>
                            Oops! That’s not quite right.
                          </Text>
                          <Text style={[styles.feedbackCorrect, { color: colors.ink }]}>
                            The correct answer is: {question.correct.word}.
                          </Text>
                        </>
                      )}
                      <Pressable
                        onPress={onNextAfterFeedback}
                        style={[styles.primaryButton, { backgroundColor: colors.ink }]}
                        accessibilityRole="button"
                      >
                        <Text style={[styles.primaryButtonText, { color: colors.background }]}>
                          {remainingQuestionsToday(usage) <= 0
                            ? 'See results'
                            : 'Next Question →'}
                        </Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              ) : null}
            </>
          ) : null}

          {phase === 'review' ? (
            <>
              <View style={styles.progressRow}>
                <Pressable
                  onPress={() => setPhase(reviewReturnPhase)}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel="Back to quiz"
                >
                  <Text style={[styles.link, { color: colors.inkMuted }]}>← Back</Text>
                </Pressable>
                {reviewReturnPhase !== 'results' && reviewReturnPhase !== 'home' ? (
                  <Pressable
                    onPress={() => void onAbandonQuiz()}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Abandon quiz"
                  >
                    <Text style={[styles.link, { color: colors.inkMuted }]}>Abandon</Text>
                  </Pressable>
                ) : null}
              </View>

              {answers.length === 0 ? (
                <Text style={[styles.subtitle, { color: colors.inkMuted }]}>
                  No answered questions yet.
                </Text>
              ) : (
                <>
                  <Text
                    style={[styles.progress, { color: colors.inkMuted, marginBottom: 14 }]}
                  >
                    Answer {reviewIndex + 1} of {answers.length}
                  </Text>
                  {(() => {
                    const row = answers[reviewIndex]!;
                    return (
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
                        <View style={styles.choices}>
                          {row.question.choices.map((choice, index) => {
                            const picked = index === row.selectedIndex;
                            const isCorrect = index === row.question.correctIndex;
                            const emphasize = picked || isCorrect;
                            let backgroundColor = colors.chipIdle;
                            let borderColor = 'transparent';
                            if (isCorrect) {
                              backgroundColor = colors.beginnerSoft;
                              borderColor = colors.beginner;
                            } else if (picked) {
                              backgroundColor = colors.hardSoft;
                              borderColor = colors.hard;
                            }
                            return (
                              <View
                                key={`${choice.wordId}-r-${index}`}
                                style={[styles.answer, { backgroundColor, borderColor }]}
                              >
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
                              </View>
                            );
                          })}
                        </View>

                        <View style={styles.feedbackBox}>
                          {row.correct ? (
                            <Text style={[styles.feedbackOk, { color: colors.beginner }]}>
                              Congrats! Correct!
                            </Text>
                          ) : (
                            <>
                              <Text style={[styles.feedbackBad, { color: colors.hard }]}>
                                Oops! That’s not quite right.
                              </Text>
                              <Text
                                style={[styles.feedbackCorrect, { color: colors.ink }]}
                              >
                                The correct answer is: {row.question.correct.word}.
                              </Text>
                            </>
                          )}
                        </View>
                      </View>
                    );
                  })()}

                  <View style={styles.reviewNav}>
                    <Pressable
                      disabled={reviewIndex <= 0}
                      onPress={() => setReviewIndex((i) => Math.max(0, i - 1))}
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
                      onPress={() =>
                        setReviewIndex((i) => Math.min(answers.length - 1, i + 1))
                      }
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
          ) : null}

          {phase === 'results' ? (
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
                  <Text style={[styles.reportLabel, { color: colors.inkMuted }]}>
                    Accuracy
                  </Text>
                  <Text style={[styles.reportValue, { color: colors.beginner }]}>
                    {scored.percent}% correct
                  </Text>
                </View>
                <View style={styles.reportSplit}>
                  <View style={styles.reportHalf}>
                    <Text style={[styles.reportLabel, { color: colors.inkMuted }]}>
                      Correct
                    </Text>
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
                onPress={() => openReview('results')}
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
                  onPress={resetToHome}
                  style={[styles.secondaryButton, { marginTop: 16 }]}
                  accessibilityRole="button"
                >
                  <Text style={[styles.secondaryButtonText, { color: colors.ink }]}>
                    Back to Quiz
                  </Text>
                </Pressable>
              ) : null}
              <Pressable
                onPress={leaveToAppHome}
                style={[styles.secondaryButton, { marginTop: remaining > 0 ? 8 : 16 }]}
                accessibilityRole="button"
                accessibilityLabel="Return to home page"
              >
                <Text style={[styles.secondaryButtonText, { color: colors.ink }]}>
                  Return to home page
                </Text>
              </Pressable>
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },
  centered: { alignItems: 'center', justifyContent: 'center' },
  inner: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 36,
  },
  back: {
    fontSize: 15,
    fontFamily: fonts.bodySemi,
    marginBottom: 18,
  },
  title: {
    fontSize: 40,
    fontFamily: fonts.display,
    letterSpacing: -1,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.body,
  },
  meter: {
    marginTop: 22,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  meterTitle: {
    fontSize: 16,
    fontFamily: fonts.bodySemi,
  },
  meterBody: {
    marginTop: 6,
    fontSize: 14,
    fontFamily: fonts.body,
  },
  meterStrong: {
    marginTop: 4,
    fontSize: 15,
    fontFamily: fonts.bodySemi,
  },
  pausedCard: {
    marginTop: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
  },
  sectionLabel: {
    marginTop: 22,
    marginBottom: 10,
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    fontFamily: fonts.bodySemi,
  },
  rowGap: { gap: 10 },
  choiceCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
  },
  choiceTitle: {
    fontSize: 17,
    fontFamily: fonts.body,
  },
  choiceBody: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.body,
  },
  levelRow: { gap: 8 },
  levelChip: {
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  levelChipText: {
    fontSize: 15,
    fontFamily: fonts.bodySemi,
    textAlign: 'center',
  },
  error: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.body,
  },
  limitNote: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.body,
  },
  primaryButton: {
    marginTop: 22,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: fonts.bodySemi,
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontFamily: fonts.bodySemi,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  progress: {
    fontSize: 14,
    fontFamily: fonts.bodySemi,
  },
  link: {
    fontSize: 14,
    fontFamily: fonts.bodySemi,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  reportCard: {
    marginTop: 28,
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 28,
    paddingHorizontal: 24,
    gap: 22,
  },
  reportEyebrow: {
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontFamily: fonts.bodySemi,
    marginBottom: 4,
  },
  reportBlock: {
    gap: 8,
  },
  reportSplit: {
    flexDirection: 'row',
    gap: 24,
  },
  reportHalf: {
    flex: 1,
    gap: 8,
  },
  reportLabel: {
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontFamily: fonts.bodySemi,
  },
  reportScore: {
    fontSize: 40,
    fontFamily: fonts.display,
    letterSpacing: -1,
  },
  reportValue: {
    fontSize: 20,
    fontFamily: fonts.body,
  },
  reportNote: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.body,
  },
  definition: {
    fontSize: 17,
    lineHeight: 25,
    fontFamily: fonts.bodySemi,
  },
  choices: { marginTop: 18, gap: 10 },
  answer: {
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  answerLabel: {
    fontSize: 14,
    fontFamily: fonts.body,
    width: 22,
  },
  answerWord: {
    flex: 1,
    fontSize: 17,
    fontFamily: fonts.body,
  },
  feedbackBox: { marginTop: 18 },
  feedbackOk: {
    fontSize: 17,
    fontFamily: fonts.bodySemi,
    marginBottom: 10,
  },
  feedbackBad: {
    fontSize: 17,
    fontFamily: fonts.bodySemi,
  },
  feedbackCorrect: {
    marginTop: 6,
    marginBottom: 10,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.body,
  },
  badge: {
    marginBottom: 10,
    fontSize: 13,
    fontFamily: fonts.bodySemi,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  navRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reviewNav: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 10,
  },
  reviewNavButton: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 14,
    alignItems: 'center',
  },
  score: {
    fontSize: 28,
    fontFamily: fonts.display,
  },
  percent: {
    marginTop: 6,
    fontSize: 20,
    fontFamily: fonts.bodySemi,
  },
  meta: {
    marginTop: 8,
    fontSize: 15,
    fontFamily: fonts.body,
  },
});
