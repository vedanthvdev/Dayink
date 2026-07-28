import { describe, expect, it } from 'vitest';
import type { DailyState } from '../../domain/types';
import { mergeDailyStates, snapshotToState, isLevel } from './homeHelpers';

const base = (over: Partial<DailyState> = {}): DailyState => ({
  level: 'beginner',
  localDate: '2026-07-28',
  wordId: 'a',
  word: 'alpha',
  oneLiner: 'a tip',
  example: '',
  byLevel: {
    beginner: { wordId: 'a', word: 'alpha', oneLiner: 'a tip', example: '' },
  },
  ...over,
});

describe('isLevel', () => {
  it('accepts known levels only', () => {
    expect(isLevel('beginner')).toBe(true);
    expect(isLevel('hard')).toBe(true);
    expect(isLevel('expert')).toBe(false);
  });
});

describe('mergeDailyStates', () => {
  it('returns the other side when one is null', () => {
    const a = base();
    expect(mergeDailyStates(a, null)).toBe(a);
    expect(mergeDailyStates(null, a)).toBe(a);
    expect(mergeDailyStates(null, null)).toBeNull();
  });

  it('keeps primary when local dates differ', () => {
    const primary = base({ localDate: '2026-07-28' });
    const secondary = base({
      localDate: '2026-07-27',
      wordId: 'b',
      word: 'beta',
    });
    expect(mergeDailyStates(primary, secondary)).toEqual(primary);
  });

  it('merges byLevel with primary winning keys', () => {
    const primary = base({
      byLevel: {
        beginner: { wordId: 'a', word: 'alpha', oneLiner: 'a', example: '' },
        intermediate: {
          wordId: 'i1',
          word: 'from-primary',
          oneLiner: 'p',
          example: '',
        },
      },
    });
    const secondary = base({
      byLevel: {
        beginner: { wordId: 'z', word: 'other', oneLiner: 'z', example: '' },
        intermediate: {
          wordId: 'i2',
          word: 'from-secondary',
          oneLiner: 's',
          example: '',
        },
        hard: { wordId: 'h', word: 'hard', oneLiner: 'h', example: '' },
      },
    });
    const merged = mergeDailyStates(primary, secondary)!;
    expect(merged.byLevel.beginner?.word).toBe('alpha');
    expect(merged.byLevel.intermediate?.word).toBe('from-primary');
    expect(merged.byLevel.hard?.word).toBe('hard');
  });
});

describe('snapshotToState', () => {
  it('maps a valid native snapshot', () => {
    const state = snapshotToState({
      level: 'hard',
      localDate: '2026-07-28',
      wordId: 'w1',
      word: 'Word',
      oneLiner: 'tip',
    });
    expect(state?.level).toBe('hard');
    expect(state?.byLevel.hard?.word).toBe('Word');
    expect(state?.example).toBe('');
  });

  it('rejects invalid snapshots', () => {
    expect(
      snapshotToState({
        level: 'nope',
        localDate: '2026-07-28',
        wordId: 'w1',
        word: 'Word',
        oneLiner: 'tip',
      }),
    ).toBeNull();
  });
});
