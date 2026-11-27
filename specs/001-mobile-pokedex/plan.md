# Implementation Plan: Mobile Pokédex

**Branch**: `feat/mobile-pokedex` | **Date**: 2026-11-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-mobile-pokedex/spec.md`

## Summary

Build a cross-platform mobile Pokédex application for **iOS and Android** using **React Native, Expo (managed workflow), TypeScript, Expo Router, gluestack-ui, and NativeWind**. Trainers can browse all 1,025 Gen I–IX base National Dex species in a smoothly scrolling 2-column grid with automatic infinite scroll and non-destructive pull-to-refresh, search/filter across the full catalog via inline collection-status pills and a `Filters` bottom sheet (`Actionsheet`), inspect rich detail screens (official artwork + Shiny toggle, regional/Mega/Gigantamax form selector, canonical defensive type effectiveness, 6 base stats + total, regular vs. Hidden Abilities, English multi-game flavor text picker, and interactive branching evolution chains), and persist `Caught` / `Favorite` progress locally per base species alongside offline-cached PokéAPI v2 entries.

## Technical Context

**Language/Version**: TypeScript (`strict: true`), React Native (Expo SDK 52+ managed workflow)

**Primary Dependencies**:
- Navigation: `expo-router`, `react-native-screens`, `react-native-safe-area-context`, `expo-linking`
- UI & Styling: `gluestack-ui` (modular components under `components/ui/`) + `nativewind` (Tailwind CSS for React Native) + centralized WCAG AA 18-type color tokens
- Media & Lists: `expo-image` (`memory-disk` cache) + tuned React Native `FlatList`
- Data & Offline Caching: `@tanstack/react-query`, `@tanstack/react-query-persist-client`, `@tanstack/query-async-storage-persister`, `@react-native-community/netinfo`
- API Client: Typed `fetch`-based PokéAPI v2 client + pure domain mappers

**Storage**: `@react-native-async-storage/async-storage` used in two isolated roles: (1) `CollectionStorageAdapter` (`pokedex:collection:v1`) for swappable local Caught/Favorite persistence, and (2) TanStack Query persistent cache (`pokedex:query-cache:v1`) for offline viewing of previously fetched catalog and detail entries

**Testing**: Jest (`jest-expo`) + `@testing-library/react-native` with deterministic mocked PokéAPI v2 fixtures (`__tests__/fixtures/`) — zero live network calls in test runs

**Target Platform**: Cross-platform mobile (iOS 15+ and Android API 24+ portrait phones via Expo Go / EAS builds)

**Project Type**: Mobile application (`mobile-app`, client-only with PokéAPI v2 external data source)

**Performance Goals**: 60fps 2-column grid scrolling via tuned `FlatList` (`numColumns={2}`, `initialNumToRender={12}`, `windowSize={7}`), real-time full-catalog search/filter in `< 50ms` in-memory over the 1,025-entry index, and instant cached detail rendering

**Constraints**: Respectful PokéAPI v2 usage (1 index fetch + lazy type/page fetches + persistent 24h/7d cache), WCAG AA contrast (`>= 4.5:1`) across all 18 elemental type badges, minimum `44x44pt` / `48x48dp` touch targets, safe-area inset compliance, and zero crashes on malformed inputs or offline launches

**Scale/Scope**: 1,025 Gen I–IX base species + regional (Alolan, Galarian, Hisuian, Paldean), Mega, and Gigantamax form variants; 2 primary Expo Router screens (`/`, `/pokemon/[idOrName]`) + filter `Actionsheet`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Gate | Pre-Phase 0 | Post-Phase 1 | How This Plan Satisfies It |
| --- | --- | --- | --- |
| **I. Domain Accuracy** | PASS | PASS | Canonical 18×18 defensive type-effectiveness engine in `src/domain/type-effectiveness.ts` (`0x/0.25x/0.5x/1x/2x/4x`), exact 6-stat sum, regular vs. Hidden Ability flags, and Gen I–IX species/form mappers covered by unit tests |
| **II. Respectful Data Fetching & Caching** | PASS | PASS | Full catalog index fetched in 1 `/pokemon-species?limit=1025` call; type sets lazy-loaded at most 1–2 times; `PersistQueryClientProvider` (`gcTime >= maxAge`, 7d) persists fetched entries to AsyncStorage; explicit loading skeletons and 1-tap offline retry UI |
| **III. Strict Input Validation & Edge Cases** | PASS | PASS | Pure validators in `src/domain/search.ts` & `src/domain/navigation.ts` sanitize search queries (`25`/`0025`/`#0025`), route params, flavor text control chars, and corrupted storage payloads with safe empty/not-found recovery screens |
| **IV. Mobile Accessibility & Ergonomics** | PASS | PASS | Accessible `gluestack-ui` primitives, centralized high-contrast 18-type token palette (`src/theme/pokemon-types.ts`), `SafeAreaProvider`/insets, `min-h-[44px]`/`min-w-[44px]` touch targets, and VoiceOver/TalkBack `accessibilityLabel`/`accessibilityRole` props |
| **V. Clean Separation & Testability** | PASS | PASS | Pure domain logic (`src/domain/`), API mappers (`src/api/`), and `CollectionStorageAdapter` (`src/storage/`) remain strictly decoupled from `app/` and `src/components/`, tested deterministically via `jest-expo` + RNTL fixtures |
| **VI. Simplicity (YAGNI)** | PASS | PASS | Managed Expo workflow, 2 Expo Router routes, native `FlatList` (no unnecessary list libraries), no backend server, and lightweight modular `gluestack-ui` primitives |
| **Mobile & Data Constraints** | PASS | PASS | Typed PokéAPI boundary mappers (`contracts/pokeapi-client.contract.md`), isolated swappable `CollectionStorageAdapter` (`contracts/storage-adapter.contract.md`), and mobile UI layout grounding (`research.md`) |
| **Development Workflow & Gates** | PASS | PASS | Follows `spec.md` (with Q1–Q5 clarifications) -> `research.md` -> `data-model.md` + `contracts/` + `quickstart.md` -> `plan.md`; branch/folder naming matches `.specify/branch-convention.yml` |

