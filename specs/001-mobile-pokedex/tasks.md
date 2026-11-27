---

description: "Dependency-ordered task list for Mobile Pokédex implementation"
---

# Tasks: Mobile Pokédex

**Input**: Design documents from `/specs/001-mobile-pokedex/`

**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Automated deterministic unit and React Native Testing Library screen/component tests (`jest-expo`) are included per `.specify/memory/constitution.md` Principle V (zero live network calls).

**Organization**: Tasks are grouped by user story (`US1`–`US4`) so each story can be implemented, tested, and verified independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`, `[US4]`) — used strictly in User Story phases
- Every task includes exact file paths and, where implementing constrained domain fields, cites `data-model.md` (`Entity.field`)

## Path Conventions

- **Expo Router routes**: `app/`
- **gluestack-ui primitives**: `components/ui/`
- **Application layers**: `src/domain/`, `src/api/`, `src/storage/`, `src/hooks/`, `src/components/`, `src/theme/`
- **Automated tests & fixtures**: `__tests__/fixtures/`, `__tests__/unit/`, `__tests__/screens/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the Expo (managed workflow) + TypeScript + gluestack-ui + NativeWind + Jest project foundation.

- [ ] T001 Initialize Expo managed workflow TypeScript project configuration (`strict: true`, `main: "expo-router/entry"`, deep-link scheme `pokedex` per `contracts/navigation-routes.contract.md`) in `package.json`, `app.json`, and `tsconfig.json`
- [ ] T002 Configure NativeWind and Tailwind CSS pipeline (`global.css`, Metro/Babel presets, content globs, TypeScript ambient types) per `research.md` in `tailwind.config.js`, `babel.config.js`, `metro.config.js`, `global.css`, and `nativewind-env.d.ts`
- [ ] T003 [P] Scaffold modular `gluestack-ui` primitives (`GluestackUIProvider`, `Actionsheet`, `Badge`, `Button`, `Input`, `Progress`, `Skeleton`) in `components/ui/`
- [ ] T004 [P] Configure Jest (`jest-expo`) and React Native Testing Library setup with deterministic native module mocks (`expo-image`, `react-native-safe-area-context`, `@react-native-community/netinfo`) in `jest.config.js` and `__tests__/setup.ts`
- [ ] T005 [P] Create centralized WCAG AA (`>= 4.5:1`) color tokens (`background`, `foreground`, `cardTint`) for all 18 canonical Pokémon types in `src/theme/pokemon-types.ts`
- [ ] T006 [P] Create deterministic mocked PokéAPI v2 JSON fixtures (species catalog index, type member sets, Bulbasaur `#0001`, Charizard `#0006` with Mega X/Y/Gmax, Pikachu `#0025`, Raichu `#0026` with Alolan, Eevee `#0133` 8-branch evolution, Wurmple `#0265` split evolution, Tauros `#0128` single-stage) in `__tests__/fixtures/pokeapi-fixtures.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Pure domain models, PokéAPI client/mappers, swappable collection storage adapter, root Expo Router layout with persisted TanStack Query, and shared accessible UI primitives.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T007 Define canonical domain interfaces and constrained union types citing `data-model.md` (`PokemonTypeName`, `GenerationId`, `CollectionStatusFilter`, `EffectivenessMultiplier`, `PokemonCatalogIndexItem.id`, `PokemonCatalogIndexItem.dexNumber`, `PokemonCatalogIndexItem.slug`, `PokemonCatalogIndexItem.name`, `PokemonCatalogIndexItem.generation`, `PokemonCatalogIndexItem.region`, `PokemonSummary.types`, `PokemonSummary.spriteUrl`, `PokemonBaseStats.hp`, `PokemonBaseStats.attack`, `PokemonBaseStats.defense`, `PokemonBaseStats.spAtk`, `PokemonBaseStats.spDef`, `PokemonBaseStats.speed`, `PokemonBaseStats.total`, `PokemonAbility.slug`, `PokemonAbility.name`, `PokemonAbility.isHidden`, `PokemonAbility.slot`, `FlavorTextEntry.versionSlug`, `FlavorTextEntry.versionLabel`, `FlavorTextEntry.text`, `PokemonForm.id`, `PokemonForm.slug`, `PokemonForm.label`, `PokemonForm.isDefault`, `PokemonForm.types`, `PokemonForm.artworkUrl`, `PokemonForm.shinyArtworkUrl`, `PokemonForm.stats`, `PokemonForm.abilities`, `PokemonForm.heightMeters`, `PokemonForm.weightKg`, `PokemonVarietyRef.slug`, `PokemonVarietyRef.label`, `PokemonVarietyRef.isDefault`, `PokemonVarietyRef.pokemonId`, `PokemonEntry.id`, `PokemonEntry.dexNumber`, `PokemonEntry.slug`, `PokemonEntry.name`, `PokemonEntry.generation`, `PokemonEntry.region`, `PokemonEntry.genus`, `PokemonEntry.flavorTexts`, `PokemonEntry.defaultFlavorVersion`, `PokemonEntry.defaultForm`, `PokemonEntry.varieties`, `PokemonEntry.evolutionChainId`, `TypeEffectivenessProfile.defendingTypes`, `TypeEffectivenessProfile.quadWeaknesses`, `TypeEffectivenessProfile.weaknesses`, `TypeEffectivenessProfile.neutral`, `TypeEffectivenessProfile.resistances`, `TypeEffectivenessProfile.quadResistances`, `TypeEffectivenessProfile.immunities`, `EvolutionNode.speciesId`, `EvolutionNode.dexNumber`, `EvolutionNode.slug`, `EvolutionNode.name`, `EvolutionNode.spriteUrl`, `EvolutionNode.triggerLabel`, `EvolutionNode.evolvesTo`, `EvolutionChain.id`, `EvolutionChain.root`, `EvolutionChain.hasBranching`, `CollectionRecord.version`, `CollectionRecord.caughtIds`, `CollectionRecord.favoriteIds`, `CatalogFilterState.searchQuery`, `CatalogFilterState.selectedTypes`, `CatalogFilterState.selectedGeneration`, `CatalogFilterState.collectionStatus`) in `src/domain/types.ts`
- [ ] T008 [P] Implement Gen I–IX Dex range lookup and `#0001` formatting (`formatDexNumber`, `getGenerationForId`) citing `data-model.md` (`PokemonCatalogIndexItem.id`, `PokemonCatalogIndexItem.dexNumber`, `PokemonCatalogIndexItem.generation`, `PokemonCatalogIndexItem.region`) in `src/domain/generations.ts`
- [ ] T009 [P] Implement route parameter parsing and validation (`parsePokemonRouteParam`, resolving `initialFormSlug` for regional/Mega/Gigantamax suffixes) per `contracts/navigation-routes.contract.md` in `src/domain/navigation.ts`
- [ ] T010 [P] Implement typed PokéAPI v2 HTTP client and normalized `PokedexApiError` (`OFFLINE`, `NOT_FOUND`, `RATE_LIMITED`, `SERVER_ERROR`, `INVALID_RESPONSE`) per `contracts/pokeapi-client.contract.md` in `src/api/pokeapi-client.ts`
- [ ] T011 [P] Implement pure PokéAPI-to-domain mappers (`mapSpeciesListToCatalogIndex`, `mapRawPokemonToForm`, `mapRawSpeciesToFlavorTexts`, `mapRawVarieties`, `mapRawEvolutionChain`) per `contracts/pokeapi-client.contract.md` and `data-model.md` (`PokemonCatalogIndexItem.slug`, `PokemonCatalogIndexItem.name`, `PokemonSummary.types`, `PokemonSummary.spriteUrl`, `PokemonBaseStats.hp`, `PokemonBaseStats.attack`, `PokemonBaseStats.defense`, `PokemonBaseStats.spAtk`, `PokemonBaseStats.spDef`, `PokemonBaseStats.speed`, `PokemonBaseStats.total`, `PokemonAbility.slug`, `PokemonAbility.name`, `PokemonAbility.isHidden`, `PokemonAbility.slot`, `FlavorTextEntry.versionSlug`, `FlavorTextEntry.versionLabel`, `FlavorTextEntry.text`, `PokemonForm.id`, `PokemonForm.slug`, `PokemonForm.label`, `PokemonForm.isDefault`, `PokemonForm.types`, `PokemonForm.artworkUrl`, `PokemonForm.shinyArtworkUrl`, `PokemonForm.stats`, `PokemonForm.abilities`, `PokemonForm.heightMeters`, `PokemonForm.weightKg`, `PokemonVarietyRef.slug`, `PokemonVarietyRef.label`, `PokemonVarietyRef.isDefault`, `PokemonVarietyRef.pokemonId`, `PokemonEntry.id`, `PokemonEntry.dexNumber`, `PokemonEntry.slug`, `PokemonEntry.name`, `PokemonEntry.generation`, `PokemonEntry.region`, `PokemonEntry.genus`, `PokemonEntry.flavorTexts`, `PokemonEntry.defaultFlavorVersion`, `PokemonEntry.defaultForm`, `PokemonEntry.varieties`, `PokemonEntry.evolutionChainId`, `EvolutionNode.speciesId`, `EvolutionNode.dexNumber`, `EvolutionNode.slug`, `EvolutionNode.name`, `EvolutionNode.spriteUrl`, `EvolutionNode.triggerLabel`, `EvolutionNode.evolvesTo`, `EvolutionChain.id`, `EvolutionChain.root`, `EvolutionChain.hasBranching`) in `src/api/mappers.ts`
- [ ] T012 [P] Implement swappable `CollectionStorageAdapter` (`AsyncStorageCollectionAdapter` keyed at `pokedex:collection:v1`, `InMemoryCollectionStorageAdapter`, `normalizeCollectionRecord`) per `contracts/storage-adapter.contract.md` and `data-model.md` (`CollectionRecord.version`, `CollectionRecord.caughtIds`, `CollectionRecord.favoriteIds`) in `src/storage/collection-storage.ts`
- [ ] T013 Configure root Expo Router layout (`global.css`, `SafeAreaProvider`, `GluestackUIProvider`, `PersistQueryClientProvider` with `gcTime: 7d`, `maxAge: 7d`, `staleTime: 24h`, `buster: 'v1'`, `networkMode: 'offlineFirst'`, NetInfo `onlineManager`, typed `Stack` navigator) in `app/_layout.tsx`
- [ ] T014 [P] Create accessible `TypeBadge` component using WCAG AA tokens and VoiceOver/TalkBack labels in `src/components/TypeBadge.tsx`
- [ ] T015 [P] Create shared `StateFeedback` components (loading skeletons, zero-match empty state, non-destructive offline banner, inline infinite-scroll retry footer, recoverable not-found view) in `src/components/StateFeedback.tsx`
- [ ] T016 [P] Write deterministic unit tests for Dex formatting, Gen I–IX boundaries, route parameter validation, PokéAPI mappers (flavor sanitization, form filtering, linear/branching evolution chains), and `CollectionStorageAdapter` corruption recovery in `__tests__/unit/foundational.test.ts`

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Browse the Pokémon Catalog (Priority: P1) 🎯 MVP

