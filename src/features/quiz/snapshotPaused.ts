import type {
  QuizAnswerRecord,
  QuizPausedSession,
  QuizQuestion,
  QuizType,
} from '../../domain/quiz';
import type { Level } from '../../domain/types';
import type { ActivePhase } from './types';

export function snapshotPaused(input: {
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
