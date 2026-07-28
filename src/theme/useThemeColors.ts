import { useContext } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeContext } from './themeContext';
import { colorsForScheme, type ThemeColors } from './themes';

/**
 * Semantic colors for the active scheme.
 * Inside `ThemeProvider`, respects persisted preference (system/light/dark).
 * Outside it, follows the OS color scheme.
 */
export function useThemeColors(): ThemeColors {
  const ctx = useContext(ThemeContext);
  const system = useColorScheme();
  if (ctx) return ctx.colors;
  return colorsForScheme(system);
}

export function useIsDark(): boolean {
  const ctx = useContext(ThemeContext);
  const system = useColorScheme();
  if (ctx) return ctx.isDark;
  return system === 'dark';
}
