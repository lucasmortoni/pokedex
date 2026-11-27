# Contract: PokéAPI v2 Client & Domain Mappers

**Scope**: `src/api/pokeapi-client.ts`, `src/api/mappers.ts`, `src/hooks/use-pokedex-queries.ts`

## 1. Endpoints Consumed

Base URL: `https://pokeapi.co/api/v2`

| Method | Endpoint | Purpose | Caching Policy |
| --- | --- | --- | --- |
| `GET` | `/pokemon-species?limit=1025&offset=0` | Full Gen I–IX National Dex catalog index (`id`, `name`, derived `generation`) | `staleTime: 24h`, `gcTime: 7d` (persisted) |
| `GET` | `/type/{typeName}` | Member Pokémon IDs for 1 elemental type (`1..18`) for full-catalog type filtering | `staleTime: 24h`, `gcTime: 7d` (persisted) |
| `GET` | `/pokemon/{idOrSlug}` | Card summary & form attributes (`types`, `stats`, `abilities`, `height`, `weight`, `sprites`) | `staleTime: 24h`, `gcTime: 7d` (persisted) |
| `GET` | `/pokemon-species/{idOrSlug}` | Species metadata (`genera`, `flavor_text_entries`, `varieties`, `evolution_chain` URL) | `staleTime: 24h`, `gcTime: 7d` (persisted) |
| `GET` | `/evolution-chain/{chainId}` | Recursive `chain` tree with `evolution_details[]` triggers | `staleTime: 24h`, `gcTime: 7d` (persisted) |

## 2. Client Interface & Error Contract

```ts
export type PokedexApiErrorCode =
  | 'OFFLINE'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'INVALID_RESPONSE';

export class PokedexApiError extends Error {
  constructor(
    public readonly code: PokedexApiErrorCode,
    message: string,
    public readonly status?: number
  ) {
    super(message);
  }
}

export interface PokedexApiClient {
  fetchCatalogIndex(signal?: AbortSignal): Promise<PokemonCatalogIndexItem[]>;
  fetchTypePokemonIds(type: PokemonTypeName, signal?: AbortSignal): Promise<number[]>;
  fetchPokemonSummary(id: number, signal?: AbortSignal): Promise<PokemonSummary>;
  fetchPokemonEntry(idOrName: string, signal?: AbortSignal): Promise<PokemonEntry>;
  fetchPokemonForm(varietySlug: string, label: string, isDefault: boolean, signal?: AbortSignal): Promise<PokemonForm>;
  fetchEvolutionChain(chainId: number, signal?: AbortSignal): Promise<EvolutionChain>;
}
```

### Error Mapping Rules
- Network failure / timeout (`TypeError`, `AbortError` timeout, or device offline): throw `PokedexApiError('OFFLINE', ...)`.
- HTTP `404`: throw `PokedexApiError('NOT_FOUND', ..., 404)` (never auto-retried by TanStack Query).
- HTTP `429`: throw `PokedexApiError('RATE_LIMITED', ..., 429)` (respect bounded backoff or surface retry state).
- HTTP `5xx`: throw `PokedexApiError('SERVER_ERROR', ..., status)`.
- Malformed/unexpected JSON payload: throw `PokedexApiError('INVALID_RESPONSE', ...)`.

## 3. Mapper Guarantees (`src/api/mappers.ts`)

1. `mapSpeciesListToCatalogIndex(raw)`: extracts `id` from `url` (`.../pokemon-species/{id}/`), filters `1 <= id <= 1025`, sorts ascending by `id`, formats `#0001`, and assigns `generation` (`1..9`).
2. `mapRawPokemonToForm(raw, label, isDefault)`: extracts 1–2 valid `PokemonTypeName`s, converts `height` (`decimeters -> meters`) and `weight` (`hectograms -> kg`), sums 6 stats into `stats.total`, preserves `isHidden` flag on abilities, and selects official artwork (`other['official-artwork'].front_default` / `front_shiny`) with sprite fallback.
3. `mapRawSpeciesToFlavorTexts(rawEntries)`: filters `language.name === 'en'`, strips `\f`, `\n`, `\r`, and `\u00ad`, normalizes whitespace, and sorts newest game version first.
4. `mapRawVarieties(rawVarieties)`: keeps default variety plus `-alola`, `-galar`, `-hisui`, `-paldea`, `-mega*`, and `-gmax` variants with readable labels.
5. `mapRawEvolutionChain(raw)`: recursively maps `chain` into `EvolutionNode` tree, formatting triggers (`min_level` -> `Lv. N`, `item` -> title-cased stone/item, `trigger.name === 'trade'` -> `Trade`, `min_happiness` -> `Friendship`, `time_of_day` -> `Day`/`Night` suffix).