**Goal**: Trainers open the app and browse all 1,025 Gen I–IX base National Dex species in a smoothly scrolling 2-column grid with `#0001`-formatted numbers, names, type badges, artwork, automatic infinite scroll, non-destructive pull-to-refresh, and offline retry states.

**Independent Test**: Launch the catalog screen with mocked PokéAPI fixtures (and simulated offline/failure conditions), scroll past the first 24-item batch to trigger automatic infinite scroll, test inline batch failure retry, and trigger pull-to-refresh while offline without using search, filters, detail views, or collection toggles.

### Implementation & Tests for User Story 1

- [ ] T017 [P] [US1] Implement TanStack Query catalog hooks (`useCatalogIndex` fetching `/pokemon-species?limit=1025&offset=0`, `useCatalogSummaries` hydrating 24-item slices) with offline persistence and non-destructive refresh state per `contracts/pokeapi-client.contract.md` in `src/hooks/use-pokedex-queries.ts`
- [ ] T018 [P] [US1] Build accessible 2-column `PokemonCard` component (type-tinted card, subtle Pokéball watermark, `#0001` Dex label, `expo-image` artwork with fallback, primary/secondary `TypeBadge`s, `44x44pt`/`48x48dp` hit target) citing `data-model.md` (`PokemonCatalogIndexItem.dexNumber`, `PokemonCatalogIndexItem.name`, `PokemonSummary.types`, `PokemonSummary.spriteUrl`) in `src/components/PokemonCard.tsx`
- [ ] T019 [US1] Build Catalog screen with tuned 2-column `FlatList` (`numColumns={2}`, automatic infinite scroll loading/retry footer, non-destructive pull-to-refresh preserving cached items offline, tap navigation to `/pokemon/[idOrName]`) in `app/index.tsx`
- [ ] T020 [P] [US1] Write deterministic screen/component tests for initial catalog load, `#0001` ordering, automatic infinite scroll + inline batch retry, offline pull-to-refresh retention, and cold-start offline retry in `__tests__/screens/catalog-browse.test.tsx`

