/**
 * Back-compat barrel — prefer importing from `src/theme` or `./themes`.
 */
export type { ThemeColors, ThemePreference, ResolvedScheme } from './themes';
export {
  lightColors,
  darkColors,
  colors,
  colorsForScheme,
  colorsForPreference,
  resolveScheme,
} from './themes';
