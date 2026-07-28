import { describe, expect, it } from 'vitest';
import { catalogs } from './catalog';
import {
  QUIZ_DAILY_LIMIT,
  QUIZ_MIN_SEEN,
  buildQuestion,
  canStartSeenQuiz,
  makeDayReport,
  mergeDayReport,
  nextQuestion,
  remainingQuestionsToday,
  scoreSession,
  seenWordsForLevel,
  withAnsweredQuestion,
  type QuizAnswerRecord,
} from './quiz';
import type { ShownYearByWordId } from './shownYear';
import type { WordEntry } from './types';

describe('quiz daily limit', () => {
  it('starts at the full daily limit with no usage', () => {
    expect(remainingQuestionsToday(null, new Date('2026-07-28T12:00:00'))).toBe(
      QUIZ_DAILY_LIMIT,
    );
  });

  it('counts each answered question toward the daily limit', () => {
    const day = new Date('2026-07-28T12:00:00');
    let usage = withAnsweredQuestion(null, day);
    expect(usage.questionsAnswered).toBe(1);
    usage = withAnsweredQuestion(usage, day);
    expect(remainingQuestionsToday(usage, day)).toBe(QUIZ_DAILY_LIMIT - 2);
  });

  it('resets on a new local day', () => {
    const usage = {
      localDate: '2026-07-27',
      questionsAnswered: QUIZ_DAILY_LIMIT,
    };
    expect(remainingQuestionsToday(usage, new Date('2026-07-28T01:00:00'))).toBe(
      QUIZ_DAILY_LIMIT,
    );
  });
});

describe('seen quiz pool', () => {
  const beginner = catalogs.beginner[0]!;
  const shown: ShownYearByWordId = {
    [beginner.id]: 6,
  };

  it('collects stamped words for a level', () => {
    const pool = seenWordsForLevel('beginner', shown);
    expect(pool.some((entry) => entry.id === beginner.id)).toBe(true);
  });

  it('blocks starting until enough seen words exist', () => {
    const gate = canStartSeenQuiz('beginner', shown);
    expect(gate.ok).toBe(false);
    if (!gate.ok) {
      expect(gate.pool.length).toBeLessThan(QUIZ_MIN_SEEN);
    }
  });

  it('allows starting when enough seen words exist', () => {
    const rich: ShownYearByWordId = {};
    for (const entry of catalogs.beginner.slice(0, QUIZ_MIN_SEEN)) {
      rich[entry.id] = 6;
    }
    const gate = canStartSeenQuiz('beginner', rich);
    expect(gate.ok).toBe(true);
  });
});

describe('question generation', () => {
  it('builds four unique choices with one correct answer', () => {
    const correct = catalogs.beginner[10]!;
    const question = buildQuestion(correct, 'beginner', () => 0.42);
    expect(question).not.toBeNull();
    expect(question!.choices).toHaveLength(4);
    const words = question!.choices.map((c) => c.word);
    expect(new Set(words).size).toBe(4);
    expect(question!.choices[question!.correctIndex]?.wordId).toBe(correct.id);
  });

  it('does not repeat a word within a session', () => {
    const used = new Set<string>();
    const first = nextQuestion({
      quizType: 'random',
      level: 'beginner',
      shown: {},
      usedWordIds: used,
      random: () => 0.1,
    });
    expect(first).not.toBeNull();
    used.add(first!.correct.id);
    const second = nextQuestion({
      quizType: 'random',
      level: 'beginner',
      shown: {},
      usedWordIds: used,
      random: () => 0.2,
    });
    expect(second).not.toBeNull();
    expect(second!.correct.id).not.toBe(first!.correct.id);
  });
});

describe('scoreSession', () => {
  it('computes totals and percent', () => {
    const fakeQuestion = {
      correct: catalogs.beginner[0]! as WordEntry,
      choices: [
        { wordId: 'a', word: 'a' },
        { wordId: 'b', word: 'b' },
        { wordId: 'c', word: 'c' },
        { wordId: 'd', word: 'd' },
      ],
      correctIndex: 0,
    };
    const answers: QuizAnswerRecord[] = [
      { question: fakeQuestion, selectedIndex: 0, correct: true },
      { question: fakeQuestion, selectedIndex: 1, correct: false },
    ];
    expect(scoreSession(answers)).toEqual({
      total: 2,
      correct: 1,
      incorrect: 1,
      percent: 50,
    });
  });
});

describe('mergeDayReport', () => {
  it('accumulates answers across sessions on the same day', () => {
    const now = new Date('2026-07-28T12:00:00');
    const fakeQuestion = {
      correct: catalogs.beginner[0]! as WordEntry,
      choices: [
        { wordId: 'a', word: 'a' },
        { wordId: 'b', word: 'b' },
        { wordId: 'c', word: 'c' },
        { wordId: 'd', word: 'd' },
      ],
      correctIndex: 0,
    };
    const first = makeDayReport({
      quizType: 'random',
      level: 'beginner',
      answers: [{ question: fakeQuestion, selectedIndex: 0, correct: true }],
      now,
    });
    const second = makeDayReport({
      quizType: 'seen',
      level: 'intermediate',
      answers: [{ question: fakeQuestion, selectedIndex: 1, correct: false }],
      now,
    });
    const merged = mergeDayReport(first, second);
    expect(merged.total).toBe(2);
    expect(merged.correct).toBe(1);
    expect(merged.incorrect).toBe(1);
    expect(merged.answers).toHaveLength(2);
    expect(merged.quizType).toBe('seen');
    expect(merged.level).toBe('intermediate');
  });
});
