# Theming

## Change colors

1. **Brand primitives** — `src/theme/tokens.ts` (`brand.green`, `brand.paper`, …)
2. **Semantic light/dark roles** — `src/theme/themes.ts` (`lightColors` / `darkColors`)
3. UI already consumes `useThemeColors()` — no screen edits needed for a palette swap

## Light / dark

- Default: follow the OS (`preference: 'system'`).
- Force a scheme (persisted):

```ts
const { setPreference, preference, isDark, colors } = useTheme();
setPreference('dark'); // or 'light' | 'system'
```

Wire `setPreference` into a Settings UI whenever you add one; storage key is `dayink.themePreference`.

## Native chrome

Keep `app.config.ts` splash / Android icon backgrounds aligned with `nativeChrome` in `tokens.ts` when you rebrand.
