# Dayink architecture

Version target: **3.1.0** (structure only; product behavior unchanged).

## Purpose

Dayink is a daily vocab app (Home word-of-the-day, History, Quiz). This document describes how code is organized so new screens and modes land in one obvious place without growing god-files.

## Layers

| Layer | Location | Responsibility | Forbidden |
|---|---|---|---|
| Domain | `src/domain/` | Pure rules, types, scoring, catalog | React Native, storage, navigation |
| Storage | `src/storage/` | AsyncStorage load/save + normalize | Business decisions |
| Native | `src/native/` | Widget bridge / platform APIs | UI layout |
| Features | `src/features/<name>/` | Feature hooks + screens + feature UI | Importing other features’ internals |
| Shared UI | `src/ui/` | Reusable presentational components | Feature state machines |
| Navigation | `src/navigation/` | Native stack + thin route wiring | Business logic |
| Providers | `src/providers/` | Cross-screen app state (e.g. shown-year map) | Screen markup |
| Theme / audio | `src/theme/`, `src/audio/` | Cross-cutting presentation helpers | Feature orchestration |

**Theming:** edit `src/theme/tokens.ts` (brand primitives), then `src/theme/themes.ts` (light/dark semantic roles). Screens use `useThemeColors()` / `useTheme()`. Force scheme with `useTheme().setPreference('light' | 'dark' | 'system')` (persisted; default `system`).

**Dependency direction:** `features` → `domain` / `storage` / `ui` / `providers` / `theme`. Never `domain` → `features`.

## Features

- **`home`** — today’s word, level pick, overnight refresh, widget sync
- **`history`** — year unlock list
- **`quiz`** — daily quiz session (see `#26`): `useQuizSession` + phase views

Each feature owns an entry screen (or re-exports one) and may own `components/`, `hooks/`, and local types.

## Navigation

React Navigation **native stack** (`Home` → push `History` | `Quiz`).

- Home stays under pushed screens so in-memory daily state survives.
- iOS left-edge back only (`fullScreenGestureEnabled: false`; required on iOS 26+).
- Quiz mid-run pop pauses via `beforeRemove` (then leaves).

Routes stay thin: map navigation to screen props / provider data. No quiz/home rules in the navigator.

## Shared app state

`ShownYearProvider` holds `shownYearByWordId` updated by Home and read by History/Quiz so the navigator does not thread that prop through every route.

## Testing

- **Domain** — pure unit tests (existing + any newly extracted pure helpers).
- **Quiz session** — pure transition helpers and orchestration units extracted from the hook (abandon-at-limit, day-report merge inputs, leave gates).
- Prefer vitest; no behavior change means golden paths should keep passing without UI snapshot churn.

## Adding something new

1. Put rules in `domain/` (+ tests).
2. Put persistence in `storage/` if needed.
3. Add or extend a `features/<name>/` hook + views.
4. Wire a stack screen only if it is a new route.
5. Do not grow an existing screen past a thin shell that switches on phase/state from a hook.

## Related

- Issue: Quiz maintainability — https://github.com/vedanthvdev/Dayink/issues/26
- Design: `docs/superpowers/specs/2026-07-28-architecture-3.1-design.md`
