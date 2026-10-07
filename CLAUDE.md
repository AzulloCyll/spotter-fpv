# CLAUDE.md

Spotter FPV — app for FPV drone pilots (spot map, flight-safety weather, gallery). See `README.md` (Polish) for features, data sources and layout.

## Stack

- Expo SDK 57 (`expo ~57.0.27`), React Native 0.86.3, React 19.2
- TypeScript, `strict: true`
- Targets iOS, Android and web from one codebase
- No backend: user data stays on the device (AsyncStorage)

## Commands

Scripts in `package.json`:

| Command | Purpose |
| --- | --- |
| `npm start` | `expo start` — dev server |
| `npm run android` | `expo run:android` — native build |
| `npm run ios` | `expo run:ios` — native build |
| `npm run web` | `expo start --web` |
| `npm run tunnel` | `expo start --tunnel` |
| `npm run lint` | `eslint .` |

Type check (not a script): `npx tsc --noEmit`

**Minimum check before a PR:** `npm run lint` and `npx tsc --noEmit`, both clean.

## Project facts

- Default branch is `master`, not `main`.
- No CI (no workflows) and no branch protection, so GitHub does not block merging. Merges are done by the owner, or by the owner's hub Sternik on the owner's explicit word. This is discipline, not a technical block: never merge on your own.
- On-screen verification: the project is on SDK 57 and opens in Expo Go 57 in the iOS simulators. Android has no emulator here, so it is not checked on screen.
- Project knowledge lives in the owner's private vault: `~/Developer/_wiedza/wiki/Projekty/spotter-fpv/` (reference only).
- Project expert: the `earhart` agent (global, outside the repo) — task assessment and review before shipping.
