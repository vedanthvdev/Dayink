# Dayink

Simple Expo (React Native) app: pick **Beginner / Intermediate / Hard**, then see one random word per day on the lock screen with a one-line explanation.

## Status

| Area | State |
| --- | --- |
| Level chooser UI (animated) | Done |
| Daily random word domain + tests | Done |
| 1000×3 curated enrichment catalogs + validate | Done |
| Widget bridge (App Group / SharedPreferences) | Done |
| Android Glance widget + midnight worker | Done (needs native build) |
| iOS WidgetKit Lock Screen widget | Sources ready — add Xcode Widget Extension per `modules/widget-bridge/ios/WidgetExtension/WIDGET.md` |

## Requirements

- Node 20+
- Xcode + iOS Simulator (Mac) for `npm run ios`
- For lock-screen widgets: **dev client** / `expo prebuild` + native run. Expo Go runs the app UI; the local widget module is a safe no-op there.

## Scripts

```bash
npm install
npm start
npm run ios                       # Expo Go / simulator once Xcode is ready
npm run typecheck
npm test
npm run content:validate
npm run content:validate:strict   # count + quality + cross-level uniqueness
npm run content:sync              # copy JSON into Android + iOS widget assets
npm run content:build-beginner
npm run content:build-intermediate-hard
```

Catalog notes: `content/words/README.md`.

App Store submission notes: `docs/app-store-review-notes.md`.
CI / TestFlight release: `docs/ci-cd.md`.

## Where you can run what

| Environment | What works |
| --- | --- |
| **This Linux cloud workspace** | `npm start`, tests, Android (with Android SDK). **Not** `expo run:ios`. |
| **Your Mac + Xcode Simulator** | Full iOS app + WidgetKit extension. |
| **EAS cloud** | `npx eas build -p ios` if you do not have a Mac build machine. |

## iPhone Simulator (on a Mac only)

From the **repo root**:

```bash
cd /path/to/Dayink
npm install
export EXPO_APPLE_TEAM_ID=XXXXXXXXXX   # 10-char Team ID from Xcode → Settings → Accounts
npx expo prebuild -p ios
npx expo run:ios
```

Then: **Lock Screen → Customize → add Dayink**.

## Native widgets

iOS WidgetKit target: `targets/DayinkWidget/` (`@bacons/apple-targets`).

```bash
npm run content:sync
npx expo run:android              # Linux/Mac with Android SDK
```

Details: `targets/DayinkWidget/README.md`  
Learner tip copy: `docs/widget-setup.md`.
