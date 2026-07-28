import { brand } from './tokens';

export type ThemeColors = {
  background: string;
  backgroundAccent: string;
  backgroundDeep: string;
  ink: string;
  inkMuted: string;
  beginner: string;
  intermediate: string;
  hard: string;
  beginnerSoft: string;
  intermediateSoft: string;
  hardSoft: string;
  buttonText: string;
  chipIdle: string;
  chipIdleText: string;
  surface: string;
  surfaceBorder: string;
  tip: string;
  wash: string;
  selectedBorder: string;
  gradient: [string, string, string];
};

/** Follow OS, or force a scheme. */
export type ThemePreference = 'system' | 'light' | 'dark';

export type ResolvedScheme = 'light' | 'dark';

export const lightColors: ThemeColors = {
  background: brand.paper.light,
  backgroundAccent: brand.paper.lightAccent,
  backgroundDeep: brand.paper.lightDeep,
  ink: brand.ink.onLight,
  inkMuted: brand.ink.mutedOnLight,
  beginner: brand.green.light,
  intermediate: brand.amber.light,
  hard: brand.rose.light,
  beginnerSoft: brand.green.softLight,
  intermediateSoft: brand.amber.softLight,
  hardSoft: brand.rose.softLight,
  buttonText: brand.ink.onLight,
  chipIdle: 'rgba(26, 38, 32, 0.06)',
  chipIdleText: brand.ink.chipTextOnLight,
  surface: 'rgba(255, 253, 248, 0.78)',
  surfaceBorder: 'rgba(26, 38, 32, 0.08)',
  tip: brand.ink.tipOnLight,
  wash: 'rgba(26, 38, 32, 0.12)',
  selectedBorder: brand.ink.onLight,
  gradient: [brand.paper.light, brand.paper.lightAccent, brand.paper.lightDeep],
};

export const darkColors: ThemeColors = {
  background: brand.paper.dark,
  backgroundAccent: brand.paper.darkAccent,
  backgroundDeep: brand.paper.darkDeep,
  ink: brand.ink.onDark,
  inkMuted: brand.ink.mutedOnDark,
  beginner: brand.green.dark,
  intermediate: brand.amber.dark,
  hard: brand.rose.dark,
  beginnerSoft: brand.green.softDark,
  intermediateSoft: brand.amber.softDark,
  hardSoft: brand.rose.softDark,
  buttonText: brand.paper.dark,
  chipIdle: 'rgba(239, 244, 240, 0.08)',
  chipIdleText: brand.ink.chipTextOnDark,
  surface: 'rgba(28, 38, 33, 0.72)',
  surfaceBorder: 'rgba(239, 244, 240, 0.1)',
  tip: brand.ink.tipOnDark,
  wash: 'rgba(239, 244, 240, 0.14)',
  selectedBorder: brand.ink.onDark,
  gradient: [brand.paper.dark, brand.paper.darkAccent, brand.paper.darkDeep],
};

/** @deprecated Prefer `lightColors` / `useTheme().colors`. Kept for older imports. */
export const colors = lightColors;

export function resolveScheme(
  preference: ThemePreference,
  systemScheme: string | null | undefined,
): ResolvedScheme {
  if (preference === 'light') return 'light';
  if (preference === 'dark') return 'dark';
  return systemScheme === 'dark' ? 'dark' : 'light';
}

export function colorsForScheme(
  scheme: string | null | undefined,
): ThemeColors {
  return scheme === 'dark' ? darkColors : lightColors;
}

export function colorsForPreference(
  preference: ThemePreference,
  systemScheme: string | null | undefined,
): ThemeColors {
  return colorsForScheme(resolveScheme(preference, systemScheme));
}