**Checkpoint**: User Story 1 (MVP) is complete and independently testable.

---

## Phase 4: User Story 2 - Search and Multi-Facet Filter (Priority: P2)

**Goal**: Trainers search in real time by name or National Dex number (`25`, `0025`, `#0025`) and filter across the full Gen I–IX catalog using inline collection-status pills (`All`, `Caught`, `Favorites`) and a `Filters` bottom sheet (`Actionsheet`) for all 18 elemental types (1 or 2 types) and Gen I–IX regions, with visible active filter indicators and 1-tap zero-match recovery.

**Independent Test**: From the catalog screen, type partial names and numeric queries (`char`, `25`, `0025`, `#0025`), open the `Filters` bottom sheet to test single/dual-type and generation combinations, verify draft-vs-apply/reset semantics, toggle inline collection-status pills, and recover from zero-match empty states.

### Implementation & Tests for User Story 2

- [ ] T021 [P] [US2] Implement pure real-time search (`parseSearchQuery`, `matchesSearchQuery` with Unicode NFKD diacritic stripping, non-alphanumeric folding for `Flabébé`/`Farfetch'd`/`Mr. Mime`/`Type: Null`/`Nidoran♀`, and `25`/`0025`/`#0025`) and full-catalog multi-facet filtering (`filterCatalogIndex`) citing `data-model.md` (`CatalogFilterState.searchQuery`, `CatalogFilterState.selectedTypes`, `CatalogFilterState.selectedGeneration`, `CatalogFilterState.collectionStatus`) in `src/domain/search.ts`
- [ ] T022 [US2] Add lazy cached elemental-type member ID query hook (`useTypeFilterIds` calling `GET /type/{name}` for 0–2 selected types with offline uncached fallback state; sequential after `T017`) in `src/hooks/use-pokedex-queries.ts`
- [ ] T023 [P] [US2] Build `FilterBottomSheet` using `gluestack-ui` `Actionsheet` (draft-vs-commit state per `data-model.md` §3.1, 18 color-coded multi-select type chips capped at 2 with FIFO replacement for `CatalogFilterState.selectedTypes`, Gen I–IX chips for `CatalogFilterState.selectedGeneration`, sticky `Reset All` and `Apply (N)` footer, accessible labels) in `src/components/FilterBottomSheet.tsx`
- [ ] T024 [US2] Integrate persistent search `Input` with clear button, inline `All`/`Caught`/`Favorites` pills (`CatalogFilterState.collectionStatus`), `Filters` button with active count `Badge`, `FilterBottomSheet`, and zero-match empty state with 1-tap `Reset Filters` into `app/index.tsx`
- [ ] T025 [P] [US2] Write deterministic unit tests for search normalization (`25`, `0025`, `#0025`, `#0000`, `mr mime`, `flabebe`, `farfetchd`, `nidoran`, `type null`, malformed text) and single/dual-type + generation + collection-status intersections in `__tests__/unit/search.test.ts`
- [ ] T026 [P] [US2] Write deterministic screen/component tests for full-catalog search, `FilterBottomSheet` draft/apply/reset/dismiss flows, FIFO 2-type cap, dual-type filtering, offline uncached type notice, and zero-match empty-state recovery in `__tests__/screens/catalog-filter.test.tsx`

