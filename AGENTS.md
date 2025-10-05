# Repository Guidelines

## Project Structure & Module Organization
This Expo Router app keeps navigable screens under `app/`. `_layout.tsx` defines top-level navigation and `app/(tabs)/` hosts the tabbed routes such as `index.tsx` and `explore.tsx`. Reusable UI lives in `components/` with `components/ui/` holding platform-specific widgets. Shared constants and theme helpers sit in `constants/` and `hooks/`; prefer importing via the `#/` alias configured in `tsconfig.json`. Static images, fonts, and icons belong in `assets/`. Utility scripts are stored in `scripts/`; `reset-project.js` restores the Expo starter skeleton if you need a clean slate.

## Build, Test, and Development Commands
Run `npm install` once to sync dependencies. `npm run start` launches the Expo dev server; use `npm run android`, `npm run ios`, or `npm run web` for platform-specific simulators. `npm run reset-project` archives the current sources under `app-example` and scaffolds a fresh Expo starter; run it only when you intend to rebuild from scratch. `npm run lint` executes `expo lint` with the repository ESLint config.

## Coding Style & Naming Conventions
The project uses TypeScript with `strict` settings; surface types and props explicitly. Follow two-space indentation and keep JSX props on separate lines when they wrap. Prefer functional components, hooks, and inline styles consistent with the existing typography scales. ESLint (`eslint-config-expo`) enforces stylistic expectations; run `npm run lint -- --fix` before submitting. When referencing local modules, import via the `#/` alias rather than relative `../../` chains.

## Testing Guidelines
An automated test suite has not been established yet. Before opening a pull request, verify screens on at least one mobile target and on web via Expo. If you add tests, colocate them beside the component (for example `components/hello-wave.test.tsx`) and describe the runner in the PR. Aim to cover new hooks and stateful logic with unit tests using `@testing-library/react-native` or a similar runner that integrates with Expo.

## Commit & Pull Request Guidelines
Commits should be in the imperative mood, ≤72 characters (for example `Add score reset button`) and scoped to a single concern; squash fixups locally before pushing. For pull requests, include a concise summary, testing notes (`npm run lint`, platforms exercised), and attach screenshots or screen recordings for UI changes. Link related issues or TODOs so future agents understand context and follow-up expectations.