## UI Architecture & Reference Patterns

Grounded in Phase 0 layout research ([research.md](research.md#1-mobile-ui-layout-research-dribbble--behance-patterns-mobbin-mcp-note)):
- **Catalog Screen (`app/index.tsx`)**: Safe-area header with `gluestack-ui` `Input` (real-time search + clear button), `Caught X / 1025` `Progress` bar, inline `All` / `Caught` / `Favorites` pills, and `Filters` button with active count `Badge`; 2-column `FlatList` rendering softly type-tinted rounded cards with `expo-image` artwork, `#0001` Dex ID, type `Badge`s, and quick Caught/Favorite icon buttons; `Skeleton` placeholders, inline infinite-scroll retry footer, non-destructive offline refresh banner, and thematic empty state with 1-tap `Reset Filters`.
- **Filter Bottom Sheet (`src/components/FilterBottomSheet.tsx`)**: `gluestack-ui` `Actionsheet` with grab indicator, draft state isolated until `Apply`, multi-select 18 elemental type chips (capped at 2 for dual-type matching), Gen I–IX region chips, and sticky `Reset All` + `Apply (N)` footer.
- **Detail Screen (`app/pokemon/[idOrName].tsx`)**: Type-tinted hero header (`expo-image` official artwork, back button, Caught/Favorite toggles, Default/Shiny toggle, conditional horizontal form pills for Alolan/Galarian/Hisuian/Paldean/Mega/Gigantamax), `About` section (genus, metric height/weight, regular vs. Hidden Ability badges, English flavor text with compact game-version picker), `Base Stats` (`Progress` bars + `Stat Total`), `Type Matchups` (`4x`, `2x`, `0.5x`, `0.25x`, `0x` groups), `EvolutionChain` (horizontal stepper for linear chains; responsive 2-column branch grid for branching chains like Eevee/Wurmple), and recoverable Not Found state.

## Project Structure

### Documentation (this feature)

```text
specs/001-mobile-pokedex/
├── plan.md                                  # This file (/speckit-plan output)
├── research.md                              # Phase 0 UI & technical research
├── data-model.md                            # Phase 1 domain entities, validation & state transitions
├── quickstart.md                            # Phase 1 runnable validation checklist
└── contracts/                               # Phase 1 internal & external interface contracts
    ├── pokeapi-client.contract.md
    ├── storage-adapter.contract.md
    └── navigation-routes.contract.md
```

### Source Code (repository root)

```text
app/
├── _layout.tsx                              # Root layout: global.css, SafeAreaProvider, GluestackUIProvider, PersistQueryClientProvider, Stack
├── index.tsx                                # Catalog screen (search, progress, pills, FilterBottomSheet, 2-col FlatList)
└── pokemon/
    └── [idOrName].tsx                       # Detail screen (hero, forms, shiny, stats, abilities, flavor picker, type matchups, evolution)

components/
└── ui/                                      # gluestack-ui generated & NativeWind-styled primitives (actionsheet, badge, button, input, progress, skeleton)

src/
├── api/
│   ├── pokeapi-client.ts                    # Typed PokéAPI v2 HTTP client & normalized PokedexApiError handling
│   └── mappers.ts                           # Pure PokéAPI -> domain mappers (forms, flavor text sanitization, evolution tree)
├── domain/
│   ├── types.ts                             # Canonical domain TypeScript interfaces & unions
│   ├── generations.ts                       # Gen I–IX Dex range -> generation/region lookup
│   ├── type-effectiveness.ts                # Canonical 18x18 defensive multiplier calculator
│   ├── search.ts                            # Pure real-time search & multi-facet filter predicates
│   └── navigation.ts                        # Route param parsing & validation
├── storage/
│   └── collection-storage.ts                # CollectionStorageAdapter interface + AsyncStorage & InMemory implementations
├── hooks/
│   ├── use-pokedex-queries.ts               # TanStack Query hooks (catalog index, type sets, paginated summaries, detail, forms, evolution)
│   └── use-collection.ts                    # Caught/Favorite state hook synced with CollectionStorageAdapter
├── components/
│   ├── PokemonCard.tsx                      # 2-column catalog card (Dex ID, artwork, type badges, Caught/Favorite toggles)
│   ├── FilterBottomSheet.tsx                # gluestack-ui Actionsheet for 18 types + Gen I–IX
│   ├── TypeBadge.tsx                        # Accessible elemental type pill using WCAG AA tokens
│   ├── StatBarRow.tsx                       # Accessible horizontal Progress bar row for base stats
│   ├── TypeEffectivenessSection.tsx         # Grouped 4x / 2x / 0.5x / 0.25x / 0x matchup display
│   ├── EvolutionChainSection.tsx            # Linear stepper & branching evolution tree navigation
│   └── StateFeedback.tsx                    # Skeletons, empty state, offline banner, inline retry footer, not-found view
└── theme/
    └── pokemon-types.ts                     # Centralized WCAG AA color tokens for all 18 Pokémon types

__tests__/
├── fixtures/                                # Deterministic mocked PokéAPI v2 JSON payloads (Bulbasaur, Pikachu, Raichu, Eevee, etc.)
├── unit/                                    # Domain unit tests (type-effectiveness, search/filter, mappers, navigation, storage)
└── screens/                                 # React Native Testing Library screen & component integration tests

app.json
babel.config.js
global.css
jest.config.js
metro.config.js
nativewind-env.d.ts
package.json
tailwind.config.js
tsconfig.json
```

**Structure Decision**: Single Expo Router managed mobile project at repository root with strict layering (`app/` routes -> `src/components/` & `components/ui/` -> `src/hooks/` -> `src/api/` & `src/storage/` -> pure `src/domain/`). All domain math, filtering, validation, and mappers stay UI-free for fast unit testing.

## Complexity Tracking

No Constitution violations exist; all six Core Principles and Mobile & Data Constraints are satisfied directly without extra architectural layers or backend infrastructure.
