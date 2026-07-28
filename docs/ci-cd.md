# CI / CD (TestFlight + Play internal)

Dayink quality checks run on every pull request. Merges to **`master`** kick off production EAS builds that auto-submit to **TestFlight** (iOS) and **Play Console internal testing** (Android). Promoting to App Store / Play production stays manual.

## What runs where

| Event | Workflow | What it does |
| --- | --- | --- |
| Pull request | `CI` (`quality` job) | Parallel `typecheck` + `test` + `content:validate:strict`, then widget asset sync |
| Push to `master` | `Release` | Same quality gate **once**, then iOS + Android EAS production build/submit in parallel |
| Manual | `CI` or `Release` → Run workflow | Re-run gate or release without a new commit |

Release jobs start EAS with `--no-wait`. Watch progress at [expo.dev](https://expo.dev).

## Design goals

- **Fast PR evidence:** one Node install, then typecheck/tests/catalogs in parallel (~seconds of CPU after `npm ci`).
- **No triple quality on merge:** releases no longer each re-run a separate quality job; CI does not also fire on `master` push.
- **Required check:** protect `master` and require the GitHub check **`quality`** before merge.

## One-time setup

1. **Expo project** — from the repo root (logged into Expo CLI):

   ```bash
   npx eas-cli@21.0.2 init
   ```

   Commit the generated `extra.eas.projectId` in `app.config.ts` when `eas init` writes it.

2. **Apple credentials in EAS** — for bundle id `com.dayink.app`:

   ```bash
   npx eas-cli@21.0.2 credentials
   ```

3. **Google Play credentials in EAS** — for package `com.dayink.app` (see prior Play Console notes in git history / store docs). Privacy policy: `https://vedanthvdev.github.io/Dayink/privacy-policy.html`.

4. **GitHub secret** — repository secret `EXPO_TOKEN`.

5. **Branch protection** — default branch is **`master`**. Require check **`quality`**.

6. **Smoke** — open a PR (green quality), merge to `master`, confirm EAS on expo.dev and TestFlight / Play internal.

## Day-to-day

1. Open a PR and wait for green **quality**.
2. Merge to `master`.
3. Wait for EAS build + submit.
4. Smoke on TestFlight / Play internal; promote manually when ready.

Bump marketing `version` in `app.config.ts` / `package.json` for store-facing releases. Build numbers auto-increment via EAS.

## Failure notes

- Missing `EXPO_TOKEN` → release job fails fast.
- Missing EAS project / store credentials → fix with `eas init` / `eas credentials`, re-run **Release**.
- Pipeline green with `--no-wait` means EAS accepted the request, not that the binary is installable yet.
