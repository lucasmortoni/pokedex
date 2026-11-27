# Feature Specification: Mobile Pokédex

**Feature Branch**: `feat/mobile-pokedex`

**Created**: 2026-11-27

**Status**: Draft

**Input**: User description: "Build a mobile Pokédex application where trainers can explore Pokémon and track their collection. Core capabilities: 1. Browse Catalog: Display a smoothly scrolling, virtualized list or 2-column grid of Pokémon showing each Pokémon's National Dex number (formatted like #0001), name, primary and secondary elemental types, and artwork or sprite, with touch-friendly pagination or infinite scroll and pull-to-refresh. 2. Search & Filter: Let users search in real time by Pokémon name (case-insensitive partial match) or National Dex number, and filter via mobile-friendly filter controls (such as a filter sheet or horizontal filter chips) by elemental type (all 18 types, supporting single or dual-type matching), generation/region (Gen I Kanto through Gen IX Paldea), and collection status (All, Caught, Favorites), with an easy way to clear active filters and a clear empty state when no Pokémon match. 3. Detailed Pokédex Entry View: Tapping a Pokémon opens a detail screen showing: high-resolution official artwork and a toggle between default and shiny sprites; elemental types along with calculated defensive type effectiveness (weaknesses 2x/4x, resistances 0.5x/0.25x, and immunities 0x); base stats (HP, Attack, Defense, Sp. Atk, Sp. Def, Speed, and Stat Total) rendered with clear visual bars; abilities (clearly distinguishing regular abilities from Hidden Abilities); physical profile (category/genus, height, weight) and Pokédex flavor text entry; interactive evolution chain showing evolution stages and triggers (such as level, item, or friendship), where tapping another stage navigates to that Pokémon's entry. 4. Personal Collection Tracking: Let users mark any Pokémon as Caught or Favorite from either the catalog card or the detail screen, persist those selections locally across app restarts, and show an overall caught progress counter (e.g., Caught X / Y)."

## Clarifications

### Session 2026-11-27

- Q: How should regional forms (Alolan, Galarian, Hisuian, Paldean) and special battle variants (Mega, Gigantamax) be handled in the Pokédex catalog and detail screen? → A: Show base National Dex species only in the main catalog, and provide a form selector inside the detail screen to inspect regional, Mega, and Gigantamax variants (updating artwork, types, type effectiveness, stats, and abilities per form).
- Q: How should search and multi-facet filters be organized on small mobile screens, and which Pokémon should they match against? → A: Search bar + inline collection-status pills (`All`, `Caught`, `Favorites`) on the catalog screen, with elemental types (18) and generations (Gen I–IX) inside a `Filters` bottom sheet; search and filters always match across the full Gen I–IX catalog.
- Q: How should multi-game Pokédex flavor text entries be displayed on a Pokémon's detail screen? → A: Default to the most recent available English game entry and provide a compact game-version selector on the detail screen to switch between available English game entries for that species.
- Q: What should remain accessible when the trainer uses the app offline, and should `Caught` and `Favorite` tracking be stored per base species or per individual form? → A: Track `Caught` and `Favorite` per base National Dex species (shared across its regional/Mega/Gigantamax forms), and persist previously fetched catalog and detail entries locally so cached Pokémon remain browsable offline while uncached entries show an offline retry state.
- Q: How should the catalog handle incremental loading and pull-to-refresh when browsing or filtering? → A: Use automatic infinite scroll (with a loading footer and inline retry on page failure); pull-to-refresh refreshes data while preserving active search/filters and keeping already-displayed cached items intact if the refresh fails offline.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse the Pokémon Catalog (Priority: P1)

A trainer opens the mobile Pokédex and immediately browses a smoothly scrolling list or 2-column grid of Pokémon ordered by National Dex number. Each catalog card shows the formatted National Dex number (for example, `#0001`), species name, primary and optional secondary elemental type badges, and official artwork or sprite, while supporting incremental loading as the trainer scrolls and pull-to-refresh to retry or refresh data.

