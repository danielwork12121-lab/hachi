# Pet Bazi

A mobile-first MVP app that generates Bazi-inspired personality readings for your pet and compatibility between you and your pet. Built for an American audience with a modern, elegant, slightly mystical feel.

## Product summary

- **Pet reading**: Enter your pet’s birthday (and optional birth time) to get a personality profile with main/secondary elements, bonding style, and short interpretations.
- **Compatibility**: Enter your birthday to get a compatibility score, bond label, and relationship explanation with your pet.
- **Share**: Generate a styled result card suitable for Instagram story or screenshot.

The app uses simplified, Bazi-inspired logic (not traditional Bazi) and is positioned as entertainment and emotional insight, not prediction or medical/behavioral advice.

## Tech stack

- **React Native** with **Expo** (~51)
- **React Navigation** (native stack)
- **AsyncStorage** for persisting the last pet profile and last reading

## Project structure

```
├── App.js                    # Root: navigation + screens
├── app.json                  # Expo config
├── src/
│   ├── components/           # Reusable UI (forms, mascot, cosmic backdrop, pillar/reading display)
│   │   ├── Button.js, Card.js, FormSection.js, PremiumFormPanel.js, FeatureChip.js
│   │   ├── DateField(.web).js, TimeField(.web).js, SpeciesSelector.js
│   │   ├── ElementBadge.js, CompatibilityMeter.js, DailyInsight.js
│   │   ├── DayPillarColumn.js, ClickablePillarColumn.js, PillarGlyphsStack.js
│   │   ├── ReadingPageContent.js, ReadingSectionCard.js, ReportOrnament.js
│   │   ├── DogMascot.js, WelcomeMascot.js, PetAvatar.js
│   │   ├── CosmicScreenBackdrop.js, StarFieldBackground.js, WelcomeHeroBackdrop.js
│   │   ├── FateTileSpinner.js, RitualLoadingRing.js
│   │   └── ScreenContent.js, ScreenHeader.js, SectionBlock.js
│   ├── constants/
│   │   ├── colors.js, typography.js, layout.js, formStyles.js  # Design system
│   │   ├── elements.js        # Five elements, cycles, symbols
│   │   ├── kanjiDisplay.js     # Stem/branch kanji rendering
│   │   ├── petSpecies.js       # Supported species list
│   │   └── readingLayout.js
│   ├── data/                  # Copy libraries, keyed by pillar (year/month/day/hour)
│   │   ├── mockData.js                    # Sample pets for testing
│   │   ├── dayPillarLibrary.js
│   │   ├── monthPillarYoungGrowthLibrary.js
│   │   ├── yearPillarChildhoodLibrary.js
│   │   └── hourPillarInnerSelfLibrary.js
│   ├── screens/
│   │   ├── WelcomeScreen.js
│   │   ├── PetInputScreen.js
│   │   ├── OwnerInputScreen.js
│   │   ├── LoadingRevealScreen.js
│   │   ├── PetReadingScreen.js
│   │   ├── CompatibilityScreen.js
│   │   └── ShareCardScreen.js
│   └── utils/
│       ├── baziLogic.js, zipingBazi.js, pillarElements.js  # Bazi-inspired logic
│       ├── copyGenerator.js, pillarStageCopy.js, readingDisplay.js  # Copy assembly
│       ├── monthPillarYoungGrowthReading.js, yearPillarChildhoodReading.js
│       ├── hourPillarInnerSelfReading.js
│       ├── inputParsing.js    # Birthday/time parsing + validation
│       └── storage.js         # AsyncStorage helpers (last pet, last reading)
├── scripts/                   # One-off build/test tooling (see "Tooling scripts" below)
├── assets/                    # App icons + Hachi mascot art (see assets/README.md)
└── package.json
```

## Tooling scripts

`scripts/` holds one-off Node/Python utilities, run manually (not part of `npm start`):

- **`build-year-pillar-childhood-library.js`** / **`build-month-pillar-young-growth-library.js`** — generate the corresponding `src/data/*Library.js` copy files.
- **`test-zipingBazi.js`** — quick manual checks for `src/utils/zipingBazi.js`.
- **`process_hachi_mascot.py`** — cleans/exports the Hachi mascot art (transparency, static PNG, running sprite sheet) into `assets/`. Requires Python with `Pillow`/`numpy` (see `.venv-img`) and currently reads its source export from a hardcoded local path — update `SOURCE` in the script if running on a different machine.

## How to run

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the app**
   ```bash
   npx expo start
   ```
   Then scan the QR code with Expo Go (Android) or the Camera app (iOS), or press `i` for iOS simulator / `a` for Android emulator.

3. **Run in the browser (web)**
   ```bash
   npm run web
   ```
   or `npx expo start --web`, then open the URL shown (often **http://localhost:8081**). The project uses Metro for web (`app.json` → `web.bundler`), `react-native-web`, and platform-specific `DateField.web.js` / `TimeField.web.js` so date/time fields work without native pickers. Navigation uses `enableScreens(false)` on web for reliable stack transitions.

4. **Store icons (optional)**  
   For App Store / Play builds, add `assets/icon.png` (1024×1024) and optional splash images; `app.json` no longer requires them for local dev or web.

## Main user flow

1. **Welcome** → “Start Reading”
2. **Pet input** → Pet name, species (dog/cat/other), pet birthday, optional pet birth time → “Continue”
3. **Owner input** → Owner name, owner birthday, optional owner birth time → “Generate Reading”
4. **Loading** → Short animated wait with cycling messages, then auto-navigate to results
5. **Pet reading** → Pet name, elements, bonding style, personality / emotional needs / hidden tendencies / bonding copy; “See compatibility with you”
6. **Compatibility** → Score, bond label, explanation, advice, “Why your pet may feel attached to you”; “Share result”
7. **Share card** → Styled card (cream, shareable); “Screenshot to share” / “Done”

## Logic (simplified Bazi-inspired)

- **Pet main element**: from birth month (mapped across Wood, Fire, Earth, Metal, Water).
- **Pet secondary element**: from birth day (day mod 5).
- **Bonding style**: from birth time bucket (late night → Water-like; early morning → Wood; midday → Fire; afternoon → Earth; evening → Metal).
- **Owner element**: from owner birthday (month + day used for variety).
- **Compatibility**: same element → high; generating cycle → high; controlling/controlled → mixed; else neutral. Score ranges as in `src/utils/baziLogic.js`.

Details and comments are in `src/utils/baziLogic.js` and `src/constants/elements.js`.

## Sample data

- `src/data/mockData.js` exports `SAMPLE_PETS` (e.g. Luna the cat, Max the dog) and `DEFAULT_PREVIEW` for quick testing. You can prefill forms in code or add a “Try sample” button that fills from these.

## Design

- **Colors**: Deep midnight blue background, cream/dark cards, muted gold and jade accents.
- **Typography**: Serif (e.g. Georgia) for titles, sans-serif for body.
- **Components**: Rounded cards, element badges, compatibility meter, section blocks, primary/secondary/ghost buttons.

## Possible next steps (post-MVP)

- Paid unlock (e.g. deeper readings or extra pets); UI is structured so a paywall can be added later.
- Login/sync (not required for MVP).
- More precise Bazi or astrology logic if desired.

## License

Private / use as you like for this project.
