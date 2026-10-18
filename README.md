# MitrePaws

An offline-first, bilingual (English / 简体中文) reference client for the MITRE ATT&CK Enterprise knowledge base, built with React Native and Expo.

<p>
  <img alt="Expo" src="https://img.shields.io/badge/Expo-57-000020?logo=expo&logoColor=white">
  <img alt="React Native" src="https://img.shields.io/badge/React_Native-0.86-61DAFB?logo=react&logoColor=black">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white">
  <img alt="Platform" src="https://img.shields.io/badge/platform-iOS_%7C_Android_%7C_Web-lightgrey">
</p>

![MitrePaws logo](assets/images/logo-master.png)

## Overview

MitrePaws packages the full Enterprise ATT&CK dataset — techniques, tactics, groups, software, campaigns, mitigations, data sources, data components, relationships, detection strategies, and analytics — into a bundled local store. The application resolves every screen from this local store and performs no network requests and no runtime translation API calls; all Chinese content is pre-merged into the seed data at build time through a deterministic localization pipeline.

The dataset currently ships with:

| Entity | Count | Entity | Count |
| :--- | ---: | :--- | ---: |
| Tactics | 15 | Mitigations | 268 |
| Techniques (incl. sub-techniques) | 718 | Campaigns | 57 |
| Groups | 187 | Data sources | 38 |
| Software | 843 | Data components | 109 |
| Relationships | 19,113 | Detection strategies | 703 |

Localization coverage is tracked per entity in the pipeline report: technique names, technique descriptions, tactics, mitigation names, data source names, data component names, and analytic log-source names are fully localized; detection-strategy names and analytic descriptions are merged batch-by-batch from `localization/zh/`.

## Features

- **Technique browser** — tactic shelves, technique cards, and a full detail page covering detection, detection strategies with nested analytics and log sources, platforms, tactics, parent/sub-technique links, procedure examples, mitigations, data sources, CAPEC mappings, metadata, and external references.
- **Offline search** — filtered search across entities with saved filter state.
- **Bookmarks** — locally persisted favorites with bidirectional-sync state.
- **Bilingual UI** — every rendered string, label, and chip resolves through `BilingualText` against the active locale; the app language is switchable at runtime.
- **Theming** — `auto / light / dark` tri-state theme persisted through `AsyncStorage`, with a floating translucent tab bar, platform-matched dock materials, and Reanimated-driven transitions that respect the OS reduced-motion setting.
- **Haptic feedback** — context-aware selection haptics on supported devices.

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Framework | Expo SDK 57, React Native 0.86, React 19 |
| Language | TypeScript (strict), React Compiler + typed routes enabled |
| Navigation | expo-router (file-based, typed) |
| State | Zustand stores, per-feature modules, AsyncStorage persistence |
| Animation | react-native-reanimated 4 (shared-value driven) |
| Graphics | expo-linear-gradient, react-native-svg, expo-glass-effect |
| Build | EAS Build (profiles: development / preview / production) |

## Architecture

The codebase follows MVVM with a strict unidirectional data flow:

```
src/
├── app/                 # expo-router routes (tabs, technique detail)
├── viewmodels/          # per-screen view models (state orchestration)
├── models/repositories/ # typed read access over the seed store
├── data/seed/           # generated JSON store + typed entry modules
├── components/          # presentational components (tabs, matrix, detail, icons)
├── stores/              # Zustand stores (theme, locale, bookmarks, filters, font scale)
├── services/            # haptics, search service
├── i18n/                # UI string dictionaries (en / zh)
├── theme/               # design tokens and motion primitives
└── types/               # STIX and view-layer type contracts
```

Data flows one way: `data/seed → repositories → viewmodels → components`. Components never touch the store directly; view models expose derived, locale-aware views.

## Data Pipeline

The dataset is generated, never hand-edited. Two scripts under `scripts/` own the flow:

```
enterprise-attack.json (STIX)
        │
        ▼
scripts/ingest-stix.mjs          # parse STIX, resolve links, emit bilingual en/zh placeholders
        │
        ▼
src/data/seed/json/*.json        # raw seed store
        │
        ▼
scripts/merge-localization.mjs   # merge localization/zh/*.json + localization/glossary.zh.json
        │                        # report per-entity coverage
        ▼
src/data/seed/json/*.json        # localized seed store consumed by the app
```

