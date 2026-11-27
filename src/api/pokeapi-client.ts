import type {
  EvolutionChain,
  PokemonCatalogIndexItem,
  PokemonEntry,
  PokemonForm,
  PokemonSummary,
  PokemonTypeName,
} from '@/src/domain/types';
import {
  mapRawEvolutionChain,
  mapRawPokemonToForm,
  mapRawPokemonToSummary,
  mapRawSpeciesToEntry,
  mapSpeciesListToCatalogIndex,
} from './mappers';

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

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
    this.name = 'PokedexApiError';
  }
}

export function getApiErrorMessage(error: unknown, offlineFallback: string): string {
  if (error instanceof PokedexApiError) {
    if (
      error.code === 'RATE_LIMITED' ||
      error.code === 'SERVER_ERROR' ||
      error.code === 'INVALID_RESPONSE'
    ) {
      return error.message;
    }
  }
  return offlineFallback;
}

export interface PokedexApiClient {
  fetchCatalogIndex(signal?: AbortSignal): Promise<PokemonCatalogIndexItem[]>;
  fetchTypePokemonIds(type: PokemonTypeName, signal?: AbortSignal): Promise<number[]>;
  fetchPokemonSummary(id: number, signal?: AbortSignal): Promise<PokemonSummary>;
  fetchPokemonEntry(idOrName: string, signal?: AbortSignal): Promise<PokemonEntry>;
  fetchPokemonForm(
    varietySlug: string,
    label: string,
    isDefault: boolean,
    signal?: AbortSignal
  ): Promise<PokemonForm>;
  fetchEvolutionChain(chainId: number, signal?: AbortSignal): Promise<EvolutionChain>;
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new PokedexApiError('OFFLINE', 'Request was aborted or timed out.');
    }
    throw new PokedexApiError('OFFLINE', 'Unable to reach PokéAPI. Check your connection.');
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new PokedexApiError('NOT_FOUND', 'Pokémon entry was not found.', 404);
    }
    if (response.status === 429) {
      throw new PokedexApiError('RATE_LIMITED', 'Too many requests to PokéAPI. Please retry shortly.', 429);
    }
    if (response.status >= 500) {
      throw new PokedexApiError('SERVER_ERROR', 'PokéAPI is temporarily unavailable.', response.status);
    }
    throw new PokedexApiError('SERVER_ERROR', `Unexpected response (${response.status}).`, response.status);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new PokedexApiError('INVALID_RESPONSE', 'Received malformed data from PokéAPI.');
  }
}

export function createPokeApiClient(baseUrl = POKEAPI_BASE_URL): PokedexApiClient {
  return {
    async fetchCatalogIndex(signal) {
      const raw = await fetchJson<{ results?: Array<{ name: string; url: string }> }>(
        `${baseUrl}/pokemon-species?limit=1025&offset=0`,
        signal
      );
      if (!raw || !Array.isArray(raw.results)) {
        throw new PokedexApiError('INVALID_RESPONSE', 'Catalog species list payload is invalid.');
      }
      return mapSpeciesListToCatalogIndex(raw.results);
    },

    async fetchTypePokemonIds(type, signal) {
      const raw = await fetchJson<{ pokemon?: Array<{ pokemon?: { url?: string } }> }>(
        `${baseUrl}/type/${type}`,
        signal
      );
      if (!raw || !Array.isArray(raw.pokemon)) {
        throw new PokedexApiError('INVALID_RESPONSE', `Type payload for ${type} is invalid.`);
      }
      const ids = new Set<number>();
      for (const entry of raw.pokemon) {
        const match = entry?.pokemon?.url?.match(/\/pokemon\/(\d+)\/?$/);
        if (match && match[1]) {
          const id = Number.parseInt(match[1], 10);
          if (id >= 1 && id <= 1025) {
            ids.add(id);
          }
        }
      }
      return Array.from(ids).sort((a, b) => a - b);
    },

    async fetchPokemonSummary(id, signal) {
      const raw = await fetchJson<any>(`${baseUrl}/pokemon/${id}`, signal);
      return mapRawPokemonToSummary(raw);
    },

    async fetchPokemonEntry(idOrName, signal) {
      const normalized = idOrName.trim().toLowerCase();
      const rawSpecies = await fetchJson<any>(`${baseUrl}/pokemon-species/${normalized}`, signal);
      const defaultVariety =
        Array.isArray(rawSpecies?.varieties) &&
        (rawSpecies.varieties.find((v: any) => v?.is_default) ?? rawSpecies.varieties[0]);
      const defaultTarget = defaultVariety?.pokemon?.name ?? normalized;
      const rawPokemon = await fetchJson<any>(`${baseUrl}/pokemon/${defaultTarget}`, signal);
      return mapRawSpeciesToEntry(rawSpecies, rawPokemon);
    },

    async fetchPokemonForm(varietySlug, label, isDefault, signal) {
      const rawPokemon = await fetchJson<any>(`${baseUrl}/pokemon/${varietySlug}`, signal);
      return mapRawPokemonToForm(rawPokemon, label, isDefault);
    },

    async fetchEvolutionChain(chainId, signal) {
      const rawChain = await fetchJson<any>(`${baseUrl}/evolution-chain/${chainId}`, signal);
      return mapRawEvolutionChain(rawChain);
    },
  };
}
