# Data Model: Mobile Pokédex

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Research**: [research.md](research.md)

## 1. Core Domain Types (`src/domain/types.ts`)

### 1.1 Canonical Enumerations

```ts
export const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
] as const;

export type PokemonTypeName = (typeof POKEMON_TYPES)[number];

export type GenerationId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type CollectionStatusFilter = 'all' | 'caught' | 'favorites';

export type EffectivenessMultiplier = 0 | 0.25 | 0.5 | 1 | 2 | 4;
```

### 1.2 Catalog Index & Card Entities

| Entity | Field | Type / Constraint | Notes |
| --- | --- | --- | --- |
| **PokemonCatalogIndexItem** | `id` | `number` (`1..1025`) | Base National Dex species ID |
| | `dexNumber` | `string` (`#0001`–`#1025`) | Zero-padded to minimum 4 digits (`formatDexNumber`) |
| | `slug` | `string` | Canonical PokéAPI species slug (e.g., `mr-mime`) |
| | `name` | `string` | Human-readable display name (e.g., `Mr. Mime`, `Pikachu`) |
| | `generation` | `GenerationId` (`1..9`) | Derived deterministically from `id` range |
| | `region` | `string` | `Kanto`, `Johto`, `Hoenn`, `Sinnoh`, `Unova`, `Kalos`, `Alola`, `Galar`, `Paldea` |
| **PokemonSummary** | *(extends index item)* | — | Hydrated per-card data for visible catalog pages |
| | `types` | `[PokemonTypeName] \| [PokemonTypeName, PokemonTypeName]` | 1 or 2 elemental types |
| | `spriteUrl` | `string \| null` | Official artwork or default front sprite URL |

### 1.3 Detailed Entry & Alternate Form Entities

| Entity | Field | Type / Constraint | Notes |
| --- | --- | --- | --- |
| **PokemonBaseStats** | `hp`, `attack`, `defense`, `spAtk`, `spDef`, `speed` | `number` (`1..255`) | Individual canonical base stats |
| | `total` | `number` | Exact sum of all 6 stats |
| **PokemonAbility** | `slug` | `string` | Raw PokéAPI ability slug |
| | `name` | `string` | Title-cased display name |
| | `isHidden` | `boolean` | Distinguishes regular abilities (`false`) from Hidden Abilities (`true`) |
| | `slot` | `number` | PokéAPI ability slot order |
| **FlavorTextEntry** | `versionSlug` | `string` | Game version identifier (e.g., `scarlet`, `shield`, `red`) |
| | `versionLabel` | `string` | Display label (e.g., `Scarlet`, `Shield`, `Red`) |
| | `text` | `string` | Normalized English text (`\f`, `\n`, `\r`, `\u00ad` cleaned) |
| **PokemonForm** | `id` | `number` | PokéAPI `/pokemon/{id}` ID for this form |
| | `slug` | `string` | e.g., `raichu`, `raichu-alola`, `charizard-mega-x`, `pikachu-gmax` |
| | `label` | `string` | Derived user-friendly tab label (`Default`, `Alolan`, `Galarian`, `Hisuian`, `Paldean`, `Mega`, `Mega X`, `Mega Y`, `Gigantamax`) |
| | `isDefault` | `boolean` | `true` for canonical National Dex base form |
| | `types` | `[PokemonTypeName] \| [PokemonTypeName, PokemonTypeName]` | Form-specific types |
| | `artworkUrl` | `string \| null` | High-resolution official default artwork |
| | `shinyArtworkUrl` | `string \| null` | High-resolution official shiny artwork (fallback to shiny front sprite) |
| | `stats` | `PokemonBaseStats` | Form-specific stats & total |
| | `abilities` | `PokemonAbility[]` | Form-specific regular + Hidden abilities |
| | `heightMeters` | `number` | Converted from PokéAPI decimeters (`height / 10`) |
| | `weightKg` | `number` | Converted from PokéAPI hectograms (`weight / 10`) |
| **PokemonVarietyRef** | `slug`, `label`, `isDefault`, `pokemonId` | metadata before form fetch | Derived from `species.varieties[]`; drives form pills before lazy load |
| **PokemonEntry** | `id`, `dexNumber`, `slug`, `name`, `generation`, `region` | Base species identity | Matches `PokemonCatalogIndexItem` |
| | `genus` | `string` | English genus (e.g., `Mouse Pokémon`) |
| | `flavorTexts` | `FlavorTextEntry[]` | Ordered newest-to-oldest English entries |
| | `defaultFlavorVersion` | `string \| null` | Default selected `versionSlug` |
| | `defaultForm` | `PokemonForm` | Always eagerly loaded |
| | `varieties` | `PokemonVarietyRef[]` | All supported forms (Default + Alolan/Galarian/Hisuian/Paldean/Mega/Gigantamax) |
| | `evolutionChainId` | `number \| null` | Extracted from `species.evolution_chain.url` |

### 1.4 Type Effectiveness & Evolution Entities

