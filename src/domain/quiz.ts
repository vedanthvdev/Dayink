import type { Level, WordEntry } from './types';
import { catalogs } from './catalog';
import type { ShownYearByWordId } from './shownYear';
import { formatLocalDate } from './localDate';

/** Questions available per day (and per quiz run). */
export const QUIZ_DAILY_LIMIT = 10;
/** Minimum seen words at a level before “Words I’ve Seen” can start. */
export const QUIZ_MIN_SEEN = 4;

/** Dev builds may reset the daily counter between runs for easier testing. */
export function isQuizDevTesting(): boolean {
  return typeof __DEV__ !== 'undefined' && __DEV__;
}

export type QuizType = 'seen' | 'random';

export type QuizChoice = {
  wordId: string;
  word: string;
};

export type QuizQuestion = {
  correct: WordEntry;
  choices: QuizChoice[];
  /** Index of the correct choice in `choices` after shuffle. */
  correctIndex: number;
};

export type QuizAnswerRecord = {
  question: QuizQuestion;
  selectedIndex: number;
  correct: boolean;
};

export type QuizDailyUsage = {
  localDate: string;
  questionsAnswered: number;
};

export function emptyQuizDailyUsage(now: Date = new Date()): QuizDailyUsage {
  return { localDate: formatLocalDate(now), questionsAnswered: 0 };
}

export type QuizSessionSummary = {
  id: string;
  completedAt: string;
  localDate: string;
  quizType: QuizType;
  level: Level;
  total: number;
  correct: number;
  incorrect: number;
  percent: number;
};

/** Saved when a quiz run finishes; powers today's score and post-limit report card. */
export type QuizDayReport = {
  localDate: string;
  quizType: QuizType;
  level: Level;
  answers: QuizAnswerRecord[];
  total: number;
  correct: number;
  incorrect: number;
  percent: number;
};

/** In-progress quiz left via Abandon; can be resumed or discarded. */
export type QuizPausedSession = {
  quizType: QuizType;
  level: Level;
  answers: QuizAnswerRecord[];
  usedWordIds: string[];
  question: QuizQuestion | null;
  selectedIndex: number | null;
  questionNumber: number;
  phase: 'playing' | 'feedback';
  pausedAt: string;
};

export function remainingQuestionsToday(
  usage: QuizDailyUsage | null,
  now: Date = new Date(),
): number {
  const today = formatLocalDate(now);
  if (!usage || usage.localDate !== today) return QUIZ_DAILY_LIMIT;
  return Math.max(0, QUIZ_DAILY_LIMIT - usage.questionsAnswered);
}

export function withAnsweredQuestion(
  usage: QuizDailyUsage | null,
  now: Date = new Date(),
): QuizDailyUsage {
  const today = formatLocalDate(now);
  if (!usage || usage.localDate !== today) {
    return { localDate: today, questionsAnswered: 1 };
  }
  return {
    localDate: today,
    questionsAnswered: Math.min(QUIZ_DAILY_LIMIT, usage.questionsAnswered + 1),
  };
}

/** Seen words for a level: any stamped id that exists in that level catalog. */
export function seenWordsForLevel(
  level: Level,
  shown: ShownYearByWordId,
): WordEntry[] {
  const catalog = catalogs[level];
  return catalog.filter((entry) => shown[entry.id] !== undefined);
}

export function canStartSeenQuiz(
  level: Level,
  shown: ShownYearByWordId,
): { ok: true; pool: WordEntry[] } | { ok: false; pool: WordEntry[]; reason: string } {
  const pool = seenWordsForLevel(level, shown);
  if (pool.length < QUIZ_MIN_SEEN) {
    return {
      ok: false,
      pool,
      reason: `You’ve only seen ${pool.length} ${level} word${pool.length === 1 ? '' : 's'}. See at least ${QUIZ_MIN_SEEN} at this level, pick another level, or try Random Quiz.`,
    };
  }
  return { ok: true, pool };
}

