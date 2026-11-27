# Contract: Navigation Routes & Deep Links

**Scope**: `app/_layout.tsx`, `app/index.tsx`, `app/pokemon/[idOrName].tsx`, `src/domain/navigation.ts`

## 1. Expo Router Route Map

| Route File | URL Path / Deep Link | Purpose |
| --- | --- | --- |
| `app/_layout.tsx` | Root Layout | Wraps app in `SafeAreaProvider`, `GluestackUIProvider`, `PersistQueryClientProvider`, and `Stack` navigator |
| `app/index.tsx` | `/` (`pokedex://`) | Pokédex Catalog screen (search, Caught progress counter, collection pills, `Filters` sheet trigger, 2-column grid) |
| `app/pokemon/[idOrName].tsx` | `/pokemon/[idOrName]` (`pokedex://pokemon/:idOrName`) | Detailed Pokédex Entry screen (hero artwork, shiny/form selectors, stats, abilities, flavor text, type matchups, evolution chain) |

## 2. Route Parameter Validation (`FR-013`)

`parsePokemonRouteParam(rawParam: string | string[] | undefined): ParsedRouteTarget`

| Input Example | Normalized Result | Screen Behavior |
| --- | --- | --- |
| `"25"`, `"0025"`, `"#0025"` | `{ ok: true, lookupKey: "25", numericId: 25 }` | Loads species `#0025` (`Pikachu`) |
| `"pikachu"`, `"  Pikachu  "`, `"mr-mime"` | `{ ok: true, lookupKey: "pikachu", numericId: null }` | Loads species by normalized slug |
| `"0"`, `"-5"`, `"9999"`, `""`, `"pikachu!!"` | `{ ok: false, reason: "INVALID_PARAM" }` | Renders immediate recoverable Not Found state with `Back to Pokédex` button (zero network call, zero crash) |
| Valid-looking slug returning `404` (`"missingno"`) | `PokedexApiError('NOT_FOUND')` | Renders recoverable Not Found state with `Back to Pokédex` button |

## 3. Navigation Invariants

1. **Evolution Chain Navigation (`FR-010`)**: Tapping another node in the evolution chain pushes `/pokemon/${node.slug}` so standard native iOS swipe-back and Android hardware/header back navigation return cleanly to the previous stage.
2. **Same-Screen Safeguard**: Tapping the currently viewed Pokémon node in the evolution chain is a no-op (does not push a duplicate stack entry).
3. **Minimum Touch Target (`FR-016`)**: All navigation triggers (catalog cards, back button, evolution stage nodes) enforce at least `44x44pt` / `48x48dp` interactive hit areas and descriptive VoiceOver/TalkBack labels.
