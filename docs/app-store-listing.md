# Dayink — App Store Connect listing copy

Use these values in App Store Connect for app `6791973720` (bundle `com.dayink.app`).

## App Information

| Field | Value |
| --- | --- |
| Name | Dayink |
| Subtitle (30 chars max) | One quiet word each day |
| Bundle ID | com.dayink.app |
| SKU | dayink-ios |
| Primary language | English (U.S.) |
| Category (primary) | Education |
| Category (secondary) | Reference |
| Content rights | Does not use third-party content that requires rights clearance beyond the in-app word list you own/curate |
| Age rating | 12+ (not a children’s app; enrichment vocabulary) |

## Pricing

| Field | Value |
| --- | --- |
| Price | Free |
| In-App Purchases | None |

## Version 1.0 — English (U.S.)

**Promotional text** (170 chars, optional, editable anytime):

```
One calm word a day on your Lock Screen. Pick Beginner, Intermediate, or Hard — no accounts, no ads, nothing leaves your phone.
```

**Description:**

```
Dayink is a quiet daily vocabulary ritual.

Each day you get one word with a short, plain explanation. Choose Beginner, Intermediate, or Hard, then add the Dayink widget to your Lock Screen so today’s word is waiting when you glance at your phone.

• One locked word per day — no endless scrolling
• Three difficulty levels
• On-device History of words you’ve seen this year
• Lock Screen / home screen widget
• Fully offline — no account, no ads, no tracking

Progress stays on your device. Open Dayink, pick a level, and let one good word settle in.
```

**Keywords** (100 characters max, comma-separated, no spaces after commas preferred):

```
vocabulary,word of the day,english,learning,lock screen,widget,dictionary,study,offline
```

**What's New** (1.0):

```
First release of Dayink — daily vocabulary with Lock Screen widget, three levels, and on-device history.
```

**Support URL:** `mailto:chintudon123@gmail.com` is not ideal; prefer a page. Temporary: host `docs/privacy-policy.html` (same contact) or use:

```
https://github.com/vedanthvdev/Dayink
```

Better: publish `docs/privacy-policy.html` via GitHub Pages and reuse that site root as Support URL.

**Marketing URL:** leave blank (optional)

**Privacy Policy URL:** `https://vedanthvdev.github.io/Dayink/privacy-policy.html` (GitHub Pages from `docs/privacy-policy.html`).

## App Privacy (nutrition labels)

| Question | Answer |
| --- | --- |
| Data collected? | **Data Not Collected** |
| Tracking? | No |
| Notes | Level, today’s word, and shown-year stamps stay on device only (AsyncStorage + App Group). No analytics/ads SDKs. |

## App Review Information

**Sign-in required:** No  

**Contact:**

- First name: Vedanth  
- Last name: Vasu Dev  
- Phone: (add your number in Connect)  
- Email: chintudon123@gmail.com  

**Notes:**

```
Dayink is an offline vocabulary utility. Pick Beginner, Intermediate, or Hard to lock one word for today. History lists words unlocked this year. On iOS, add the Dayink Lock Screen widget after choosing a level.

No account, no network features, no purchases.
Demo account: not applicable.
```

**Attachment:** none required.

## Export compliance

| Field | Value |
| --- | --- |
| Uses encryption | No (exempt / standard encryption only) |
| Matches Info.plist | ITSAppUsesNonExemptEncryption = false |

## Screenshots (required — cannot invent)

Capture on a physical device or Simulator after install from TestFlight:

| Device class | Typical size |
| --- | --- |
| iPhone 6.7" / 6.9" | required for modern submissions |
| iPhone 6.5" | often still required or accepted as alternate |

Suggested shots (3–5):

1. Home — level chooser with Dayink brand  
2. Today’s word card after choosing a level  
3. History screen  
4. Lock Screen with Dayink widget (Simulator Lock Screen customize)  
5. Optional: Intermediate/Hard contrast

## What this repo cannot push without you

App Store Connect metadata API needs an **App Store Connect API Key** (Issuer ID, Key ID, `.p8`). EAS holds a key for submit, but this environment does not have the `.p8` file to edit listing fields automatically.

After you add screenshots + privacy URL in Connect (or provide API key files), the listing text above is ready to paste or script.
