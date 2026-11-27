# Phase 0 Research: Mobile Pokédex

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Date**: 2026-11-27

## 1. Mobile UI Layout Research (Dribbble & Behance Patterns; Mobbin MCP Note)

> **Mobbin MCP Note**: Mobbin MCP (`search_screens` / `search_flows`) returned a paid-plan restriction (`https://mobbin.com/pricing`), so per user direction this phase uses web research on Pokédex mobile UI patterns across Dribbble and Behance case studies, adapted for **React Native + Expo + gluestack-ui + NativeWind** and strict mobile accessibility compliance.

- **Decision**: Adopt a type-tinted card-and-hero visual system built on `gluestack-ui` primitives (`Actionsheet`, `Badge`, `Progress`, `Input`, `Button`, `Skeleton`) and NativeWind utilities, pairing high-contrast accessible type tokens with ergonomic iOS/Android touch targets.
- **Rationale**: Top Dribbble/Behance Pokédex mobile concepts consistently solve the high information density of Pokédex data (1,025 species, 18 types, 6 base stats, multi-branch evolutions) through type-colored visual hierarchy, sticky sectioned detail views, and bottom-sheet filtering rather than cramped inline forms.
- **Alternatives considered**:
  - Plain unstyled list rows with flat gray backgrounds: simpler, but weak visual differentiation across 18 elemental types and slower scanning.
  - Multi-page filter screens instead of bottom sheets: adds navigation stack friction during rapid search/filter refinement.

### Pattern Mapping to Pokédex Screens

| Surface | Dribbble / Behance Pattern Takeaways | Adapted Implementation (`gluestack-ui` + NativeWind) |
| --- | --- | --- |
| **Catalog Header & Progress** | Prominent rounded search input, quick collection pills, and compact caught progress indicator at top | Safe-area top header with `Input` (real-time name/`#0001` search + clear button), `Caught X / 1025` `Progress` bar, inline `All` / `Caught` / `Favorites` pills (`min-h-[44px]`), and `Filters` button with active count `Badge` |
| **Catalog 2-Column Grid Cards** | Rounded cards tinted by primary elemental type, subtle Pokéball watermark silhouette, `#0001` Dex label, type pills, floating/centered artwork, and quick action icons | `FlatList` (`numColumns={2}`) rendering rounded `Pressable` cards with soft type-tint background, `expo-image` artwork, `#0001`-formatted Dex ID, primary/secondary type `Badge`s, and `44x44pt`/`48x48dp` Caught & Favorite icon toggles |
| **Filter Bottom Sheet** | Grab-handle bottom sheet (`border-radius: 24px`), color-coded multi-select type chips, generation pills, and sticky `Reset` / `Apply` footer | `gluestack-ui` `Actionsheet` with drag indicator, scrollable 18 elemental type chips (max 2 active for dual-type matching) + Gen I–IX chips, and sticky footer with `Reset All` and `Apply (N)` buttons |
| **Detail Screen Hero & Form Controls** | Type-tinted immersive hero header with large centered artwork, form switcher, and Default/Shiny toggle | Top-inset hero block with back button, Caught/Favorite toggles, Default/Shiny segmented toggle, horizontal form pills (only when regional/Mega/Gigantamax variants exist), and `expo-image` official artwork |
| **Detail Metadata, Stats & Type Matchups** | Clean sections/tabs (`About`, `Base Stats`, `Type Matchups`, `Evolution`), color-coded horizontal stat bars with `Stat Total`, and grouped effectiveness pills | Scrollable structured sections (no hidden overflow): `About` (genus, metric height/weight, regular vs. Hidden `Badge` abilities, English flavor text with compact game-version selector), `Base Stats` (6 labeled horizontal `Progress` bars + `Stat Total`), and `Type Matchups` grouped into `4x`, `2x`, `0.5x`, `0.25x`, `0x` |
| **Evolution Chain** | Horizontal connected mini-cards with trigger labels (`Lv. 16`, `Thunder Stone`) and active highlight ring; branching tree/grid for multi-branch chains | Horizontal stepper for 1–3 stage linear chains and responsive 2-column branch grid for multi-branch species (e.g., Eevee `#0133`, Wurmple `#0265`), highlighting the current species and allowing 1-tap navigation to any sibling/stage |
| **Loading, Empty & Offline States** | Type-neutral skeleton placeholders, playful zero-match empty state with reset CTA, and non-destructive retry controls | Initial & footer `Skeleton` placeholders, inline infinite-scroll batch retry footer, non-destructive offline banner on failed pull-to-refresh, clear empty state with 1-tap `Reset Filters`, and recoverable not-found view for invalid routes |

