# Validation Quickstart: Mobile Pokédex

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Data Model**: [data-model.md](data-model.md)

Use this checklist after `/speckit-implement` to verify the mobile Pokédex app end-to-end against the specification, clarifications, and constitution.

## 1. Prerequisites & Local Run

- **Node.js (LTS)** (`20.x` or `22.x` recommended)
- **Expo Go** on iOS/Android, or **iOS Simulator** (macOS) / **Android Emulator**

```bash
# Install dependencies
npm install

# Run deterministic unit & screen/component tests (no live network)
npm test

# Typecheck
npx tsc --noEmit

# Start Expo dev server (clear Metro cache if NativeWind config changed)
npx expo start -c
```

## 2. End-to-End Validation Scenarios

### A. Catalog Browsing & Infinite Scroll (US1, Q5)
1. Open the app online: confirm Pokémon appear in `#0001`-formatted ascending National Dex order in a 2-column grid with names, type badges, and sprites.
2. Scroll past the first 24 items: confirm a loading footer triggers automatic infinite scroll without losing scroll position.
3. Pull down to refresh: confirm active search/filters remain intact. Turn off device network and pull down again: confirm existing cards stay visible and a non-destructive offline notice appears.

### B. Full-Catalog Search & Filter Sheet (US2, Q2)
1. Type `char` in the search bar: confirm real-time matching across Gen I–IX (not just already-scrolled cards).
2. Clear search and enter `25`, `0025`, and `#0025`: confirm Pikachu (`#0025`) matches in all three formats.
3. Open the `Filters` bottom sheet, select `Water` + `Ground` and `Gen III (Hoenn)`, and tap `Apply`: confirm matching dual-type Hoenn species (e.g., Marshtomp, Swampert) appear.
4. Search for an impossible combination (e.g., `zzzz`): confirm the empty state appears with a 1-tap `Reset Filters` button.

### C. Detailed Pokédex Entry, Forms, Flavor & Evolutions (US3, Q1, Q3)
1. Open **Charizard (`#0006`)** or **Raichu (`#0026`)**:
   - Toggle **Default / Shiny**: confirm official artwork updates cleanly.
   - Select an alternate form pill (e.g., **Mega Charizard X** or **Alolan Raichu**): confirm types, defensive type multipliers (`4x`, `2x`, `0.5x`, `0.25x`, `0x`), base stats, abilities (regular vs. Hidden badge), and height/weight update immediately.
   - Switch the game-version flavor text picker: confirm clean English text with no control characters (`\f` / soft hyphens).
2. Open **Eevee (`#0133`)**: confirm all 8 branching evolution targets render with triggers (`Water Stone`, `Thunder Stone`, `Friendship`, etc.) and tapping one navigates to that entry (and native back returns to Eevee).
3. Deep-link or navigate to `/pokemon/unknown-mon` or `/pokemon/0`: confirm a recoverable Not Found state appears with `Back to Pokédex` (no crash or blank screen).

### D. Personal Collection & Offline Persistence (US4, Q4)
1. Mark `#0025 Pikachu` as **Caught** and **Favorite** from the catalog card; open `#0026 Raichu`, switch to its **Alolan** form, and mark **Caught** from the detail screen.
2. Verify the counter displays `Caught 2 / 1025`, and toggling the inline `Caught` and `Favorites` pills filters accurately.
3. Force-close the app, enable Airplane Mode, and reopen:
   - Confirm `Caught 2 / 1025` and Favorites persist intact.
   - Confirm previously opened entries (e.g., Pikachu/Raichu) remain viewable offline, while opening a never-fetched entry shows an explicit offline retry screen.

### E. Mobile Accessibility & Ergonomics (`FR-015`, `FR-016`)
- Enable **VoiceOver** (iOS) or **TalkBack** (Android) and verify spoken labels on catalog cards, Caught/Favorite toggles, type badges, stat bars, form pills, and evolution stage buttons.
- Increase system font size and verify no essential text clips on narrow phone viewports (`375pt` width) or inside safe areas.