**Why this priority**: Browsing the catalog is the foundational entry point of the Pokédex; without an immediately usable, legible, and resilient mobile catalog, no other exploration or tracking capability is reachable.

**Independent Test**: Can be fully tested by launching the app with catalog data available (and under simulated offline/error conditions), scrolling through multiple pages of Pokémon cards, and triggering pull-to-refresh without using search, filters, detail views, or collection tracking.

**Acceptance Scenarios**:

1. **Given** the trainer opens the mobile Pokédex for the first time with network connectivity, **When** the catalog finishes loading its initial batch, **Then** Pokémon cards appear in ascending National Dex order showing `#0001`-style numbers, names, primary/secondary type badges, and artwork or sprites.
2. **Given** the trainer is browsing the catalog, **When** they scroll near the end of the currently loaded list, **Then** automatic infinite scroll fetches the next batch with a visible loading footer without losing scroll position, and displays an inline retry footer (preserving already-loaded items) if that batch fails to load.
3. **Given** the trainer is viewing the catalog (with or without active search/filters), **When** they perform a pull-to-refresh gesture, **Then** the catalog refreshes data while preserving active search and filter selections, and keeps already-displayed cached items intact with a clear non-destructive notice if the refresh fails offline.
4. **Given** the trainer opens the app offline or encounters a temporary network or rate-limit failure before catalog data is available, **When** the load fails, **Then** the screen displays an explicit, user-friendly error or offline message with a single-tap retry action instead of a blank screen or endless spinner.

---

### User Story 2 - Search and Multi-Facet Filter (Priority: P2)

A trainer narrows the Pokédex catalog in real time using a persistent search bar and inline collection-status pills (`All`, `Caught`, `Favorites`) on the catalog screen, plus a `Filters` button that opens a bottom sheet for elemental type (all 18 canonical types, single or dual-type matching) and generation/region (Generation I Kanto through Generation IX Paldea). Search and filters always evaluate against the full Gen I–IX catalog rather than only already-scrolled items. Active filters are clearly indicated and can be cleared easily, and zero-match queries present a helpful empty state.

**Why this priority**: With over a thousand Pokémon across nine generations, real-time search and multi-facet filtering are essential for finding specific species or planning teams quickly on a phone screen.

**Independent Test**: Can be fully tested from the catalog screen by typing partial names and numeric IDs (`pik`, `25`, `0025`, `#0025`), toggling inline collection-status pills and type/generation selections in the `Filters` bottom sheet individually and together, verifying full-catalog matching, checking zero-match empty states, and tapping the clear/reset action.

**Acceptance Scenarios**:

1. **Given** the catalog is loaded, **When** the trainer types `char` into the search field, **Then** the catalog updates in real time using case-insensitive partial matching across the full Gen I–IX catalog to show matching species such as Charmander, Charmeleon, and Charizard.
2. **Given** the catalog is loaded, **When** the trainer searches by `25`, `0025`, or `#0025`, **Then** Pikachu (`#0025`) is matched cleanly regardless of leading zeros or the `#` prefix.
3. **Given** the trainer opens the `Filters` bottom sheet, **When** they select an elemental type (e.g., `Fire`), a dual-type combination (e.g., `Water` + `Ground`), or a generation/region (e.g., `Gen III Hoenn`), **Then** only Pokémon matching all active criteria across the full Gen I–IX catalog (even species not yet scrolled to) are shown and active filter indicators remain visible.
4. **Given** the trainer has marked several Pokémon as Caught or Favorite, **When** they tap the inline `Caught` or `Favorites` collection-status pill, **Then** only Pokémon with that collection status appear in the catalog.
5. **Given** a search query or combined filter matches zero Pokémon, **When** the catalog updates, **Then** a clear empty state explains that no Pokémon matched and offers a one-tap action to clear active filters and search text.

---

### User Story 3 - Inspect Detailed Pokédex Entry (Priority: P2)

