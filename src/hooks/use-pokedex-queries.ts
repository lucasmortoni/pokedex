import React from 'react';
import {
  useInfiniteQuery,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createPokeApiClient,
  PokedexApiError,
  type PokedexApiClient,
} from '@/src/api/pokeapi-client';
import type {
  PokemonForm,
  PokemonSummary,
  PokemonTypeName,
  PokemonVarietyRef,
} from '@/src/domain/types';

export const CATALOG_PAGE_SIZE = 24;
export const TWENTY_FOUR_HOURS_MS = 1000 * 60 * 60 * 24;
export const SEVEN_DAYS_MS = 1000 * 60 * 60 * 24 * 7;

const PokedexApiContext = React.createContext<PokedexApiClient>(createPokeApiClient());

export function PokedexApiProvider({
  client,
  children,
}: {
  client?: PokedexApiClient;
  children: React.ReactNode;
}) {
  const value = React.useMemo(() => client ?? createPokeApiClient(), [client]);
  return React.createElement(PokedexApiContext.Provider, { value }, children);
}

export function usePokedexApiClient(): PokedexApiClient {
  return React.useContext(PokedexApiContext);
}

export function useCatalogIndex() {
  const client = usePokedexApiClient();
  return useQuery({
    queryKey: ['catalog-index'],
    queryFn: ({ signal }) => client.fetchCatalogIndex(signal),
    staleTime: TWENTY_FOUR_HOURS_MS,
    gcTime: SEVEN_DAYS_MS,
  });
}

export function useTypeFilterIds(selectedTypes: PokemonTypeName[]) {
  const client = usePokedexApiClient();
  const queries = useQueries({
    queries: selectedTypes.map((type) => ({
      queryKey: ['type-ids', type],
      queryFn: ({ signal }: { signal?: AbortSignal }) => client.fetchTypePokemonIds(type, signal),
      staleTime: TWENTY_FOUR_HOURS_MS,
      gcTime: SEVEN_DAYS_MS,
    })),
  });

  const typeIdSets = React.useMemo(() => {
    const sets: ReadonlySet<number>[] = [];
    for (const q of queries) {
      if (q.data) {
        sets.push(new Set(q.data));
      }
    }
    return sets;
  }, [queries]);

  const isLoading = queries.some((q) => q.isLoading);
  const error = queries.find((q) => q.error)?.error ?? null;
  const isReady = selectedTypes.length === 0 || (typeIdSets.length === selectedTypes.length && !error);

  return {
    typeIdSets,
    isLoading,
    error,
    isReady,
    refetchAll: () => Promise.all(queries.map((q) => q.refetch())),
  };
}

export function useCatalogSummaries(filteredIds: number[], enabled: boolean) {
  const client = usePokedexApiClient();
  const queryClient = useQueryClient();

  return useInfiniteQuery<PokemonSummary[], Error>({
    queryKey: ['catalog-summaries', filteredIds],
    enabled: enabled && filteredIds.length > 0,
    initialPageParam: 0,
    staleTime: TWENTY_FOUR_HOURS_MS,
    gcTime: SEVEN_DAYS_MS,
    queryFn: async ({ pageParam, signal }) => {
      const offset = typeof pageParam === 'number' ? pageParam : 0;
      const slice = filteredIds.slice(offset, offset + CATALOG_PAGE_SIZE);
      if (slice.length === 0) return [];
      return Promise.all(
        slice.map((id) =>
          queryClient.fetchQuery({
            queryKey: ['pokemon-summary', id],
            queryFn: () => client.fetchPokemonSummary(id, signal),
            staleTime: TWENTY_FOUR_HOURS_MS,
            gcTime: SEVEN_DAYS_MS,
          })
        )
      );
    },
    getNextPageParam: (_lastPage, allPages) => {
      const loadedCount = allPages.reduce((sum, page) => sum + page.length, 0);
      return loadedCount < filteredIds.length ? loadedCount : undefined;
    },
  });
}

export function usePokemonEntry(lookupKey: string, enabled: boolean) {
  const client = usePokedexApiClient();
  return useQuery({
    queryKey: ['pokemon-entry', lookupKey],
    enabled: enabled && Boolean(lookupKey),
    staleTime: TWENTY_FOUR_HOURS_MS,
    gcTime: SEVEN_DAYS_MS,
    retry: (failureCount, err) => {
      if (err instanceof PokedexApiError && err.code === 'NOT_FOUND') {
        return false;
      }
      return failureCount < 1;
    },
    queryFn: ({ signal }) => client.fetchPokemonEntry(lookupKey, signal),
  });
}

export function usePokemonForm(
  selectedVariety: PokemonVarietyRef | null,
  defaultForm: PokemonForm | undefined
) {
  const client = usePokedexApiClient();
  const isDefault = !selectedVariety || selectedVariety.isDefault;

  const query = useQuery({
    queryKey: ['pokemon-form', selectedVariety?.slug ?? ''],
    enabled: !isDefault && Boolean(selectedVariety?.slug),
    staleTime: TWENTY_FOUR_HOURS_MS,
    gcTime: SEVEN_DAYS_MS,
    queryFn: ({ signal }) =>
      client.fetchPokemonForm(
        selectedVariety!.slug,
        selectedVariety!.label,
        selectedVariety!.isDefault,
        signal
      ),
  });

  if (isDefault) {
    return {
      data: defaultForm,
      isLoading: false,
      error: null,
      refetch: async () => undefined,
    };
  }

  return query;
}

export function useEvolutionChain(chainId: number | null | undefined) {
  const client = usePokedexApiClient();
  return useQuery({
    queryKey: ['evolution-chain', chainId ?? 0],
    enabled: typeof chainId === 'number' && chainId > 0,
    staleTime: TWENTY_FOUR_HOURS_MS,
    gcTime: SEVEN_DAYS_MS,
    queryFn: ({ signal }) => client.fetchEvolutionChain(chainId!, signal),
  });
}
