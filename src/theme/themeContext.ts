import { createContext } from 'react';
import type { ThemeColors, ThemePreference, ResolvedScheme } from './themes';

export type ThemeContextValue = {
  colors: ThemeColors;
  preference: ThemePreference;
  scheme: ResolvedScheme;
  isDark: boolean;
  setPreference: (next: ThemePreference) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);