---

## 2. Full-Catalog Search & Filter Architecture with PokéAPI v2

- **Decision**: Hydrate a lightweight full-catalog index (`1..1025`, Gen I–IX) via a single cached `GET /api/v2/pokemon-species?limit=1025&offset=0` call, resolve elemental type filters lazily via `GET /api/v2/type/{typeName}` ID sets, compute generation client-side from canonical National Dex ranges, and fetch detailed `/pokemon/{id}` card/entry payloads in slices of `24` as the user scrolls.
- **Rationale**: Spec Clarification Q2 requires real-time search and multi-facet filtering across **all 1,025 Gen I–IX base species** (not just already-scrolled pages), while Constitution Principle II prohibits redundant network requests. PokéAPI v2 does not support server-side search or multi-type filtering on `/pokemon`, and fetching 1,025 individual `/pokemon/{id}` documents upfront would hammer the API and exhaust mobile bandwidth. Combining one `/pokemon-species?limit=1025` index call with at most 1–2 `/type/{name}` lookups reduces full-catalog search and multi-facet filtering to 1–3 cached requests total.
- **Alternatives considered**:
  - Fetching `/pokemon?limit=1025` + 1,025 `/pokemon/{id}` detail calls on boot: violates Constitution Principle II (excessive requests, slow first load, high offline storage footprint).
  - Searching only already-paginated items: violates Spec Q2 and FR-003/FR-004.

### Canonical Gen I–IX National Dex Boundaries

| Generation | Region | National Dex Range | Species Count |
| --- | --- | --- | --- |
| Gen I | Kanto | `1 – 151` | 151 |
| Gen II | Johto | `152 – 251` | 100 |
| Gen III | Hoenn | `252 – 386` | 135 |
| Gen IV | Sinnoh | `387 – 493` | 107 |
| Gen V | Unova | `494 – 649` | 156 |
| Gen VI | Kalos | `650 – 721` | 72 |
| Gen VII | Alola | `722 – 809` | 88 |
| Gen VIII | Galar | `810 – 905` | 96 |
| Gen IX | Paldea | `906 – 1025` | 120 |

### PokéAPI v2 Quirks & Normalization Rules
1. **Varieties vs. Base Species (Spec Q1)**: `GET /api/v2/pokemon-species/{idOrName}/` contains `varieties[]`, where `is_default: true` identifies the canonical National Dex form and `is_default: false` captures regional (`-alola`, `-galar`, `-hisui`, `-paldea`), Mega (`-mega`, `-mega-x`, `-mega-y`), and Gigantamax (`-gmax`) variants. Alternate form `/pokemon/{varietyName}` payloads are fetched lazily only when the trainer opens the detail screen and taps a form pill.
2. **Flavor Text Normalization (Spec Q3)**: `flavor_text_entries` spans all languages and releases and contains game-boy control characters (`\f`, `\n`, `\r`) and soft hyphens (`\u00ad`). Filter strictly to `language.name === 'en'`, normalize control whitespace and soft hyphens, deduplicate identical text across paired releases or tag each unique game version cleanly, and default to the newest available English game version using an ordered canonical game-version table.
3. **Evolution Chain Recursion (`GET /api/v2/evolution-chain/{id}/`)**: `chain` is an n-ary tree (`evolves_to[]`) supporting linear chains (Bulbasaur), 2-way splits (Wurmple), and 8-way splits (Eevee). Triggers in `evolution_details[]` include `min_level`, `item.name`, `trigger.name` (`level-up`, `use-item`, `trade`, `shed`, `spin`, etc.), `min_happiness`, `time_of_day`, `held_item`, `known_move`, and `location`, which map into concise human-readable labels (e.g., `Lv. 16`, `Thunder Stone`, `Friendship · Day`, `Trade`).

---

## 3. UI Stack: Expo Router + gluestack-ui + NativeWind + Accessible 18-Type Tokens