- `ingest-stix.mjs` — reads the official STIX bundle, resolves `detects` / `uses` / `mitigates` relationship chains, assembles the technique → detection strategy → analytic → data component hierarchy, and emits every text field as a `{ en, zh }` bilingual structure.
- `merge-localization.mjs` — applies translations from `localization/zh/` (`techniques.json`, `technique-descriptions.json`, `tactics.json`, `detection-strategies.json`, `analytics.json`) and the controlled glossary `localization/glossary.zh.json`, falls back to English for missing entries, and prints a coverage report.

Localization files must never be edited through the seed JSONs — add or fix translations in `localization/zh/` and re-run the merge.

## Getting Started

Prerequisites: Node.js 20+ and npm.

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (use --clear when Metro caches go stale)
npx expo start

# 3. Launch on a target
npx expo start --ios       # iOS simulator
npx expo start --android   # Android emulator
npx expo start --web       # browser
```

The app runs in Expo Go for quick evaluation; a development build via EAS is required for full native behavior (haptics, blur surfaces).

## Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run start` | Start the Metro dev server |
| `npm run ios` / `android` / `web` | Start on a specific platform |
| `npm run typecheck` | Full TypeScript check (`tsc --noEmit`) |
| `npm run lint` | ESLint (expo config) |
| `npm run ingest` | Rebuild the seed store from `scripts/enterprise-attack.json` |
| `npm run localize` | Re-merge `localization/zh/` into the seed store |
| `npm run reset-project` | Reset to a blank Expo scaffold (destructive) |

## Localization Workflow

1. Export the pending bilingual placeholders (the merge report lists every key still falling back to English).
2. Add translations under `localization/zh/` using the existing key conventions — technique files key by external ID (`T1059`), detection-strategy and analytic files key by STIX UUID, the glossary keys by exact English term.
3. Run `npm run localize` and confirm the coverage report reaches the expected values.
4. Rebuild the development client or reload Metro; localized content ships inside the bundle, so no runtime download occurs.

## Building with EAS

The project is wired for EAS Build with three profiles:

```bash
eas build --profile development --platform ios    # dev client, internal distribution
eas build --profile preview --platform android    # internal preview
eas build --profile production                    # store build, auto-incremented versions
```

The application ID is fixed at `xin.ctkqiang.mitrepaw` on both platforms.

## FAQ

**Does the app call any API at runtime?**
No. The full ATT&CK dataset and both language packs are bundled at build time. The only outbound traffic is explicit user actions such as opening an external reference URL.

**Why do I see English text in some sections?**
Sections rendered in English indicate a missing entry in `localization/zh/` for the active locale. Run the merge and check the coverage report; untranslated fields intentionally fall back to English.

**The UI shows stale code after edits.**
Metro cache. Stop the dev server, then run `npx expo start --clear`.

**Can I regenerate the dataset from a newer ATT&CK release?**
Replace `scripts/enterprise-attack.json` with the target STIX bundle, then run `npm run ingest && npm run localize` and review the coverage report before committing.

## Author

MitrePaws is developed and maintained by Zhong Zhiqiang (ctkqiang).

- Email: [johnmelodymel@qq.com](mailto:johnmelodymel@qq.com)
- Website: [https://www.ctkqiang.xin](https://www.ctkqiang.xin)

## License

This project is released under the license found in [LICENSE](LICENSE). The bundled MITRE ATT&CK data is subject to the [ATT&CK Terms of Use](https://attack.mitre.org/).

---

<div align="center">

<h2>支持</h2>

<p>如果您觉得本项目对您有帮助，欢迎请我喝杯咖啡</p>
<p><sub>您的支持是我持续维护和改进的动力</sub></p>

<br/>

<strong>微信扫码捐赠</strong><br/><br/>
<img src="https://raw.gitcode.com/ctkqiang_sr/ctkqiang_sr/raw/main/mm_reward_qrcode_1778988737577.png"
     alt="微信扫码捐赠"
     width="240"
     style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />

<br/>
<br/>

---