# Dayink — Google Play Console listing copy

Use these values in Google Play Console for package `com.dayink.app` (developer account `chintudon123@gmail.com`).

CI auto-submits production AABs to the **internal testing** track on every `master` merge. Promoting to **Production** stays manual in Play Console. See [ci-cd.md](./ci-cd.md).

## App details

| Field | Value |
| --- | --- |
| App name | Dayink |
| Package name | com.dayink.app |
| Default language | English (United States) |
| App category | Education |
| Tags (optional) | Vocabulary, Education, Word of the day |
| Free / paid | Free |
| Ads | No |
| In-app purchases | None |
| Contact email | chintudon123@gmail.com |

## Short description (80 characters max)

```
One calm word a day. Pick your pace — offline, no ads, home-screen widget.
```

## Full description

```
Dayink is a quiet daily vocabulary ritual.

Each day you get one word with a short, plain explanation. Choose Beginner, Intermediate, or Hard, then add the Dayink widget to your home screen so today’s word is waiting when you glance at your phone.

• One locked word per day — no endless scrolling
• Three difficulty levels
• On-device History of words you’ve seen this year
• Home screen widget (lock screen where your device supports it)
• Fully offline — no account, no ads, no tracking

Progress stays on your device. Open Dayink, pick a level, and let one good word settle in.
```

## What’s new (2.0.0)

```
Example sentences on today’s word, refreshed level catalogs, and pronunciation for the daily word.
```

## Privacy policy URL (required)

**Privacy policy URL (live):** [https://vedanthvdev.github.io/Dayink/privacy-policy.html](https://vedanthvdev.github.io/Dayink/privacy-policy.html)

Hosted via GitHub Pages from `docs/privacy-policy.html` (same as App Store). Paste this into Play Console → App content → Privacy policy.

Suggested support / contact: **chintudon123@gmail.com**

## Data safety

| Question | Answer |
| --- | --- |
| Does the app collect or share user data? | **No** |
| Data collected / shared | None |
| Encryption in transit | Not applicable (no user data leaves the device) |
| Users can request deletion | Delete the app to remove on-device data |
| Notes | Level, today’s word, and shown-year stamps stay on device only (AsyncStorage + SharedPreferences). No analytics/ads SDKs. |

## Content rating

Complete the IARC questionnaire in Play Console. Expected outcome for an offline vocabulary app with no user-generated content, violence, or gambling: suitable for general audiences / low age rating. Dayink is not marketed as a children’s app.

## Target audience and content

| Field | Value |
| --- | --- |
| Target age | 13+ (or as questionnaire directs; not primarily for children) |
| Appeal to children | No |
| News / COVID / etc. | No |

## Store graphics

| Asset | Notes |
| --- | --- |
| App icon | Use the adaptive icon from `assets/android-icon-*.png` / Play Console hi-res icon (512×512) |
| Feature graphic | 1024×500 required for Production; create once before public launch |
| Phone screenshots | At least **2** required; 16:9 or 9:16; between 320px and 3840px on each side |

Suggested phone shots (capture on emulator or device after a store/internal build):

1. Home — today’s word card with level chooser and Dayink brand  
2. Today’s word with example sentence  
3. History screen  
4. Optional: dark mode  
5. Optional: home-screen widget

## One-time Play Console bootstrap

Logged in as **chintudon123@gmail.com**:

1. Create app **Dayink** with package **`com.dayink.app`** if it does not exist.
2. Set privacy policy URL, Data safety, content rating, and phone screenshots.
3. Create a Google Cloud service account JSON key, enable **Google Play Android Developer API**, invite the service account in Play Console with release/testing permissions, upload the key to EAS (`eas credentials -p android`). Details: [Expo service-account guide](https://github.com/expo/fyi/blob/main/creating-google-service-account.md).
4. Upload the **first** production `.aab` manually to Internal testing (Play often requires this before API submits).
5. Confirm GitHub secret `EXPO_TOKEN` exists; thereafter every `master` merge runs **Release Android (Play internal)** and auto-submits to the internal track.
6. When ready for the public: Play Console → promote the internal release → **Production**.

## Review notes (for Play if asked)

```
Dayink is an offline vocabulary utility. Pick Beginner, Intermediate, or Hard to lock one word for today. History lists words unlocked this year. Add the Dayink home-screen widget after choosing a level.

No account, no network features for user content, no purchases.
Demo account: not applicable.
```
