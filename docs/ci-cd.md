# CI / CD (TestFlight + Play internal)

Dayink quality checks run on every pull request. **Store builds do not run on merge** — you start them manually so EAS free-plan quota lasts.

## What runs where

| Event | Workflow | What it does | Uses EAS? |
| --- | --- | --- | --- |
| Pull request | `CI` (`quality` job) | Parallel `typecheck` + `test` + `content:validate:strict`, then widget asset sync | No |
| Manual | `Release` → Run workflow | Same quality gate once, then iOS and/or Android EAS production build (optional auto-submit) | Yes |
| Push to `master` (`docs/privacy-policy.html`) or manual | `Deploy GitHub Pages` | Publishes privacy policy via Actions (Node 24-era actions) | No |

Release jobs start EAS with `--no-wait`. Watch progress at [expo.dev](https://expo.dev).

## When to run Release

Run **Actions → Release → Run workflow** only when you intentionally want a store binary, for example:

- A marketing version bump (`3.x.y` in `app.config.ts` / `package.json`) you want on TestFlight / Play internal
- A native/widget/signing change that Expo Go / local sim cannot prove
- First-time credential smoke after setting up Apple or Google submit keys

Do **not** run it for docs-only merges, CI tweaks, or pure JS/UI PRs you can verify with `npm test` / a local build.

**Inputs**

- `platform`: `both` · `ios` · `android` — build only what you need (saves the other platform’s quota)
- `auto_submit`: default `true`. Set `false` to build only (useful while finishing Play service-account setup)

## Saving EAS budget

Free Expo plans give a small monthly pool of cloud builds (especially iOS). Practical habits:

1. **Never auto-build on every `master` push** — this workflow is manual only.
2. **Prefer one platform per run** when only that store changed.
3. **Day-to-day:** simulator / device with `npx expo run:ios` / `run:android` (or Expo Go for JS-only). No EAS cost.
4. **Optional:** `eas build -p android --local` on a machine with Android SDK — uses your CPU, not Expo cloud minutes (still needs local JDK/SDK setup).
5. **Batch store drops** — merge several app PRs, then one Release when ready to ship to testers.
6. **iOS quota resets monthly** on the free plan; if you hit the cap, wait for reset or upgrade billing.

## Design goals

- **Fast PR evidence:** one Node 24 install, then typecheck/tests/catalogs in parallel (~seconds of CPU after `npm ci`).
- **Required check:** protect `master` and require the GitHub check **`quality`** before merge.
- **Deliberate releases:** EAS is for store binaries, not for every merge.

## One-time setup

1. **Expo project** — from the repo root (logged into Expo CLI):

   ```bash
   npx eas-cli@21.0.2 init
   ```

   Commit the generated `extra.eas.projectId` in `app.config.ts` when `eas init` writes it.

2. **Apple credentials in EAS** — for bundle id `com.dayink.app`:

   ```bash
   npx eas-cli@21.0.2 credentials -p ios
   ```

3. **Google Play submit credentials in EAS** — Android **keystore for builds is already on EAS**. Auto-submit still needs a **Google Service Account** JSON for Play.

   **Where the JSON comes from (Google Cloud, not Expo):**

   1. Open [Google Cloud → Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts) (create a project first if needed).
   2. **Create Service Account** (e.g. `dayink-play-submit`) → **Create and continue** → skip optional roles → **Done**.
   3. Open that account → **Keys** → **Add key** → **Create new key** → **JSON** → download the file (keep it off git; Downloads is fine).
   4. Enable [Google Play Android Developer API](https://console.cloud.google.com/apis/library/androidpublisher.googleapis.com) for the same Cloud project.
   5. In [Play Console → Users and permissions](https://play.google.com/console/users-and-permissions), **Invite new users** with the service account email (`…@….iam.gserviceaccount.com`). Grant app access for Dayink plus Releases permissions (testing tracks / production as needed). Accept the invite.
   6. Upload the JSON to EAS:

   ```bash
   npx eas-cli@21.0.2 credentials -p android
   ```

   Choose **Google Service Account** → **Upload a Google Service Account Key** → path to the downloaded JSON  
   (or upload under [project credentials](https://expo.dev/accounts/chintuvedanth/projects/dayink/credentials)).

   Full walkthrough with screenshots: [Expo service-account guide](https://github.com/expo/fyi/blob/main/creating-google-service-account.md).

   Privacy policy: `https://vedanthvdev.github.io/Dayink/privacy-policy.html`.

4. **GitHub secret** — repository secret `EXPO_TOKEN`.

5. **Branch protection** — default branch is **`master`**. Require check **`quality`**.

6. **GitHub Pages** — Settings → Pages → Source = **GitHub Actions** (not “Deploy from a branch”). That stops the legacy `pages-build-deployment` Node 20 warning. Privacy URL: `https://vedanthvdev.github.io/Dayink/privacy-policy.html`.

7. **Smoke** — open a PR (green quality), merge, then manually run **Release** (`android` first with `auto_submit` once the key is uploaded).

## Day-to-day

1. Open a PR and wait for green **quality**.
2. Merge to `master` (no EAS).
3. When you want testers to get a build: **Actions → Release → Run workflow**.
4. Smoke on TestFlight / Play internal; promote manually when ready.

Bump marketing `version` in `app.config.ts` / `package.json` for store-facing releases. Build numbers auto-increment via EAS.

## Failure notes

- Missing `EXPO_TOKEN` → release job fails fast.
- iOS: free-plan monthly build quota exhausted → wait for reset or upgrade billing.
- Android submit: `Google Service Account Keys cannot be set up in --non-interactive mode` → upload the Play service-account key via `eas credentials` (step 3), then re-run Release.
- Pipeline green with `--no-wait` means EAS accepted the request, not that the binary is installable yet.