A trainer taps any Pokémon card in the catalog (or opens a deep-link/navigation target to a Pokémon) to view its dedicated detail screen. The detail screen displays high-resolution official artwork with a default/shiny sprite toggle, a form selector when regional (Alolan, Galarian, Hisuian, Paldean), Mega, or Gigantamax variants exist, elemental types alongside calculated defensive type effectiveness (`4x`, `2x`, `0.5x`, `0.25x`, and `0x` immunities), all six base stats plus total with visual bars, regular and Hidden Abilities, physical profile and Pokédex flavor text, and an interactive evolution chain where tapping another stage navigates directly to that Pokémon's entry.

**Why this priority**: Deep species inspection—especially defensive type matchups, base stats, abilities, and evolution triggers—is the primary informational reason trainers consult a Pokédex.

**Independent Test**: Can be fully tested by opening a multi-type Pokémon with a Hidden Ability and branching evolution (such as Eevee `#0133` or Charizard `#0006`), toggling Shiny artwork, verifying all stat bars and defensive multipliers, tapping another evolution stage, and also navigating to an unknown Pokémon identifier to verify safe error handling.

**Acceptance Scenarios**:

1. **Given** the trainer taps a Pokémon in the catalog, **When** the detail screen opens, **Then** it displays the Pokémon's formatted National Dex number, name, high-resolution default artwork, category/genus, height, weight, the most recent available English Pokédex flavor text entry by default, and a compact game-version selector to switch between available English game entries for that species.
2. **Given** the trainer is on a Pokémon detail screen, **When** they toggle between Default and Shiny appearance, **Then** the displayed artwork/sprite updates to the corresponding variant (or displays a clear fallback note if no shiny asset exists for that entry).
3. **Given** the trainer views a single-type or dual-type Pokémon (for example, Grass/Poison or Water/Ground), **When** defensive type effectiveness is displayed, **Then** all attacking types are grouped accurately into canonical multipliers (`4x`, `2x`, `0.5x`, `0.25x`, and `0x` immunity, with neutral `1x` clearly excluded or separated).
4. **Given** the trainer views the stats, abilities, and evolution sections, **When** the entry loads, **Then** HP, Attack, Defense, Sp. Atk, Sp. Def, Speed, and Stat Total render with proportional visual bars, Hidden Abilities are visibly labeled separately from regular abilities, and each evolution stage shows its evolution trigger (such as level, item, or friendship).
5. **Given** the trainer is viewing a Pokémon that belongs to an evolution chain, **When** they tap another stage in the chain (including branching evolutions), **Then** the app navigates to that target Pokémon's detail screen and allows returning smoothly via standard mobile back navigation.
6. **Given** the trainer opens a Pokémon that has regional (Alolan, Galarian, Hisuian, Paldean), Mega, or Gigantamax forms (for example, Raichu or Charizard), **When** they select an alternate form in the form selector, **Then** the detail screen updates the artwork, shiny toggle, elemental types, defensive type effectiveness, base stats, abilities, and physical dimensions to match the selected form.
7. **Given** the app receives an unknown, malformed, or out-of-range Pokémon identifier via deep link or navigation, **When** the detail screen loads, **Then** the screen displays a clear not-found state with an action to return to the catalog rather than crashing or showing a blank screen.

---

### User Story 4 - Track Personal Collection (Priority: P3)

A trainer marks or unmarks any Pokémon as `Caught` or `Favorite` directly from either a catalog card or the detail screen. Selections update immediately across the app, contribute to an overall caught progress counter (e.g., `Caught X / Y`), and persist locally across app restarts.

**Why this priority**: Collection tracking turns the encyclopedia into a personal companion tool and integrates seamlessly with the catalog filter once browsing and detail inspection are in place.

**Independent Test**: Can be fully tested by toggling `Caught` and `Favorite` on several Pokémon from both the catalog and detail screens, verifying the caught progress counter increments and decrements accurately, force-closing and reopening the app, and confirming all selections remain intact.

**Acceptance Scenarios**:

1. **Given** the trainer views a Pokémon on a catalog card or detail screen (including any regional, Mega, or Gigantamax form view), **When** they tap the `Caught` or `Favorite` toggle, **Then** the species-level toggle state updates immediately and remains synchronized between the catalog and every form view of that base National Dex species.
2. **Given** the trainer marks or unmarks Pokémon as `Caught`, **When** the collection updates, **Then** the overall caught progress counter (`Caught X / Y`) updates immediately per unique base National Dex species without double-counting forms or duplicates.
3. **Given** the trainer has marked Pokémon as `Caught` or `Favorite` and browsed catalog or detail entries, **When** they completely close and relaunch the app offline, **Then** all `Caught` and `Favorite` selections, the `Caught X / Y` counter, and previously fetched catalog and detail entries remain viewable locally, while opening an uncached entry displays an explicit offline retry state.

---

### Edge Cases

- **Invalid Search & Deep-Link Inputs**: Whitespace-only queries, special characters, negative numbers, `#0000`, numbers beyond the supported Dex range, or unknown species slugs in navigation/deep links MUST NOT crash or show blank screens; search shows the empty state and invalid detail routes show a recoverable not-found screen.
- **Zero-Match Combined Filters**: Combining incompatible facets (e.g., `Gen I Kanto` + `Dark` type, or `Favorites` before any Pokémon is favorited) MUST display a clear empty state explaining why nothing matched and provide a one-tap reset.
- **Incomplete or Asymmetric Pokémon Data**:
  - Single-type Pokémon have only a primary type and no empty placeholder badge for a secondary type.
  - Pokémon without a Hidden Ability display only their regular ability (or abilities) without showing a broken Hidden label.
  - Single-stage Pokémon (such as Tauros or Kangaskhan) display a clear single-stage evolution state rather than an empty or broken chain.
  - Branching evolutions (such as Eevee's 8 evolutions or Wurmple's split) and baby/multi-step evolutions render every branch and trigger cleanly without horizontal clipping on narrow phone screens.
  - Entries missing shiny artwork or missing flavor text in the preferred game version fall back gracefully to an available valid asset/text or an explicit unavailable notice.
- **Regional & Special Forms**: Regional forms (Alolan, Galarian, Hisuian, Paldean) and special battle variants (Mega, Gigantamax) are accessible exclusively via the base species' detail-screen form selector, do not appear as duplicate cards in the main catalog, and do not inflate the `Caught X / Y` National Dex denominator; species with no alternate forms omit the form selector cleanly.
- **Poor Connectivity, Offline & Rate Limiting**: Slow networks show non-blocking loading skeletons; mid-session offline pagination failures preserve already loaded catalog entries and show an inline retry control; previously fetched catalog and detail entries persist locally so cached Pokémon remain browsable across offline app restarts alongside local collection toggling, while uncached entries accessed offline present an explicit offline state with a one-tap retry action.
- **Compact Mobile Ergonomics & Accessibility**: Long Pokémon names, dual type badges, evolution triggers, and stat labels MUST wrap or adapt cleanly under dynamic system text scaling and inside device safe areas (notches, rounded corners, home indicators) with VoiceOver/TalkBack labels and `44x44pt` / `48x48dp` minimum touch targets.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application MUST display a smoothly scrolling catalog of base National Dex Pokémon species (Generation I through Generation IX, excluding alternate forms as separate catalog cards) in ascending National Dex order, showing each entry's formatted National Dex number (`#0001` zero-padded to at least 4 digits), name, primary and optional secondary elemental types, and official artwork or sprite.
- **FR-002**: The catalog MUST load Pokémon incrementally via automatic infinite scroll (displaying a loading footer while fetching and an inline retry control on batch failure without clearing already-loaded items) and MUST support pull-to-refresh that refreshes catalog data while preserving active search/filter state and retaining already-displayed cached items if the refresh fails offline.
- **FR-003**: Users MUST be able to search across the full Gen I–IX catalog in real time (not limited to already-scrolled pages) by Pokémon name (case-insensitive partial match) or National Dex number (supporting unpadded numbers, zero-padded numbers, and `#`-prefixed inputs such as `25`, `0025`, and `#0025`).
- **FR-004**: Users MUST be able to filter across the full Gen I–IX catalog via inline collection-status pills (`All`, `Caught`, `Favorites`) directly on the catalog screen and a `Filters` bottom sheet for elemental types and generations, evaluating all three facets simultaneously:
  - Elemental type covering all 18 canonical types (Normal, Fire, Water, Electric, Grass, Ice, Fighting, Poison, Ground, Flying, Psychic, Bug, Rock, Ghost, Dragon, Dark, Steel, Fairy), supporting both single-type and dual-type matching
  - Generation/region from Generation I (Kanto) through Generation IX (Paldea)
  - Collection status (`All`, `Caught`, `Favorites`)
