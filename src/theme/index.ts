/**
 * Theme entry points.
 *
 * To retheme Dayink:
 * 1. Edit brand primitives in `tokens.ts`
 * 2. Adjust semantic roles in `themes.ts` (`lightColors` / `darkColors`) if needed
 * 3. Screens already read colors via `useThemeColors()` / `useTheme()`
 *
 * Force light/dark (or follow system) with `useTheme().setPreference('light' | 'dark' | 'system')`.
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
export { brand, nativeChrome } from './tokens';
export { ThemeProvider, useTheme } from './ThemeProvider';
export { useThemeColors, useIsDark } from './useThemeColors';
export { fonts } from './typography';
