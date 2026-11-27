import React from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, SlidersHorizontal, X } from 'lucide-react-native';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Input, InputField, InputSlot } from '@/components/ui/input';
import { Progress, ProgressFilledTrack } from '@/components/ui/progress';
import { FilterBottomSheet } from '@/src/components/FilterBottomSheet';
import { PokemonCard } from '@/src/components/PokemonCard';
import {
  CatalogSkeletonGrid,
  EmptyCatalogState,
  ErrorRetryState,
  InfiniteScrollFooter,
  OfflineBanner,
} from '@/src/components/StateFeedback';
import { getApiErrorMessage } from '@/src/api/pokeapi-client';
import { filterCatalogIndex } from '@/src/domain/search';
import type {
  CollectionStatusFilter,
  GenerationId,
  PokemonSummary,
  PokemonTypeName,
} from '@/src/domain/types';
import { useCollection } from '@/src/hooks/use-collection';
import {
  useCatalogIndex,
  useCatalogSummaries,
  useTypeFilterIds,
} from '@/src/hooks/use-pokedex-queries';
import { getTypeToken } from '@/src/theme/pokemon-types';

const STATUS_PILLS: Array<{ value: CollectionStatusFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'caught', label: 'Caught' },
  { value: 'favorites', label: 'Favorites' },
];

