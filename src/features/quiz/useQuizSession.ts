import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
} from '../../domain/quiz';
import type { ShownYearByWordId } from '../../domain/shownYear';
import type { Level } from '../../domain/types';
import type { RootStackParamList } from '../../navigation/types';
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
} from '../../storage/quizPreferences';
import { canLeaveQuizWithoutPausing, shouldSealOrphanedPaused } from './sessionLeave';
import { snapshotPaused } from './snapshotPaused';
import type { ActivePhase, Phase, ReviewReturnPhase } from './types';

type Params = {
  shownYearByWordId: ShownYearByWordId;
  onBack: () => void;
};

export function useQuizSession({ shownYearByWordId, onBack }: Params) {
  const isActive = useIsFocused();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const allowLeaveRef = useRef(false);
  const leaveInFlightRef = useRef(false);
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
    leaveInFlightRef.current = false;
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

    if (
      loadedPaused &&
      shouldSealOrphanedPaused({
        sealOrphanedPaused: options?.sealOrphanedPaused,
        usage: loadedUsage,
        paused: loadedPaused,
      })
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

  const closeReview = useCallback(() => {
    setPhase(reviewReturnPhase);
  }, [reviewReturnPhase]);

  const showPreviousAnswer = useCallback(() => {
    setReviewIndex((i) => Math.max(0, i - 1));
  }, []);

  const showNextAnswer = useCallback(() => {
    setReviewIndex((i) => Math.min(answers.length - 1, i + 1));
  }, [answers.length]);

  // Keep review cursor in range if the answer list shrinks.
  useEffect(() => {
    if (answers.length === 0) return;
    setReviewIndex((i) => Math.min(i, answers.length - 1));
  }, [answers.length]);

  // Pause in-progress work when the native stack pops (edge swipe / Android back).
  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e) => {
      if (allowLeaveRef.current) {
        allowLeaveRef.current = false;
        leaveInFlightRef.current = false;
        return;
      }
      if (canLeaveQuizWithoutPausing(phase, reviewReturnPhase)) {
        return;
      }
      // Ignore duplicate gesture/back events while we are already sealing leave.
      if (leaveInFlightRef.current) {
        e.preventDefault();
        return;
      }
      leaveInFlightRef.current = true;
      e.preventDefault();
      void (async () => {
        try {
          await onAbandonQuiz();
        } finally {
          // Always complete the leave — don't leave the user stuck if persist fails.
          allowLeaveRef.current = true;
          leaveInFlightRef.current = false;
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

  const selectQuizType = useCallback((type: QuizType) => {
    setQuizType(type);
    setSeenError(null);
  }, []);

  const selectLevel = useCallback((selected: Level) => {
    setLevel(selected);
    setSeenError(null);
  }, []);

  return {
    loading,
    phase,
    usage,
    paused,
    dayReport,
    quizType,
    level,
    seenError,
    question,
    answers,
    selectedIndex,
    reviewIndex,
    reviewReturnPhase,
    remaining,
    answeredToday,
    quizLockedForToday,
    dailyQuestionLabel,
    liveScore,
    selectQuizType,
    selectLevel,
    onStart,
    onContinuePaused,
    discardPaused,
    onAbandonQuiz,
    onSelectChoice,
    onNextAfterFeedback,
    openReview,
    closeReview,
    showPreviousAnswer,
    showNextAnswer,
    resetToHome,
    leaveToAppHome,
  };
}
