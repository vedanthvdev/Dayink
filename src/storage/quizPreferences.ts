import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  QuizAnswerRecord,
  QuizChoice,
  QuizDailyUsage,
  QuizDayReport,
  QuizPausedSession,
  QuizQuestion,
  QuizSessionSummary,
} from '../domain/quiz';
import type { Level, WordEntry } from '../domain/types';
import { formatLocalDate } from '../domain/localDate';

const DAILY_KEY = 'dayink.quizDailyUsage';
const HISTORY_KEY = 'dayink.quizSessionHistory';
const PAUSED_KEY = 'dayink.quizPausedSession';
const DAY_REPORT_KEY = 'dayink.quizDayReport';
const HISTORY_MAX = 50;

function isLevel(value: unknown): value is Level {
  return value === 'beginner' || value === 'intermediate' || value === 'hard';
}

function normalizeDailyUsage(value: unknown): QuizDailyUsage | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.localDate !== 'string') return null;
  if (typeof raw.questionsAnswered !== 'number' || !Number.isFinite(raw.questionsAnswered)) {
    return null;
  }
  return {
    localDate: raw.localDate,
    questionsAnswered: Math.max(0, Math.floor(raw.questionsAnswered)),
  };
}

function normalizeSummary(value: unknown): QuizSessionSummary | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  if (
    typeof raw.id !== 'string' ||
    typeof raw.completedAt !== 'string' ||
    typeof raw.localDate !== 'string' ||
    (raw.quizType !== 'seen' && raw.quizType !== 'random') ||
    !isLevel(raw.level) ||
    typeof raw.total !== 'number' ||
    typeof raw.correct !== 'number' ||
    typeof raw.incorrect !== 'number' ||
    typeof raw.percent !== 'number'
  ) {
    return null;
  }
  return {
    id: raw.id,
    completedAt: raw.completedAt,
    localDate: raw.localDate,
    quizType: raw.quizType,
    level: raw.level,
    total: raw.total,
    correct: raw.correct,
    incorrect: raw.incorrect,
    percent: raw.percent,
  };
}

export async function loadQuizDailyUsage(): Promise<QuizDailyUsage | null> {
  const raw = await AsyncStorage.getItem(DAILY_KEY);
  if (!raw) return null;
  try {
    return normalizeDailyUsage(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function saveQuizDailyUsage(usage: QuizDailyUsage): Promise<void> {
  await AsyncStorage.setItem(DAILY_KEY, JSON.stringify(usage));
}

export async function loadQuizSessionHistory(): Promise<QuizSessionSummary[]> {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeSummary)
      .filter((item): item is QuizSessionSummary => item !== null)
      .slice(0, HISTORY_MAX);
  } catch {
    return [];
  }
}

export async function appendQuizSessionSummary(
  summary: QuizSessionSummary,
): Promise<void> {
  const existing = await loadQuizSessionHistory();
  const next = [summary, ...existing.filter((item) => item.id !== summary.id)].slice(
    0,
    HISTORY_MAX,
  );
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

function isWordEntry(value: unknown): value is WordEntry {
  if (!value || typeof value !== 'object') return false;
  const raw = value as Record<string, unknown>;
  return (
    typeof raw.id === 'string' &&
    typeof raw.word === 'string' &&
    typeof raw.oneLiner === 'string' &&
    typeof raw.example === 'string'
  );
}

function isChoice(value: unknown): value is QuizChoice {
  if (!value || typeof value !== 'object') return false;
  const raw = value as Record<string, unknown>;
  return typeof raw.wordId === 'string' && typeof raw.word === 'string';
}

function normalizeQuestion(value: unknown): QuizQuestion | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  if (!isWordEntry(raw.correct)) return null;
  if (!Array.isArray(raw.choices) || raw.choices.length !== 4) return null;
  const choices = raw.choices.filter(isChoice);
  if (choices.length !== 4) return null;
  if (typeof raw.correctIndex !== 'number' || !Number.isInteger(raw.correctIndex)) {
    return null;
  }
  if (raw.correctIndex < 0 || raw.correctIndex > 3) return null;
  return {
    correct: raw.correct,
    choices,
    correctIndex: raw.correctIndex,
  };
}

function normalizeAnswerRecord(value: unknown): QuizAnswerRecord | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const question = normalizeQuestion(raw.question);
  if (!question) return null;
  if (typeof raw.selectedIndex !== 'number' || !Number.isInteger(raw.selectedIndex)) {
    return null;
  }
  if (raw.selectedIndex < 0 || raw.selectedIndex > 3) return null;
  if (typeof raw.correct !== 'boolean') return null;
  return {
    question,
    selectedIndex: raw.selectedIndex,
    correct: raw.correct,
  };
}