export default function CatalogScreen() {
  const router = useRouter();
  const {
    caughtSet,
    favoriteSet,
    caughtCount,
    totalCount,
    storageError,
    isCaught,
    isFavorite,
    toggleCaught,
    toggleFavorite,
  } = useCollection();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedTypes, setSelectedTypes] = React.useState<PokemonTypeName[]>([]);
  const [selectedGeneration, setSelectedGeneration] = React.useState<GenerationId | null>(null);
  const [collectionStatus, setCollectionStatus] = React.useState<CollectionStatusFilter>('all');
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [refreshError, setRefreshError] = React.useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [dismissedStorageError, setDismissedStorageError] = React.useState(false);

  React.useEffect(() => {
    setDismissedStorageError(false);
  }, [storageError]);

  const catalogQuery = useCatalogIndex();
  const typeQuery = useTypeFilterIds(selectedTypes);

  const filteredIds = React.useMemo(() => {
    const index = catalogQuery.data ?? [];
    if (!typeQuery.isReady) return [];
    return filterCatalogIndex({
      index,
      filters: {
        searchQuery,
        selectedTypes,
        selectedGeneration,
        collectionStatus,
      },
      caughtSet,
      favoriteSet,
      typeIdSets: typeQuery.typeIdSets,
    }).map((item) => item.id);
  }, [
    catalogQuery.data,
    typeQuery.isReady,
    typeQuery.typeIdSets,
    searchQuery,
    selectedTypes,
    selectedGeneration,
    collectionStatus,
    caughtSet,
    favoriteSet,
  ]);

  const summariesQuery = useCatalogSummaries(
    filteredIds,
    Boolean(catalogQuery.data) && typeQuery.isReady
  );

  const loadedPokemon = React.useMemo(
    () => summariesQuery.data?.pages.flat() ?? [],
    [summariesQuery.data]
  );

  const activeSheetFilterCount = selectedTypes.length + (selectedGeneration !== null ? 1 : 0);
  const hasAnyActiveFilter =
    Boolean(searchQuery.trim()) ||
    activeSheetFilterCount > 0 ||
    collectionStatus !== 'all';

  const handleClearAllFilters = React.useCallback(() => {
    setSearchQuery('');
    setSelectedTypes([]);
    setSelectedGeneration(null);
    setCollectionStatus('all');
  }, []);

  const handleRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    setRefreshError(null);
    try {
      const idxResult = await catalogQuery.refetch();
      if (idxResult.error) {
        setRefreshError(
          getApiErrorMessage(
            idxResult.error,
            'Offline or unable to refresh. Showing saved Pokédex data.'
          )
        );
        return;
      }
      if (selectedTypes.length > 0) {
        const typeResults = await typeQuery.refetchAll();
        const firstTypeError = typeResults.find((r) => r.error)?.error;
        if (firstTypeError) {
          setRefreshError(
            getApiErrorMessage(
              firstTypeError,
              'Offline or unable to refresh filter data. Showing saved entries.'
            )
          );
          return;
        }
      }
      if (filteredIds.length > 0) {
        const sumResult = await summariesQuery.refetch();
        if (sumResult.error) {
          setRefreshError(
            getApiErrorMessage(
              sumResult.error,
              'Unable to refresh right now. Showing saved Pokémon.'
            )
          );
        }
      }
    } catch (err) {
      setRefreshError(
        getApiErrorMessage(err, 'Unable to refresh right now. Showing saved Pokémon.')
      );
    } finally {
      setIsRefreshing(false);
    }
  }, [catalogQuery, typeQuery, summariesQuery, selectedTypes.length, filteredIds.length]);

  const handlePressPokemon = React.useCallback(
    (pokemon: PokemonSummary) => {
      router.push(`/pokemon/${pokemon.slug}`);
    },
    [router]
  );

  const renderItem = React.useCallback(
    ({ item }: { item: PokemonSummary }) => (
      <PokemonCard
        pokemon={item}
        isCaught={isCaught(item.id)}
        isFavorite={isFavorite(item.id)}
        onPress={handlePressPokemon}
        onToggleCaught={toggleCaught}
        onToggleFavorite={toggleFavorite}
      />
    ),
    [isCaught, isFavorite, handlePressPokemon, toggleCaught, toggleFavorite]
  );

  const keyExtractor = React.useCallback((item: PokemonSummary) => String(item.id), []);

  const showColdStartError =
    (catalogQuery.isError && !catalogQuery.data) ||
    (summariesQuery.isError && loadedPokemon.length === 0 && filteredIds.length > 0);

  const showTypeOfflineError = Boolean(typeQuery.error) && !typeQuery.isReady;

  const isInitialLoading =
    (catalogQuery.isLoading && !catalogQuery.data) ||
    typeQuery.isLoading ||
    (filteredIds.length > 0 && summariesQuery.isLoading && loadedPokemon.length === 0);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-slate-50">
      {/* Header: Title + Caught X / Y Counter */}
      <View className="px-4 pb-2 pt-3">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-2xl font-extrabold tracking-tight text-slate-900">
            Pokédex
          </Text>
          <View
            testID="caught-progress-badge"
            accessibilityLabel={`Caught ${caughtCount} of ${totalCount} Pokémon`}
            className="rounded-full bg-slate-900 px-3 py-1"
          >
            <Text className="text-xs font-bold text-white">
              Caught {caughtCount} / {totalCount}
            </Text>
          </View>
        </View>

        <Progress value={caughtCount} max={totalCount} className="mb-3 h-2">
          <ProgressFilledTrack className="bg-red-600" />
        </Progress>

        {/* Persistent Search Bar + Filters Trigger */}
        <View className="mb-3 flex-row items-center gap-2">
          <Input className="flex-1">
            <View className="mr-2">
              <Search size={18} color="#64748B" />
            </View>
            <InputField
              testID="catalog-search-input"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search name or #0025"
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Search Pokémon by name or National Dex number"
            />
            {searchQuery.length > 0 ? (
              <InputSlot
                testID="clear-search-button"
                accessibilityRole="button"
                accessibilityLabel="Clear search text"
                onPress={() => setSearchQuery('')}
              >
                <X size={18} color="#475569" />
              </InputSlot>
            ) : null}
          </Input>

          <Pressable
            testID="open-filters-button"
            accessibilityRole="button"
            accessibilityLabel={
              activeSheetFilterCount > 0
                ? `Open filters, ${activeSheetFilterCount} active`
                : 'Open filters'
            }
            onPress={() => setIsFilterOpen(true)}
            className={`min-h-[48px] min-w-[48px] flex-row items-center justify-center rounded-2xl border px-3.5 ${
              activeSheetFilterCount > 0
                ? 'border-red-600 bg-red-50'
                : 'border-slate-200 bg-white'
            }`}
          >
            <SlidersHorizontal
              size={18}
              color={activeSheetFilterCount > 0 ? '#DC2626' : '#334155'}
            />
            {activeSheetFilterCount > 0 ? (
              <Badge className="ml-1.5 bg-red-600 px-2 py-0.5">
                <BadgeText className="text-[11px]">{activeSheetFilterCount}</BadgeText>
              </Badge>
            ) : null}
          </Pressable>
        </View>

        {/* Inline Collection-Status Pills */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row gap-2">
            {STATUS_PILLS.map((pill) => {
              const selected = collectionStatus === pill.value;
              return (
                <Pressable
                  key={pill.value}
                  testID={`status-pill-${pill.value}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Show ${pill.label} Pokémon`}
                  accessibilityState={{ selected }}
                  onPress={() => setCollectionStatus(pill.value)}
                  className={`min-h-[44px] items-center justify-center rounded-full border px-4 ${
                    selected
                      ? 'border-slate-900 bg-slate-900'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      selected ? 'text-white' : 'text-slate-700'
                    }`}
                  >
                    {pill.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {hasAnyActiveFilter ? (
            <Pressable
              testID="quick-clear-filters"
              accessibilityRole="button"
              accessibilityLabel="Clear all active filters"
              onPress={handleClearAllFilters}
              className="min-h-[44px] items-center justify-center px-2"
            >
              <Text className="text-xs font-bold text-red-600">Clear All</Text>
            </Pressable>
          ) : null}
        </View>

        {/* Active Sheet Filter Badges */}
        {activeSheetFilterCount > 0 ? (
          <View className="mt-2 flex-row flex-wrap gap-1.5">
            {selectedTypes.map((type) => {
              const token = getTypeToken(type);
              return (
                <Badge
                  key={type}
                  style={{ backgroundColor: token.background }}
                  className="px-2.5 py-1"
                >
                  <BadgeText style={{ color: token.foreground }}>{token.label}</BadgeText>
                </Badge>
              );
            })}
            {selectedGeneration !== null ? (
              <Badge variant="outline">
                <BadgeText variant="outline">Gen {selectedGeneration}</BadgeText>
              </Badge>
            ) : null}
          </View>
        ) : null}
      </View>

      {storageError && !dismissedStorageError ? (
        <OfflineBanner
          testID="storage-error-banner"
          message={storageError}
          onDismiss={() => setDismissedStorageError(true)}
        />
      ) : null}

      {refreshError ? (
        <OfflineBanner
          message={refreshError}
          onRetry={handleRefresh}
          onDismiss={() => setRefreshError(null)}
        />
      ) : null}

      {showColdStartError ? (
        <ErrorRetryState
          title="Unable to Load Pokédex"
          message={getApiErrorMessage(
            catalogQuery.error ?? summariesQuery.error,
            'Check your internet connection and tap retry to load the catalog.'
          )}
          onRetry={() => {
            catalogQuery.refetch();
            summariesQuery.refetch();
          }}
        />
      ) : showTypeOfflineError ? (
        <ErrorRetryState
          title="Filter Data Unavailable Offline"
          message={getApiErrorMessage(
            typeQuery.error,
            "This elemental type filter hasn't been cached on your device yet. Connect and retry, or reset filters."
          )}
          onRetry={() => typeQuery.refetchAll()}
        />
      ) : isInitialLoading ? (
        <CatalogSkeletonGrid />
      ) : filteredIds.length === 0 ? (
        <EmptyCatalogState
          title={
            collectionStatus !== 'all' && !searchQuery && activeSheetFilterCount === 0
              ? `No ${collectionStatus === 'caught' ? 'Caught' : 'Favorite'} Pokémon Yet`
              : 'No Pokémon Found'
          }
          message={
            collectionStatus === 'caught' && caughtCount === 0
              ? 'Mark Pokémon as Caught on any card or detail screen to track your Pokédex here.'
              : collectionStatus === 'favorites' && favoriteSet.size === 0
              ? 'Tap the heart icon on any Pokémon to build your Favorites list.'
              : 'No Pokémon match your active search or filter criteria.'
          }
          onReset={handleClearAllFilters}
        />
      ) : (
        <FlatList
          testID="catalog-flatlist"
          data={loadedPokemon}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
          initialNumToRender={process.env.JEST_WORKER_ID ? 30 : 12}
          maxToRenderPerBatch={12}
          windowSize={7}
          removeClippedSubviews
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (
              summariesQuery.hasNextPage &&
              !summariesQuery.isFetchingNextPage &&
              !summariesQuery.isFetchNextPageError
            ) {
              summariesQuery.fetchNextPage();
            }
          }}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          ListFooterComponent={
            <InfiniteScrollFooter
              isLoading={summariesQuery.isFetchingNextPage}
              errorMessage={
                summariesQuery.isFetchNextPageError
                  ? 'Failed to load next Pokémon batch. Your loaded list is still available.'
                  : null
              }
              onRetry={() => summariesQuery.fetchNextPage()}
            />
          }
        />
      )}

      <FilterBottomSheet
        isOpen={isFilterOpen}
        appliedTypes={selectedTypes}
        appliedGeneration={selectedGeneration}
        onClose={() => setIsFilterOpen(false)}
        onApply={({ selectedTypes: nextTypes, selectedGeneration: nextGen }) => {
          setSelectedTypes(nextTypes);
          setSelectedGeneration(nextGen);
        }}
      />
    </SafeAreaView>
  );
}
