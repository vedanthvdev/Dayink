import { describe, expect, it } from 'vitest';
import { formatLocalDate } from '../../domain/localDate';
import {
  QUIZ_DAILY_LIMIT,
  emptyQuizDailyUsage,
  type QuizAnswerRecord,
  type QuizDailyUsage,
  type QuizPausedSession,
} from '../../domain/quiz';
import { canLeaveQuizWithoutPausing, shouldSealOrphanedPaused } from './sessionLeave';

const answer: QuizAnswerRecord = {
  question: {
    correct: {
      id: 'b1',
      word: 'alpha',
      oneLiner: 'First.',
      example: 'Alpha led the pack today.',
    },
    choices: [
      { wordId: 'b1', word: 'alpha' },
      { wordId: 'b2', word: 'bravo' },
      { wordId: 'b3', word: 'charlie' },
      { wordId: 'b4', word: 'delta' },
    ],
    correctIndex: 0,
  },
  selectedIndex: 0,
  correct: true,
};

function pausedWith(answers: QuizAnswerRecord[]): QuizPausedSession {
  return {
    quizType: 'seen',
    level: 'beginner',
    answers,
    usedWordIds: answers.map((a) => a.question.correct.id),
    question: answers[0]?.question ?? null,
    selectedIndex: null,
    questionNumber: answers.length + 1,
    phase: 'playing',
    pausedAt: '2026-07-28T12:00:00.000Z',
  };
}

const exhaustedUsage: QuizDailyUsage = {
  localDate: formatLocalDate(new Date()),
  questionsAnswered: QUIZ_DAILY_LIMIT,
};

describe('canLeaveQuizWithoutPausing', () => {
  it('allows leaving from quiz home', () => {
    expect(canLeaveQuizWithoutPausing('home', 'playing')).toBe(true);
  });

  it('allows leaving from results', () => {
    expect(canLeaveQuizWithoutPausing('results', 'playing')).toBe(true);
  });

  it('allows leaving review opened from results or the day report', () => {
    expect(canLeaveQuizWithoutPausing('review', 'results')).toBe(true);
    expect(canLeaveQuizWithoutPausing('review', 'home')).toBe(true);
  });

  it('blocks leaving mid-question or mid-feedback', () => {
    expect(canLeaveQuizWithoutPausing('playing', 'playing')).toBe(false);
    expect(canLeaveQuizWithoutPausing('feedback', 'feedback')).toBe(false);
  });

  it('blocks leaving review opened from a live session', () => {
    expect(canLeaveQuizWithoutPausing('review', 'playing')).toBe(false);
    expect(canLeaveQuizWithoutPausing('review', 'feedback')).toBe(false);
  });
});

describe('shouldSealOrphanedPaused', () => {
  it('seals when the day is used up and the paused run has answers', () => {
    expect(
      shouldSealOrphanedPaused({
        sealOrphanedPaused: true,
        usage: exhaustedUsage,
        paused: pausedWith([answer]),
      }),
    ).toBe(true);
  });

  it('does not seal unless sealing was requested', () => {
    expect(
      shouldSealOrphanedPaused({
        usage: exhaustedUsage,
        paused: pausedWith([answer]),
      }),
    ).toBe(false);
  });

  it('does not seal while questions remain today', () => {
    expect(
      shouldSealOrphanedPaused({
        sealOrphanedPaused: true,
        usage: emptyQuizDailyUsage(),
        paused: pausedWith([answer]),
      }),
    ).toBe(false);
  });

  it('does not seal when yesterday’s usage no longer counts', () => {
    expect(
      shouldSealOrphanedPaused({
        sealOrphanedPaused: true,
        usage: { localDate: '2020-01-01', questionsAnswered: QUIZ_DAILY_LIMIT },
        paused: pausedWith([answer]),
      }),
    ).toBe(false);
  });

  it('does not seal an empty or missing paused run', () => {
    expect(
      shouldSealOrphanedPaused({
        sealOrphanedPaused: true,
        usage: exhaustedUsage,
        paused: pausedWith([]),
      }),
    ).toBe(false);
    expect(
      shouldSealOrphanedPaused({
        sealOrphanedPaused: true,
        usage: exhaustedUsage,
        paused: null,
      }),
    ).toBe(false);
  });
});