**Checkpoint**: User Stories 1 and 2 work independently and together.

---

## Phase 5: User Story 3 - Inspect Detailed Pokédex Entry (Priority: P2)

**Goal**: Tapping a Pokémon (or opening `/pokemon/[idOrName]`) displays high-resolution official artwork with a Default/Shiny toggle, a conditional regional/Mega/Gigantamax form selector, calculated defensive type effectiveness (`4x`, `2x`, `0.5x`, `0.25x`, `0x`), 6 base stats + total bars, regular vs. Hidden Abilities, physical profile and English game-version flavor picker, interactive linear/branching evolution chains, and recoverable Not Found/offline error states.

**Independent Test**: Open Charizard (`#0006`), Raichu (`#0026`), and Eevee (`#0133`), toggle Shiny artwork, switch regional/Mega/Gigantamax forms and game-version flavor entries, verify all defensive type multipliers and stat bars, navigate across branching evolutions, and verify invalid/404 deep-link recovery.

### Implementation & Tests for User Story 3

- [ ] T027 [P] [US3] Implement canonical 18×18 defensive type-effectiveness calculator (`calculateTypeEffectiveness`) citing `data-model.md` (`TypeEffectivenessProfile.defendingTypes`, `TypeEffectivenessProfile.quadWeaknesses`, `TypeEffectivenessProfile.weaknesses`, `TypeEffectivenessProfile.neutral`, `TypeEffectivenessProfile.resistances`, `TypeEffectivenessProfile.quadResistances`, `TypeEffectivenessProfile.immunities`) in `src/domain/type-effectiveness.ts`
- [ ] T028 [US3] Add species detail, lazy alternate-form, and evolution-chain query hooks (`usePokemonEntry`, `usePokemonForm`, `useEvolutionChain`; sequential after `T022`) in `src/hooks/use-pokedex-queries.ts`
- [ ] T029 [P] [US3] Build accessible `StatBarRow` component (`gluestack-ui` `Progress` scaled against canonical `255` max, numeric value, non-color tier label, VoiceOver/TalkBack summary, `Stat Total` display) citing `data-model.md` (`PokemonBaseStats.hp`, `PokemonBaseStats.attack`, `PokemonBaseStats.defense`, `PokemonBaseStats.spAtk`, `PokemonBaseStats.spDef`, `PokemonBaseStats.speed`, `PokemonBaseStats.total`) in `src/components/StatBarRow.tsx`
- [ ] T030 [P] [US3] Build `TypeEffectivenessSection` component rendering grouped `4x`, `2x`, `0.5x`, `0.25x`, and `0x` matchups with accessible `TypeBadge`s in `src/components/TypeEffectivenessSection.tsx`
- [ ] T031 [P] [US3] Build `EvolutionChainSection` component rendering horizontal steppers for linear chains, responsive 2-column branch cards for branching chains (`EvolutionChain.hasBranching`, e.g., Eevee/Wurmple), single-stage notice, trigger labels (`EvolutionNode.triggerLabel`), active-node highlight, and tap navigation (no-op on active node per `contracts/navigation-routes.contract.md`) in `src/components/EvolutionChainSection.tsx`
- [ ] T032 [US3] Build Pokédex detail screen integrating `parsePokemonRouteParam` (with `initialFormSlug` preselection when valid), type-tinted hero header with `expo-image` artwork, Default/Shiny toggle with missing-shiny fallback (`PokemonForm.artworkUrl`, `PokemonForm.shinyArtworkUrl`), conditional horizontal form selector (`PokemonEntry.varieties`, `PokemonForm.label`), `About` profile (`PokemonEntry.genus`, `PokemonForm.heightMeters`, `PokemonForm.weightKg`, regular vs. Hidden `PokemonAbility.isHidden` badges, English `FlavorTextEntry` game-version selector), `StatBarRow`s, `TypeEffectivenessSection`, `EvolutionChainSection`, offline retry, and recoverable Not Found screen in `app/pokemon/[idOrName].tsx`
- [ ] T033 [P] [US3] Write exhaustive deterministic unit tests for `calculateTypeEffectiveness` covering single types, dual types, `4x` weaknesses, `0.25x` resistances, `0x` immunities, and alternate-form type changes in `__tests__/unit/type-effectiveness.test.ts`
- [ ] T034 [P] [US3] Write deterministic screen/component tests for `app/pokemon/[idOrName].tsx` covering Default/Shiny toggle, Alolan/Mega/Gigantamax form switching, multi-game flavor switching, branching evolution navigation (Eevee), and invalid/404 deep-link recovery in `__tests__/screens/pokemon-detail.test.tsx`