function shuffleInPlace<T>(items: T[], random: () => number = Math.random): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const tmp = items[i]!;
    items[i] = items[j]!;
    items[j] = tmp;
  }
  return items;
}

function pickDistractors(
  correct: WordEntry,
  level: Level,
  count: number,
  random: () => number,
): WordEntry[] {
  const pool = catalogs[level].filter(
    (entry) =>
      entry.id !== correct.id &&
      entry.word.toLowerCase() !== correct.word.toLowerCase() &&
      entry.oneLiner.trim().toLowerCase() !== correct.oneLiner.trim().toLowerCase(),
  );
  shuffleInPlace(pool, random);
  return pool.slice(0, count);
}

export function buildQuestion(
  correct: WordEntry,
  level: Level,
  random: () => number = Math.random,
): QuizQuestion | null {
  const distractors = pickDistractors(correct, level, 3, random);
  if (distractors.length < 3) return null;

  const mixed: WordEntry[] = [correct, ...distractors];
  shuffleInPlace(mixed, random);
  const correctIndex = mixed.findIndex((entry) => entry.id === correct.id);
  if (correctIndex < 0) return null;

  return {
    correct,
    choices: mixed.map((entry) => ({ wordId: entry.id, word: entry.word })),
    correctIndex,
  };
}

/**
 * Build the next question for a session.
 * `usedWordIds` prevents repeats within the session.
 */
export function nextQuestion(input: {
  quizType: QuizType;
  level: Level;
  shown: ShownYearByWordId;
  usedWordIds: Set<string>;
  random?: () => number;
}): QuizQuestion | null {
  const random = input.random ?? Math.random;
  const levelWords =
    input.quizType === 'seen'
      ? seenWordsForLevel(input.level, input.shown)
      : catalogs[input.level];

  const available = levelWords.filter((entry) => !input.usedWordIds.has(entry.id));
  if (available.length === 0) return null;

  shuffleInPlace(available, random);
  for (const candidate of available) {
    const question = buildQuestion(candidate, input.level, random);
    if (question) return question;
  }
  return null;
}

export function scoreSession(answers: QuizAnswerRecord[]): {
  total: number;
  correct: number;
  incorrect: number;
  percent: number;
} {
  const total = answers.length;
  const correct = answers.filter((a) => a.correct).length;
  const incorrect = total - correct;
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);
  return { total, correct, incorrect, percent };
}

export function makeSessionSummary(input: {
  quizType: QuizType;
  level: Level;
  answers: QuizAnswerRecord[];
  now?: Date;
}): QuizSessionSummary {
  const now = input.now ?? new Date();
  const scored = scoreSession(input.answers);
  return {
    id: `${formatLocalDate(now)}-${now.getTime()}`,
    completedAt: now.toISOString(),
    localDate: formatLocalDate(now),
    quizType: input.quizType,
    level: input.level,
    ...scored,
  };
}

export function makeDayReport(input: {
  quizType: QuizType;
  level: Level;
  answers: QuizAnswerRecord[];
  now?: Date;
}): QuizDayReport {
  const now = input.now ?? new Date();
  const scored = scoreSession(input.answers);
  return {
    localDate: formatLocalDate(now),
    quizType: input.quizType,
    level: input.level,
    answers: input.answers,
    ...scored,
  };
}

/** Append a finished run into today’s report (supports multiple sessions per day). */
export function mergeDayReport(
  existing: QuizDayReport | null,
  incoming: QuizDayReport,
): QuizDayReport {
  if (!existing || existing.localDate !== incoming.localDate) return incoming;
  const answers = [...existing.answers, ...incoming.answers];
  const scored = scoreSession(answers);
  return {
    localDate: incoming.localDate,
    quizType: incoming.quizType,
    level: incoming.level,
    answers,
    ...scored,
  };
}