| Entity | Field | Type / Constraint | Notes |
| --- | --- | --- | --- |
| **TypeEffectivenessProfile** | `defendingTypes` | `PokemonTypeName[]` | 1 or 2 defending types |
| | `quadWeaknesses` | `PokemonTypeName[]` | `4x` attacking types |
| | `weaknesses` | `PokemonTypeName[]` | `2x` attacking types |
| | `neutral` | `PokemonTypeName[]` | `1x` attacking types |
| | `resistances` | `PokemonTypeName[]` | `0.5x` attacking types |
| | `quadResistances` | `PokemonTypeName[]` | `0.25x` attacking types |
| | `immunities` | `PokemonTypeName[]` | `0x` attacking types |
| **EvolutionNode** | `speciesId` | `number` | Target base National Dex ID |
| | `dexNumber` | `string` | `#0001`-formatted ID |
| | `slug` | `string` | Target species slug for navigation |
| | `name` | `string` | Display name |
| | `spriteUrl` | `string \| null` | Derived deterministic artwork/sprite URL from `speciesId` |
| | `triggerLabel` | `string \| null` | Human-readable trigger (`Lv. 16`, `Thunder Stone`, `Trade`, `Friendship`) |
| | `evolvesTo` | `EvolutionNode[]` | Recursive children (supports 0, 1, or N branches such as Eevee/Wurmple) |
| **EvolutionChain** | `id` | `number` | Chain ID |
| | `root` | `EvolutionNode` | Root species node |
| | `hasBranching` | `boolean` | `true` if any node has `evolvesTo.length > 1` |

### 1.5 Collection & Filter State Entities

| Entity | Field | Type / Constraint | Notes |
| --- | --- | --- | --- |
| **CollectionRecord** | `version` | `1` | Schema version for safe future migrations |
| | `caughtIds` | `number[]` | Unique sorted valid National Dex IDs (`1..1025`) |
| | `favoriteIds` | `number[]` | Unique sorted valid National Dex IDs (`1..1025`) |
| **CatalogFilterState** | `searchQuery` | `string` | Raw user search text (trimmed/normalized when matching) |
| | `selectedTypes` | `PokemonTypeName[]` | `0..2` selected types (1 = primary or secondary; 2 = both) |
| | `selectedGeneration` | `GenerationId \| null` | `null` means All Generations |
| | `collectionStatus` | `CollectionStatusFilter` | `'all' \| 'caught' \| 'favorites'` |

---

## 2. Validation & Normalization Rules

1. **National Dex Formatting**: `formatDexNumber(id)` formats positive integers as `#` + minimum 4 zero-padded digits (`1 -> #0001`, `25 -> #0025`, `1025 -> #1025`).
2. **Search Query Parsing (`FR-003`, `FR-013`)**:
   - Trim whitespace and lowercase.
   - Strip leading `#` and leading zeros if query matches `/^#?0*(\d+)$/` (`#0025`, `0025`, `25` -> exact `id === 25`; `#0000` or `> 1025` -> empty match, never error).
   - Otherwise perform case-insensitive substring match against normalized `name` or `slug` (ignoring punctuation differences like `mr mime` vs `mr-mime`).
   - Empty/whitespace-only query matches all catalog entries (subject to active filters).
3. **Deep-Link / Route Parameter Validation (`FR-013`)**:
   - Accept numeric ID (`1..1025`) or sanitized lowercase slug (`^[a-z0-9-]+$`).
   - Reject negative numbers, `0`, floats, IDs `> 1025`, or unknown slugs cleanly with a recoverable `NOT_FOUND` screen state.
4. **Form Variant Filtering (`FR-001`, `FR-017`, Q1)**:
   - Include `is_default: true` plus regional (`-alola`, `-galar`, `-hisui`, `-paldea`), Mega (`-mega`, `-mega-x`, `-mega-y`), and Gigantamax (`-gmax`) varieties. Exclude cosmetic/totem duplicates unless explicitly matched by those form categories; if no alternate forms exist, `varieties.length <= 1` and the form selector is omitted.
5. **Collection Normalization (`FR-011`, `FR-012`, Q4)**:
   - Deduplicate `caughtIds` and `favoriteIds` with `Set`, constrain to integers in `1..1025`, and always key by base species ID so toggling Caught/Favorite on Alolan Raichu updates `#0026 Raichu`.
   - `Caught X / Y`: `X = caughtIds.length`, `Y = 1025` (or active Gen I–IX catalog count).

---

## 3. State Transitions

### 3.1 Filter Bottom Sheet Lifecycle (`Q2`)
```text
[Closed (appliedFilters)]
   │ tap "Filters" button
   ▼
[Open (draftFilters = clone(appliedFilters))]
   ├── tap Type chip ──► toggle in draftTypes (max 2; FIFO or replace promptless cap at 2)
   ├── tap Gen chip  ──► toggle draftGeneration
   ├── tap "Reset"   ──► draftTypes = [], draftGeneration = null (immediate preview count updates)
   ├── dismiss/backdrop ──► discard draftFilters ──► [Closed (appliedFilters unchanged)]
   └── tap "Apply"   ──► commit draftFilters to appliedFilters ──► [Closed (catalog re-filters from index)]
```

### 3.2 Detail View Form & Shiny State (`Q1`, `Q3`)
```text
PokemonEntry Loaded (defaultForm active, isShiny = false, selectedFlavorVersion = defaultFlavorVersion)
   ├── Toggle Shiny ──► flips isShiny; falls back with clear notice if shinyArtworkUrl is null
   ├── Select Form Pill (e.g., "Alolan") ──► fetches/reads cached /pokemon/{varietySlug}
   │      └── Updates artwork, types, TypeEffectivenessProfile, base stats, abilities, height/weight
   └── Select Flavor Version ──► switches displayed text from entry.flavorTexts[]
```

### 3.3 Catalog Offline & Pull-to-Refresh Transitions (`Q4`, `Q5`)
- **Initial Load Fail (No Cache)**: Show full-screen Error/Offline state with 1-tap `Retry`.
- **Infinite Scroll Next-Batch Fail**: Keep loaded cards intact; render inline footer `Retry` button (`fetchNextPage`).
- **Pull-to-Refresh Fail Offline**: Preserve `searchQuery`, `selectedTypes`, `selectedGeneration`, `collectionStatus`, and cached cards; display a non-destructive inline offline/error notice banner with `Dismiss` / `Retry`.
