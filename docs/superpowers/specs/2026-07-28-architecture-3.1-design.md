# Architecture 3.1.0 — app structure & Quiz maintainability

**Status:** Approved for implementation (Approach 1; keep native stack).  
**Version:** `3.0.1` → `3.1.0`  
**Constraint:** Product behavior, copy, and flows unchanged.

## Summary

Reorganize Dayink into feature modules with clear layering, introduce a `ShownYearProvider`, split `QuizScreen` per #26 (`useQuizSession` + phase components + shared answer UI), lightly modularize Home, document architecture, and add tests around session transition helpers.

## Non-goals

- Expo Router migration
- New quiz modes or Home features
- Visual redesign
- Changing edge-swipe / pause-on-leave semantics

## Structure

See `docs/architecture.md`.

### Quiz (`src/features/quiz/`)

- `useQuizSession.ts` — state machine + persistence + `beforeRemove`
- Phase views: home / playing / review / results
- `QuizAnswerChoices` + `QuizFeedbackMessage` shared between playing and review
- Pure helpers extracted for tests (leave gates, orphan seal decisions where practical)

### Home (`src/features/home/`)

- `useHomeDaily.ts` — daily lock, level, shown-year, midnight refresh, widget sync
- `HomeScreen.tsx` — presentation shell

### History (`src/features/history/`)

- Thin screen; reads shown map from provider

### Navigation / providers

- Keep `@react-navigation/native-stack`
- `ShownYearProvider` removes prop drilling through `RootNavigator`
- Re-export shims from `src/screens/*` if useful for stable imports

## Testing

- Existing domain tests remain green
- New quiz helper / transition tests for: leave-without-pause gates, orphan seal conditions, merge inputs already covered in `quiz.test.ts` where possible

## Ship

- Single commit on `refactor/architecture-3.1.0`
- Close / reference #26 in PR
- Bump `package.json` + `app.config.ts` (+ lockfile root) to `3.1.0`
