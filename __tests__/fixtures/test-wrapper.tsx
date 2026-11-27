import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  mapRawEvolutionChain,
  mapRawPokemonToForm,
  mapRawPokemonToSummary,
  mapRawSpeciesToEntry,
  mapSpeciesListToCatalogIndex,
} from '@/src/api/mappers';
import { PokedexApiError, type PokedexApiClient } from '@/src/api/pokeapi-client';
import { CollectionProvider } from '@/src/hooks/use-collection';
import { PokedexApiProvider } from '@/src/hooks/use-pokedex-queries';
import {
  InMemoryCollectionStorageAdapter,
  type CollectionStorageAdapter,
} from '@/src/storage/collection-storage';
import {
  MOCK_RAW_EVOLUTION_CHAINS,
  MOCK_RAW_POKEMON,
  MOCK_RAW_SPECIES,
  MOCK_SPECIES_INDEX_RESULTS,
  MOCK_TYPE_POKEMON,
} from './pokeapi-fixtures';

export function createMockPokeApiClient(
  overrides: Partial<PokedexApiClient> = {}
): PokedexApiClient {
  const baseClient: PokedexApiClient = {
    async fetchCatalogIndex() {
      return mapSpeciesListToCatalogIndex(MOCK_SPECIES_INDEX_RESULTS);
    },
    async fetchTypePokemonIds(type) {
      return MOCK_TYPE_POKEMON[type] ?? [];
    },
    async fetchPokemonSummary(id) {
      const raw = MOCK_RAW_POKEMON[String(id)];
      if (!raw) throw new PokedexApiError('NOT_FOUND', `Missing pokemon ${id}`, 404);
      return mapRawPokemonToSummary(raw);
    },
    async fetchPokemonEntry(idOrName) {
      const key = idOrName.trim().toLowerCase();
      const rawSpecies = MOCK_RAW_SPECIES[key];
      if (!rawSpecies) {
        throw new PokedexApiError('NOT_FOUND', `Missing species ${key}`, 404);
      }
      const defaultVariety = rawSpecies.varieties?.find((v: any) => v.is_default);
      const rawPokemon =
        MOCK_RAW_POKEMON[defaultVariety?.pokemon?.name ?? key] ??
        MOCK_RAW_POKEMON[String(rawSpecies.id)];
      return mapRawSpeciesToEntry(rawSpecies, rawPokemon);
    },
    async fetchPokemonForm(varietySlug, label, isDefault) {
      const raw = MOCK_RAW_POKEMON[varietySlug];
      if (!raw) throw new PokedexApiError('NOT_FOUND', `Missing form ${varietySlug}`, 404);
      return mapRawPokemonToForm(raw, label, isDefault);
    },
    async fetchEvolutionChain(chainId) {
      const raw = MOCK_RAW_EVOLUTION_CHAINS[chainId];
      if (!raw) throw new PokedexApiError('NOT_FOUND', `Missing chain ${chainId}`, 404);
      return mapRawEvolutionChain(raw);
    },
  };

  return { ...baseClient, ...overrides };
}

const activeQueryClients: QueryClient[] = [];

afterEach(() => {
  while (activeQueryClients.length > 0) {
    activeQueryClients.pop()?.clear();
  }
});

export function createTestWrapper({
  apiClient = createMockPokeApiClient(),
  storageAdapter = new InMemoryCollectionStorageAdapter(),
}: {
  apiClient?: PokedexApiClient;
  storageAdapter?: CollectionStorageAdapter;
} = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
  activeQueryClients.push(queryClient);

  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <PokedexApiProvider client={apiClient}>
          <CollectionProvider adapter={storageAdapter}>{children}</CollectionProvider>
        </PokedexApiProvider>
      </QueryClientProvider>
    );
  };
}