function normalizePausedSession(value: unknown): QuizPausedSession | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  if (
    (raw.quizType !== 'seen' && raw.quizType !== 'random') ||
    !isLevel(raw.level) ||
    !Array.isArray(raw.answers) ||
    !Array.isArray(raw.usedWordIds) ||
    typeof raw.questionNumber !== 'number' ||
    !Number.isFinite(raw.questionNumber) ||
    (raw.phase !== 'playing' && raw.phase !== 'feedback') ||
    typeof raw.pausedAt !== 'string'
  ) {
    return null;
  }

  const answers = raw.answers
    .map(normalizeAnswerRecord)
    .filter((item): item is QuizAnswerRecord => item !== null);
  if (answers.length !== raw.answers.length) return null;

  const usedWordIds = raw.usedWordIds.filter(
    (id): id is string => typeof id === 'string',
  );
  if (usedWordIds.length !== raw.usedWordIds.length) return null;

  let question: QuizQuestion | null = null;
  if (raw.question != null) {
    question = normalizeQuestion(raw.question);
    if (!question) return null;
  }

  let selectedIndex: number | null = null;
  if (raw.selectedIndex != null) {
    if (
      typeof raw.selectedIndex !== 'number' ||
      !Number.isInteger(raw.selectedIndex) ||
      raw.selectedIndex < 0 ||
      raw.selectedIndex > 3
    ) {
      return null;
    }
    selectedIndex = raw.selectedIndex;
  }

  return {
    quizType: raw.quizType,
    level: raw.level,
    answers,
    usedWordIds,
    question,
    selectedIndex,
    questionNumber: Math.max(1, Math.floor(raw.questionNumber)),
    phase: raw.phase,
    pausedAt: raw.pausedAt,
  };
}

export async function loadQuizPausedSession(): Promise<QuizPausedSession | null> {
  const raw = await AsyncStorage.getItem(PAUSED_KEY);
  if (!raw) return null;
  try {
    const session = normalizePausedSession(JSON.parse(raw));
    if (!session) return null;
    const pausedDate = new Date(session.pausedAt);
    if (
      Number.isNaN(pausedDate.getTime()) ||
      formatLocalDate(pausedDate) !== formatLocalDate(new Date())
    ) {
      await AsyncStorage.removeItem(PAUSED_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export async function saveQuizPausedSession(
  session: QuizPausedSession,
): Promise<void> {
  await AsyncStorage.setItem(PAUSED_KEY, JSON.stringify(session));
}

export async function clearQuizPausedSession(): Promise<void> {
  await AsyncStorage.removeItem(PAUSED_KEY);
}

function normalizeDayReport(value: unknown): QuizDayReport | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  if (
    typeof raw.localDate !== 'string' ||
    (raw.quizType !== 'seen' && raw.quizType !== 'random') ||
    !isLevel(raw.level) ||
    !Array.isArray(raw.answers) ||
    typeof raw.total !== 'number' ||
    typeof raw.correct !== 'number' ||
    typeof raw.incorrect !== 'number' ||
    typeof raw.percent !== 'number'
  ) {
    return null;
  }
  const answers = raw.answers
    .map(normalizeAnswerRecord)
    .filter((item): item is QuizAnswerRecord => item !== null);
  if (answers.length !== raw.answers.length) return null;
  return {
    localDate: raw.localDate,
    quizType: raw.quizType,
    level: raw.level,
    answers,
    total: raw.total,
    correct: raw.correct,
    incorrect: raw.incorrect,
    percent: raw.percent,
  };
}

export async function loadQuizDayReport(): Promise<QuizDayReport | null> {
  const raw = await AsyncStorage.getItem(DAY_REPORT_KEY);
  if (!raw) return null;
  try {
    const report = normalizeDayReport(JSON.parse(raw));
    if (!report) return null;
    if (report.localDate !== formatLocalDate(new Date())) return null;
    return report;
  } catch {
    return null;
  }
}

export async function saveQuizDayReport(report: QuizDayReport): Promise<void> {
  await AsyncStorage.setItem(DAY_REPORT_KEY, JSON.stringify(report));
}

export async function clearQuizDayReport(): Promise<void> {
  await AsyncStorage.removeItem(DAY_REPORT_KEY);
}