**Checkpoint**: User Stories 1, 2, and 3 are independently functional.

---

## Phase 6: User Story 4 - Track Personal Collection (Priority: P3)

**Goal**: Trainers mark/unmark any Pokémon as `Caught` or `Favorite` per base National Dex species from either catalog cards or any form view on the detail screen, view an immediate `Caught X / 1025` progress counter, and keep all selections persisted locally across offline app restarts.

**Independent Test**: Toggle `Caught` and `Favorite` on catalog cards and alternate-form detail screens, confirm `Caught X / 1025` updates without duplicates, verify `Caught`/`Favorites` filtering, and simulate app restart offline via `InMemoryCollectionStorageAdapter` / mocked `AsyncStorage`.

### Implementation & Tests for User Story 4

- [ ] T035 [US4] Implement `CollectionProvider` and `useCollection` hook backed by `CollectionStorageAdapter` (species-level `toggleCaught`, `toggleFavorite`, `isCaught`, `isFavorite`, `caughtCount`, fault-tolerant persistence) citing `data-model.md` (`CollectionRecord.version`, `CollectionRecord.caughtIds`, `CollectionRecord.favoriteIds`) and `contracts/storage-adapter.contract.md` in `src/hooks/use-collection.ts`
- [ ] T036 [US4] Wire `CollectionProvider` into `app/_layout.tsx` and integrate accessible `44x44pt`/`48x48dp` Caught & Favorite toggles plus `Caught X / 1025` `Progress` counter into `src/components/PokemonCard.tsx`, `app/index.tsx`, and `app/pokemon/[idOrName].tsx` (keeping base-species tracking synced across alternate form views)
- [ ] T037 [P] [US4] Write unit and component integration tests verifying Caught/Favorite toggling from catalog cards and alternate-form detail views, `Caught X / 1025` counter accuracy without duplicates, `Caught`/`Favorites` pill filtering, and offline restart persistence in `__tests__/screens/collection-tracking.test.tsx`

