import type { ShownYearByWordId } from '../../domain/shownYear';
import type { DailyState, Level } from '../../domain/types';
import type { DailySnapshot } from '../../native/widgetBridge';
import type { ThemeColors } from '../../theme/themes';

export const LEVELS: Level[] = ['beginner', 'intermediate', 'hard'];

export const LEVEL_LABEL: Record<Level, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  hard: 'Hard',
};

export function randomInt(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive);
}

export function isLevel(value: unknown): value is Level {
  return value === 'beginner' || value === 'intermediate' || value === 'hard';
}

export function snapshotToState(snapshot: DailySnapshot): DailyState | null {
  if (
    !isLevel(snapshot.level) ||
    typeof snapshot.localDate !== 'string' ||
    typeof snapshot.wordId !== 'string' ||
    typeof snapshot.word !== 'string' ||
    typeof snapshot.oneLiner !== 'string'
  ) {
    return null;
  }
  const locked = {
    wordId: snapshot.wordId,
    word: snapshot.word,
    oneLiner: snapshot.oneLiner,
    example: '',
  };
  return {
    level: snapshot.level,
    localDate: snapshot.localDate,
    wordId: snapshot.wordId,
    word: snapshot.word,
    oneLiner: snapshot.oneLiner,
    example: '',
    byLevel: { [snapshot.level]: locked },
  };
}

/** Prefer primary's byLevel entries when both share the same localDate. */
export function mergeDailyStates(
  primary: DailyState | null,
  secondary: DailyState | null,
): DailyState | null {
  if (!primary) return secondary;
  if (!secondary) return primary;
  if (primary.localDate !== secondary.localDate) return primary;
  return {
    ...primary,
    byLevel: { ...secondary.byLevel, ...primary.byLevel },
  };
}

export function levelAccent(
  level: Level | string | null | undefined,
  colors: ThemeColors,
): string {
  switch (level) {
    case 'beginner':
      return colors.beginner;
    case 'intermediate':
      return colors.intermediate;
    case 'hard':
      return colors.hard;
    default:
      return colors.inkMuted;
  }
}

export type { ShownYearByWordId };