- **FR-005**: The catalog MUST display visible indicators for active filters, provide a one-tap action to clear active filters/search, and display a clear empty state with recovery guidance whenever zero Pokémon match.
- **FR-006**: Tapping any Pokémon card MUST navigate to a detail screen presenting that Pokémon's formatted National Dex number, name, category/genus, metric height and weight, high-resolution official artwork, a toggle between Default and Shiny sprites, the most recent available English Pokédex flavor text entry by default (with control and line-break characters normalized for clean reading), and a compact game-version selector to switch between available English game entries for that species.
- **FR-007**: The detail screen MUST compute and display canonical defensive type effectiveness for the Pokémon's single or dual elemental types, accurately categorizing attacking types into weaknesses (`4x`, `2x`), resistances (`0.5x`, `0.25x`), and immunities (`0x`).
- **FR-008**: The detail screen MUST display all six base stats (`HP`, `Attack`, `Defense`, `Sp. Atk`, `Sp. Def`, `Speed`) and their calculated `Stat Total` with proportional visual stat bars and accessible numeric values.
- **FR-009**: The detail screen MUST list the Pokémon's abilities and explicitly distinguish regular abilities from Hidden Abilities.
- **FR-010**: The detail screen MUST display the Pokémon's complete evolution chain—including linear, multi-stage, and branching evolutions alongside each step's evolution trigger (such as level, item, trade, time of day, or friendship)—and MUST allow users to tap any other stage to navigate directly to that Pokémon's entry.
- **FR-011**: Users MUST be able to toggle `Caught` and `Favorite` status per base National Dex species (shared across its regional, Mega, and Gigantamax forms) from both the catalog card and the detail screen, with changes reflected immediately across all views.
- **FR-012**: The application MUST persist `Caught` and `Favorite` selections per base National Dex species locally on the user's device across app restarts and display an accurate overall caught progress counter (`Caught X / Y`).
- **FR-013**: The application MUST validate and sanitize search queries, filter combinations, and navigation/deep-link parameters so invalid, malformed, or unknown Pokémon identifiers produce a safe empty or recoverable not-found state without crashing or showing blank screens.
- **FR-014**: The application MUST persist previously fetched catalog, species, type, and evolution entries locally across sessions so cached Pokémon remain browsable offline without redundant network requests, while uncached entries or failed requests due to offline, rate-limit, or network failures MUST display clear loading indicators or actionable retry states.
- **FR-015**: All interactive controls, stat bars, elemental type badges, and collection toggles MUST include descriptive screen-reader labels compatible with mobile assistive technologies (VoiceOver and TalkBack).
- **FR-016**: All interactive touch targets MUST meet minimum mobile touch ergonomics (`44x44pt` on iOS / `48x48dp` on Android), respect device safe-area insets, support dynamic text scaling without clipping essential information, and maintain readable contrast across all 18 elemental type badges.
- **FR-017**: For any Pokémon species that has regional (Alolan, Galarian, Hisuian, Paldean), Mega, or Gigantamax variants, the detail screen MUST provide a form selector that updates displayed artwork (and default/shiny toggle), elemental types, calculated defensive type effectiveness, base stats and total, abilities, and physical dimensions to reflect the selected form; species without alternate forms MUST omit the selector.

### Key Entities *(include if feature involves data)*