**Checkpoint**: All 4 user stories are complete and independently tested.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility/ergonomics audit, list scrolling optimization, full offline verification, and `quickstart.md` walkthrough.

- [ ] T038 [P] Audit all screens and components (`app/index.tsx`, `app/pokemon/[idOrName].tsx`, `src/components/*`) for VoiceOver/TalkBack labels, `44x44pt`/`48x48dp` touch targets, safe-area insets, dynamic text scaling, non-color indicators, and WCAG AA 18-type badge contrast (`FR-015`, `FR-016`, `SC-006`)
- [ ] T039 [P] Optimize `FlatList` scrolling performance (`React.memo` on `PokemonCard`, stable `keyExtractor`/`renderItem`) and verify `expo-image` `memory-disk` caching across `app/index.tsx` and `src/components/PokemonCard.tsx` (`SC-007`)
- [ ] T040 Run full TypeScript check (`npx tsc --noEmit`) and complete Jest test suite (`npm test`) confirming 100% pass with zero live network calls
- [ ] T041 Run end-to-end validation walkthrough against `specs/001-mobile-pokedex/quickstart.md` confirming all user stories and `SC-001`–`SC-007`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup (`T001`–`T006`) — BLOCKS all user stories
- **User Story 1 (Phase 3, P1)**: Depends on Foundational (`T007`–`T016`)
- **User Story 2 (Phase 4, P2)**: Depends on Foundational (`T007`–`T016`) and integrates into `app/index.tsx` (`T019`)
- **User Story 3 (Phase 5, P2)**: Depends on Foundational (`T007`–`T016`) — independent of US1/US2 screens
- **User Story 4 (Phase 6, P3)**: Depends on Foundational (`T012`, `T013`) and integrates toggles/counter into US1/US2/US3 views (`T018`, `T019`, `T024`, `T032`)
- **Polish (Phase 7)**: Depends on completion of all desired user stories

