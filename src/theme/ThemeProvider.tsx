import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import {
  loadThemePreference,
  saveThemePreference,
} from '../storage/appPreferences';
import { ThemeContext, type ThemeContextValue } from './themeContext';
import {
  colorsForPreference,
  resolveScheme,
  type ThemePreference,
} from './themes';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    let cancelled = false;
    void loadThemePreference().then((saved) => {
      if (!cancelled && saved) setPreferenceState(saved);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    void saveThemePreference(next).catch(() => {
      // Preference still applies in-memory; persist can retry next change.
    });
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const scheme = resolveScheme(preference, systemScheme);
    return {
      colors: colorsForPreference(preference, systemScheme),
      preference,
      scheme,
      isDark: scheme === 'dark',
      setPreference,
    };
  }, [preference, systemScheme, setPreference]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
