import {
  remainingQuestionsToday,
  type QuizDailyUsage,
  type QuizPausedSession,
} from '../../domain/quiz';
import type { Phase, ReviewReturnPhase } from './types';

/**
 * True when popping the screen needs no paused snapshot: nothing is in flight,
 * or the user is only reviewing a finished run.
 */
export function canLeaveQuizWithoutPausing(
  phase: Phase,
  reviewReturnPhase: ReviewReturnPhase,
): boolean {
  return (
    phase === 'home' ||
    phase === 'results' ||
    (phase === 'review' &&
      (reviewReturnPhase === 'results' || reviewReturnPhase === 'home'))
  );
}

/** Seal a leftover paused run only when idle on quiz home (not mid-question). */
export function shouldSealOrphanedPaused(opts: {
  sealOrphanedPaused?: boolean;
  usage: QuizDailyUsage | null;
  paused: QuizPausedSession | null;
}): boolean {
  return Boolean(
    opts.sealOrphanedPaused &&
      remainingQuestionsToday(opts.usage) <= 0 &&
      opts.paused &&
      opts.paused.answers.length > 0,
  );
}
