# Assets

Add the following for a full Expo build:

- **icon.png** — 1024×1024 px (app icon)
- **splash.png** — 1284×2778 px or similar (splash screen)
- **adaptive-icon.png** — 1024×1024 px (Android adaptive icon)

For local development with `npx expo start`, the app can run without these; Expo may use defaults or show a warning. To get default Expo assets, you can run:

```bash
npx create-expo-app@latest temp-app --template blank
cp temp-app/assets/* ./assets/
rm -rf temp-app
```

Then replace with your own Pet Bazi branding when ready.
