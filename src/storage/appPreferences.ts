import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DailyState, Level, LockedWord } from '../domain/types';
import type { ShownYearByWordId, YearDigit } from '../domain/shownYear';
import type { ThemePreference } from '../theme/themes';

const LEVEL_KEY = 'dayink.level';
const STATE_KEY = 'dayink.dailyState';
const SHOWN_KEY = 'dayink.shownYearByWordId';
const THEME_KEY = 'dayink.themePreference';

function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

function isLevel(value: unknown): value is Level {
  return value === 'beginner' || value === 'intermediate' || value === 'hard';
}

function isLockedWord(value: unknown): value is LockedWord {
  if (!value || typeof value !== 'object') return false;
  const locked = value as Record<string, unknown>;
  return (
    typeof locked.wordId === 'string' &&
    typeof locked.word === 'string' &&
    typeof locked.oneLiner === 'string' &&
    (typeof locked.example === 'string' || locked.example === undefined)
  );
}

function withExample(locked: LockedWord): LockedWord {
  return {
    ...locked,
    example: typeof locked.example === 'string' ? locked.example : '',
  };
}

function isYearDigit(value: unknown): value is YearDigit {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 9;
}

function normalizeShownMap(value: unknown): ShownYearByWordId {
  if (!value || typeof value !== 'object') return {};
  const out: ShownYearByWordId = {};
  for (const [wordId, digit] of Object.entries(value as Record<string, unknown>)) {
    if (typeof wordId === 'string' && wordId.length > 0 && isYearDigit(digit)) {
      out[wordId] = digit;
    }
  }
  return out;
}

function normalizeDailyState(value: unknown): DailyState | null {
  if (!value || typeof value !== 'object') return null;
  const state = value as Record<string, unknown>;
  if (
    !isLevel(state.level) ||
    typeof state.localDate !== 'string' ||
    typeof state.wordId !== 'string' ||
    typeof state.word !== 'string' ||
    typeof state.oneLiner !== 'string'
  ) {
    return null;
  }

  const byLevel: Partial<Record<Level, LockedWord>> = {};
  if (state.byLevel && typeof state.byLevel === 'object') {
    for (const [key, locked] of Object.entries(state.byLevel as Record<string, unknown>)) {
      if (isLevel(key) && isLockedWord(locked)) {
        byLevel[key] = withExample(locked);
      }
    }
  }

  const example =
    typeof state.example === 'string' ? state.example : '';
  const active: LockedWord = withExample({
    wordId: state.wordId,
    word: state.word,
    oneLiner: state.oneLiner,
    example,
  });
  if (!byLevel[state.level]) {
    byLevel[state.level] = active;
  }

  return {
    localDate: state.localDate,
    level: state.level,
    wordId: state.wordId,
    word: state.word,
    oneLiner: state.oneLiner,
    example: active.example,
    byLevel,
  };
}

export async function loadLevel(): Promise<Level | null> {
  const value = await AsyncStorage.getItem(LEVEL_KEY);
  return isLevel(value) ? value : null;
}

export async function saveLevel(level: Level): Promise<void> {
  await AsyncStorage.setItem(LEVEL_KEY, level);
}

export async function loadDailyState(): Promise<DailyState | null> {
  const raw = await AsyncStorage.getItem(STATE_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return normalizeDailyState(parsed);
  } catch {
    return null;
  }
}

export async function saveDailyState(state: DailyState): Promise<void> {
  await AsyncStorage.setItem(STATE_KEY, JSON.stringify(state));
}

export async function loadShownYearByWordId(): Promise<ShownYearByWordId> {
  const raw = await AsyncStorage.getItem(SHOWN_KEY);
  if (!raw) return {};
  try {
    return normalizeShownMap(JSON.parse(raw));
  } catch {
    return {};
  }
}

export async function saveShownYearByWordId(shown: ShownYearByWordId): Promise<void> {
  await AsyncStorage.setItem(SHOWN_KEY, JSON.stringify(shown));
}

export async function loadThemePreference(): Promise<ThemePreference | null> {
  const raw = await AsyncStorage.getItem(THEME_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isThemePreference(parsed) ? parsed : null;
  } catch {
    return isThemePreference(raw) ? raw : null;
  }
}

export async function saveThemePreference(preference: ThemePreference): Promise<void> {
  await AsyncStorage.setItem(THEME_KEY, JSON.stringify(preference));
}