### Within Each Phase

- Domain/types before hooks & mappers
- Hooks & leaf components before screen integration (`app/index.tsx`, `app/pokemon/[idOrName].tsx`)
- Deterministic unit & screen/component tests run offline against `__tests__/fixtures/pokeapi-fixtures.ts`

### Parallel Opportunities

- **Phase 1**: `T003`, `T004`, `T005`, `T006` run in parallel after `T001`–`T002`
- **Phase 2**: `T008`, `T009`, `T010`, `T011`, `T012`, `T014`, `T015` run in parallel after `T007`
- **User Stories**: Once Phase 2 finishes, pure domain/component work for US1 (`T017`, `T018`), US2 (`T021`, `T023`), and US3 (`T027`, `T029`, `T030`, `T031`) can proceed in parallel before integrating into `src/hooks/use-pokedex-queries.ts` (`T017` → `T022` → `T028`), `app/index.tsx`, and `app/pokemon/[idOrName].tsx`

---

## Parallel Examples

### Parallel Example: User Story 2 (Search & Multi-Facet Filter)

```bash
# Run independent search logic, FilterBottomSheet, and unit tests together (T022 follows T017 on use-pokedex-queries.ts):
Task: "T021 [P] [US2] Implement pure real-time search and multi-facet filtering in src/domain/search.ts"
Task: "T023 [P] [US2] Build FilterBottomSheet using gluestack-ui Actionsheet in src/components/FilterBottomSheet.tsx"
Task: "T025 [P] [US2] Write deterministic unit tests in __tests__/unit/search.test.ts"
```

### Parallel Example: User Story 3 (Detailed Pokédex Entry)

```bash
# Run independent type-effectiveness engine and detail sub-components together (T028 follows T022 on use-pokedex-queries.ts):
Task: "T027 [P] [US3] Implement canonical 18x18 defensive type-effectiveness calculator in src/domain/type-effectiveness.ts"
Task: "T029 [P] [US3] Build StatBarRow component in src/components/StatBarRow.tsx"
Task: "T030 [P] [US3] Build TypeEffectivenessSection component in src/components/TypeEffectivenessSection.tsx"
Task: "T031 [P] [US3] Build EvolutionChainSection component in src/components/EvolutionChainSection.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (`T001`–`T006`)
2. Complete Phase 2: Foundational (`T007`–`T016`)
3. Complete Phase 3: User Story 1 (`T017`–`T020`)
4. **STOP and VALIDATE**: Run `__tests__/unit/foundational.test.ts` and `__tests__/screens/catalog-browse.test.tsx`, plus launch `npx expo start -c` to verify catalog browsing, infinite scroll, and offline retry independently.

### Incremental Delivery

1. Setup + Foundational → Core foundation ready
2. Add User Story 1 (`T017`–`T020`) → Independently testable Catalog MVP
3. Add User Story 2 (`T021`–`T026`) → Full-catalog Search & `Filters` bottom sheet
4. Add User Story 3 (`T027`–`T034`) → Detailed Pokédex Entry (forms, shiny, type effectiveness, stats, flavor picker, branching evolutions)
5. Add User Story 4 (`T035`–`T037`) → Species-level Caught/Favorite tracking + `Caught X / 1025` counter + offline persistence
6. Complete Phase 7 Polish (`T038`–`T041`) → Accessibility audit, performance tuning, full test suite, and `quickstart.md` validation

---

## Notes

- `[P]` tasks operate on separate files with no unmet dependencies and can run concurrently
- `[US1]`–`[US4]` labels trace tasks directly back to User Stories 1–4 in `spec.md`
- `T017` → `T022` → `T028` edit `src/hooks/use-pokedex-queries.ts` sequentially (`T022` and `T028` intentionally omit `[P]`)
- All automated tests run offline against `__tests__/fixtures/pokeapi-fixtures.ts` and `InMemoryCollectionStorageAdapter`