- **Decision**: Use Expo managed workflow (`expo-router/entry` main entry), **gluestack-ui** components installed under `components/ui/` and styled via **NativeWind** (`global.css`, `tailwind.config.js`, `babel.config.js`, `metro.config.js`, `nativewind-env.d.ts`), `GluestackUIProvider` + `SafeAreaProvider` in `app/_layout.tsx`, and a centralized accessible token module (`src/theme/pokemon-types.ts`) for all 18 Pokémon types.
- **Rationale**: `gluestack-ui` provides accessible React Native primitives (`Actionsheet` for the filter bottom sheet, `Badge` for type/ability tags, `Progress` for base stat and caught counters, `Input`, `Button`, `Skeleton`) with Tailwind utility ergonomics via NativeWind and full ownership of component files. Centralizing all 18 elemental type colors guarantees >= 4.5:1 WCAG AA foreground contrast for white/dark badge text across light and dark shades (for example, Electric `#F7D02C` and Ice `#96D9D6` require dark foreground text `#111827`, whereas Fire/Water/Dragon/Dark use light text `#FFFFFF`).
- **Alternatives considered**:
  - Hand-rolled React Native `StyleSheet` + custom modal sheets: more boilerplate for bottom-sheet focus, backdrop, and keyboard avoidance.
  - Third-party UI kits without Tailwind/NativeWind: conflicts with the requested gluestack-ui + NativeWind architecture.

---

## 4. Offline Caching & Collection Persistence (TanStack Query + AsyncStorage)

- **Decision**: Use `@tanstack/react-query`, `@tanstack/react-query-persist-client`, `@tanstack/query-async-storage-persister`, and `@react-native-async-storage/async-storage` with `PersistQueryClientProvider` (`gcTime: 7 days`, `maxAge: 7 days`, `staleTime: 24 hours`, `buster: 'v1'`) plus `@react-native-community/netinfo` wired to `onlineManager`, while storing `Caught` and `Favorite` IDs separately behind a swappable `CollectionStorageAdapter` (`src/storage/collection-storage.ts`).
- **Rationale**:
  - Setting `gcTime >= maxAge` ensures TanStack Query does not immediately garbage-collect hydrated entries after app startup when offline (Constitution Principle II + Spec Q4).
  - Keeping `CollectionStorageAdapter` (`pokedex:collection:v1`) isolated from the query cache guarantees cache-busting or query eviction never wipes the trainer's `Caught` or `Favorite` records, and allows swapping `AsyncStorage` for MMKV or SQLite behind a single interface (`load`, `save`, `clear`).
  - Configuring `networkMode: 'offlineFirst'` lets already-cached catalog pages and detail screens render immediately offline while failed fetches for uncached data trigger explicit retry UI.
- **Alternatives considered**:
  - Bundling a static SQLite database of all 1,025 Pokémon inside the app binary: violates simplicity (YAGNI) and bypasses live PokéAPI v2 integration.
  - Storing collection state inside Redux/Zustand persist alongside API cache: couples personal user data to volatile query cache lifecycles.

---

## 5. Pure Domain Type-Effectiveness Engine & Input Validation

- **Decision**: Implement the canonical 18×18 Pokémon defensive type-effectiveness matrix, base stat total aggregation, search/filter matching, and input/route parameter sanitization as pure, framework-free TypeScript functions in `src/domain/`.
- **Rationale**: Computing defensive multipliers (`0x`, `0.25x`, `0.5x`, `1x`, `2x`, `4x`) deterministically in `src/domain/type-effectiveness.ts` guarantees 100% accuracy for single-type and dual-type Pokémon (including regional, Mega, and Gigantamax form switches) with zero network latency and instant unit testing (Constitution Principles I & V).
- **Alternatives considered**:
  - Recomputing defensive multipliers from live `/type/{id}` responses on every detail view: requires extra network calls when switching forms and fails offline if the second type wasn't previously fetched.

---

## 6. Media Caching, List Virtualization & Deterministic Testing

- **Decision**: Use `expo-image` (`cachePolicy="memory-disk"`) for catalog sprites and detail artwork, tuned `FlatList` (`numColumns={2}`, `initialNumToRender={12}`, `maxToRenderPerBatch={12}`, `windowSize={7}`, `removeClippedSubviews` on Android) for smooth scrolling, and **Jest (`jest-expo`) + React Native Testing Library** with deterministic mocked PokéAPI fixtures in `__tests__/fixtures/`.
- **Rationale**: `expo-image` caches artwork across sessions on disk for offline viewing of previously opened Pokémon. Standard `FlatList` avoids external list dependencies (`@shopify/flash-list` native measurement quirks in Jest) while delivering smooth 60fps 2-column rendering. `jest-expo` + RNTL enables fast, offline unit and screen/component tests verifying all Constitution and Spec requirements.
- **Alternatives considered**:
  - React Native `<Image>`: inconsistent disk caching across iOS and Android offline launches.
  - `@shopify/flash-list`: extra native dependency and layout-estimation complexity in Jest; unnecessary unless profiling later requires it (YAGNI).