- **PokemonSummary**: Compact catalog representation of a Pokémon containing its National Dex number, display name, primary and optional secondary elemental types, generation/region, and thumbnail/sprite reference.
- **PokemonEntry**: Full Pokédex species profile extending summary data with high-resolution default and shiny artwork references, category/genus, height, weight, version-tagged English flavor text entries (defaulting to the most recent available game version), six base stats, calculated stat total, abilities (each marked as regular or Hidden), optional alternate forms, and reference to its evolution chain.
- **PokemonForm**: Variant profile belonging to a PokemonEntry (such as Default, Alolan, Galarian, Hisuian, Paldean, Mega, or Gigantamax), holding form-specific display label, default and shiny artwork references, elemental types, six base stats and stat total, abilities, height, and weight.
- **TypeEffectivenessProfile**: Calculated defensive matchup summary for a given 1-type or 2-type combination mapping each of the 18 attacking elemental types to its canonical multiplier (`0x`, `0.25x`, `0.5x`, `1x`, `2x`, `4x`).
- **EvolutionChain / EvolutionStage**: Directed tree of related Pokémon species nodes, where each evolution transition captures the target Pokémon identifier, display name, sprite reference, and human-readable evolution trigger conditions.
- **CollectionRecord**: On-device per-Pokémon personal tracking state storing boolean flags (or timestamps) for `Caught` and `Favorite`, keyed by National Dex identifier, driving the `Caught X / Y` progress summary.
- **CatalogFilterState**: Active search query text, selected elemental type(s), selected generation/region, and selected collection status filter (`All`, `Caught`, `Favorites`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Trainers can locate any specific Pokémon by name or National Dex number and open its detail screen in under 5 seconds under normal network conditions.
- **SC-002**: 100% of single-type and dual-type defensive effectiveness calculations match canonical Pokémon type-chart multipliers (`0x`, `0.25x`, `0.5x`, `1x`, `2x`, `4x`), and 100% of base stat totals equal the exact sum of the six displayed base stats.
- **SC-003**: 100% of `Caught` and `Favorite` selections and the `Caught X / Y` counter remain intact across full app restarts with zero data loss.
- **SC-004**: 0 application crashes or blank screens occur when entering invalid search queries, zero-match filter combinations, or unknown/malformed Pokémon navigation identifiers.
- **SC-005**: 100% of network-failure or offline states present a clear status message and allow the trainer to recover in 1 tap once connectivity returns, without losing already displayed catalog items or collection progress.
- **SC-006**: 100% of interactive controls meet minimum mobile touch-target dimensions (`44x44pt` / `48x48dp`), and 100% of stat bars, type badges, and action toggles expose meaningful screen-reader labels without text clipping across standard and enlarged mobile font sizes.
- **SC-007**: Trainers can scroll continuously through at least the first 151 Pokémon (and across all Gen I–IX entries) without visual stutter, broken artwork placeholders, or unresponsive tap interactions.

## Assumptions

- **Catalog Scope (Gen I–IX)**: The main catalog lists canonical base National Dex species from Generation I (Kanto) through Generation IX (Paldea), while regional variants (Alolan, Galarian, Hisuian, Paldean) and special battle forms (Mega, Gigantamax) are inspected inside the detail screen's form selector.
- **Dual-Type Filter Semantics**: Selecting 1 elemental type matches any Pokémon that has that type as either its primary or secondary type; selecting 2 elemental types matches Pokémon that possess both types.
- **Flavor Text & Units**: Flavor text defaults to the most recent available English Pokédex entry for the species alongside a compact game-version selector for other available English game versions, and physical dimensions display in metric units (meters and kilograms).
- **Single-User Local Persistence**: Personal collection tracking (`Caught` and `Favorite`) is keyed per base National Dex species and stored locally per device alongside locally persisted copies of previously fetched catalog and detail entries for offline browsing, with no login, user accounts, or cloud synchronization required in v1.
- **Progress Denominator**: The `Y` in `Caught X / Y` represents the total count of distinct Pokémon species in the Gen I–IX National Dex catalog.
- **Incremental Loading**: The catalog uses automatic infinite scroll with a loading and inline retry footer plus non-destructive pull-to-refresh that preserves active search/filter selections and retains already-displayed cached items on offline failure.
