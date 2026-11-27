import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ArrowLeft, CheckCircle2, Circle, Heart, Sparkles } from 'lucide-react-native';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Button, ButtonText } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EvolutionChainSection } from '@/src/components/EvolutionChainSection';
import { StatBarRow } from '@/src/components/StatBarRow';
import {
  ErrorRetryState,
  OfflineBanner,
  PokemonNotFoundState,
} from '@/src/components/StateFeedback';
import { TypeBadge } from '@/src/components/TypeBadge';
import { TypeEffectivenessSection } from '@/src/components/TypeEffectivenessSection';
import { getApiErrorMessage, PokedexApiError } from '@/src/api/pokeapi-client';
import { parsePokemonRouteParam } from '@/src/domain/navigation';
import { calculateTypeEffectiveness } from '@/src/domain/type-effectiveness';
import type { EvolutionNode, PokemonVarietyRef } from '@/src/domain/types';
import { useCollection } from '@/src/hooks/use-collection';
import {
  useEvolutionChain,
  usePokemonEntry,
  usePokemonForm,
} from '@/src/hooks/use-pokedex-queries';
import { getTypeToken } from '@/src/theme/pokemon-types';

export default function PokemonDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ idOrName?: string | string[] }>();
  const parsedRoute = React.useMemo(
    () => parsePokemonRouteParam(params.idOrName),
    [params.idOrName]
  );

  const entryQuery = usePokemonEntry(
    parsedRoute.ok ? parsedRoute.lookupKey : '',
    parsedRoute.ok
  );
  const entry = entryQuery.data;

  const [selectedVarietySlug, setSelectedVarietySlug] = React.useState<string | null>(null);
  const [isShiny, setIsShiny] = React.useState(false);
  const [selectedFlavorSlug, setSelectedFlavorSlug] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!entry) return;
    const requestedForm =
      parsedRoute.ok && parsedRoute.initialFormSlug
        ? entry.varieties.find((v) => v.slug === parsedRoute.initialFormSlug)
        : null;
    const defaultVariety = entry.varieties.find((v) => v.isDefault) ?? entry.varieties[0];
    setSelectedVarietySlug(requestedForm?.slug ?? defaultVariety?.slug ?? null);
    setSelectedFlavorSlug(entry.defaultFlavorVersion);
    setIsShiny(false);
  }, [entry, parsedRoute]);

  const selectedVariety: PokemonVarietyRef | null = React.useMemo(() => {
    if (!entry) return null;
    return (
      entry.varieties.find((v) => v.slug === selectedVarietySlug) ??
      entry.varieties.find((v) => v.isDefault) ??
      null
    );
  }, [entry, selectedVarietySlug]);

  const formQuery = usePokemonForm(selectedVariety, entry?.defaultForm);
  const activeForm = formQuery.data ?? entry?.defaultForm;

  const evolutionQuery = useEvolutionChain(entry?.evolutionChainId);
  const { isCaught, isFavorite, toggleCaught, toggleFavorite, storageError } = useCollection();
  const [dismissedStorageError, setDismissedStorageError] = React.useState(false);

  React.useEffect(() => {
    setDismissedStorageError(false);
  }, [storageError]);

  const typeProfile = React.useMemo(
    () => (activeForm ? calculateTypeEffectiveness(activeForm.types) : null),
    [activeForm]
  );

  const handleBack = React.useCallback(() => {
    router.back();
  }, [router]);

  const handleSelectEvolution = React.useCallback(
    (node: EvolutionNode) => {
      router.push(`/pokemon/${node.slug}`);
    },
    [router]
  );

  if (!parsedRoute.ok) {
    return <PokemonNotFoundState onBack={handleBack} />;
  }

  if (
    entryQuery.isError &&
    entryQuery.error instanceof PokedexApiError &&
    entryQuery.error.code === 'NOT_FOUND'
  ) {
    return <PokemonNotFoundState onBack={handleBack} />;
  }

  if (entryQuery.isError && !entry) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-slate-50">
        <View className="px-4 pt-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={handleBack}
            className="min-h-[44px] min-w-[44px] items-center justify-center self-start rounded-full bg-white"
          >
            <ArrowLeft size={20} color="#0F172A" />
          </Pressable>
        </View>
        <ErrorRetryState
          title="Unable to Load Pokémon"
          message={getApiErrorMessage(
            entryQuery.error,
            "This entry isn't cached offline yet. Connect to the internet and tap retry."
          )}
          onRetry={() => entryQuery.refetch()}
        />
      </SafeAreaView>
    );
  }

  if (entryQuery.isLoading || !entry || !activeForm || !typeProfile) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-slate-50 p-4">
        <Skeleton className="mb-4 h-11 w-11 rounded-full" />
        <Skeleton className="mb-4 h-64 w-full rounded-3xl" />
        <Skeleton className="mb-3 h-36 w-full rounded-3xl" />
        <Skeleton className="h-48 w-full rounded-3xl" />
      </SafeAreaView>
    );
  }

  const primaryToken = getTypeToken(activeForm.types[0]);
  const displayedArtwork =
    isShiny && activeForm.shinyArtworkUrl ? activeForm.shinyArtworkUrl : activeForm.artworkUrl;
  const missingShinyNotice = isShiny && !activeForm.shinyArtworkUrl;

  const activeFlavor =
    entry.flavorTexts.find((f) => f.versionSlug === selectedFlavorSlug) ?? entry.flavorTexts[0];

  const caught = isCaught(entry.id);
  const favorite = isFavorite(entry.id);

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ backgroundColor: primaryToken.cardTint }}
      className="flex-1"
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {storageError && !dismissedStorageError ? (
          <View className="pt-2">
            <OfflineBanner
              testID="storage-error-banner"
              message={storageError}
              onDismiss={() => setDismissedStorageError(true)}
            />
          </View>
        ) : null}

        {/* Immersive Type-Tinted Hero Header */}
        <View className="px-4 pb-6 pt-3">
          <View className="mb-3 flex-row items-center justify-between">
            <Pressable
              testID="detail-back-button"
              accessibilityRole="button"
              accessibilityLabel="Back to Pokédex"
              onPress={handleBack}
              className="min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/85"
            >
              <ArrowLeft size={20} color="#0F172A" />
            </Pressable>

            <View className="flex-row items-center gap-2">
              <Pressable
                testID="detail-caught-toggle"
                accessibilityRole="button"
                accessibilityLabel={
                  caught ? `Unmark ${entry.name} as caught` : `Mark ${entry.name} as caught`
                }
                accessibilityState={{ selected: caught }}
                onPress={() => toggleCaught(entry.id)}
                className="min-h-[44px] flex-row items-center gap-1.5 rounded-full bg-white/90 px-3"
              >
                {caught ? (
                  <CheckCircle2 size={18} color="#15803D" />
                ) : (
                  <Circle size={18} color="#475569" />
                )}
                <Text className="text-xs font-bold text-slate-900">
                  {caught ? 'Caught' : 'Catch'}
                </Text>
              </Pressable>

              <Pressable
                testID="detail-favorite-toggle"
                accessibilityRole="button"
                accessibilityLabel={
                  favorite
                    ? `Remove ${entry.name} from favorites`
                    : `Add ${entry.name} to favorites`
                }
                accessibilityState={{ selected: favorite }}
                onPress={() => toggleFavorite(entry.id)}
                className="min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/90"
              >
                <Heart
                  size={20}
                  color={favorite ? '#DC2626' : '#475569'}
                  fill={favorite ? '#DC2626' : 'none'}
                />
              </Pressable>
            </View>
          </View>

          <View className="flex-row items-baseline justify-between">
            <View className="flex-1 pr-2">
              <Text className="text-sm font-extrabold tracking-wider text-slate-700">
                {entry.dexNumber} · {entry.region}
              </Text>
              <Text testID="detail-pokemon-name" className="text-3xl font-extrabold text-slate-900">
                {entry.name}
              </Text>
            </View>

            <Pressable
              testID="shiny-toggle-button"
              accessibilityRole="button"
              accessibilityLabel={
                isShiny ? 'Switch to default artwork' : 'Switch to shiny artwork'
              }
              accessibilityState={{ selected: isShiny }}
              onPress={() => setIsShiny((prev) => !prev)}
              className={`min-h-[44px] flex-row items-center gap-1.5 rounded-full border px-3.5 ${
                isShiny
                  ? 'border-amber-500 bg-amber-100'
                  : 'border-slate-300 bg-white/90'
              }`}
            >
              <Sparkles size={16} color={isShiny ? '#B45309' : '#475569'} />
              <Text className="text-xs font-bold text-slate-900">
                {isShiny ? 'Shiny' : 'Default'}
              </Text>
            </Pressable>
          </View>

          <View testID="detail-hero-types" className="mt-2 flex-row flex-wrap gap-2">
            {activeForm.types.map((t) => (
              <TypeBadge key={t} type={t} size="md" />
            ))}
          </View>

          {/* Conditional Form Selector (omitted when only 1 Default form exists) */}
          {entry.varieties.length > 1 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-3"
              contentContainerStyle={{ gap: 8 }}
            >
              {entry.varieties.map((variety) => {
                const active = variety.slug === selectedVariety?.slug;
                return (
                  <Pressable
                    key={variety.slug}
                    testID={`form-pill-${variety.slug}`}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${variety.label} form`}
                    accessibilityState={{ selected: active }}
                    onPress={() => setSelectedVarietySlug(variety.slug)}
                    className={`min-h-[44px] items-center justify-center rounded-full border px-4 ${
                      active
                        ? 'border-slate-900 bg-slate-900'
                        : 'border-slate-300 bg-white/90'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        active ? 'text-white' : 'text-slate-800'
                      }`}
                    >
                      {variety.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : null}

          <View className="mt-4 items-center justify-center">
            {displayedArtwork ? (
              <Image
                testID="detail-hero-image"
                source={{ uri: displayedArtwork }}
                cachePolicy="memory-disk"
                contentFit="contain"
                accessibilityLabel={`${entry.name} ${activeForm.label} ${
                  isShiny ? 'shiny' : 'default'
                } artwork`}
                style={{ width: 210, height: 210 }}
              />
            ) : (
              <View className="h-[210px] w-[210px] items-center justify-center rounded-3xl bg-white/70">
                <Text className="text-sm font-semibold text-slate-600">
                  Artwork unavailable
                </Text>
              </View>
            )}
            {missingShinyNotice ? (
              <Text
                testID="missing-shiny-notice"
                className="mt-2 text-xs font-semibold text-amber-900"
              >
                Shiny artwork unavailable for this form; showing default artwork.
              </Text>
            ) : null}
            {formQuery.error ? (
              <View
                testID="form-error-retry"
                className="mt-3 w-full items-center rounded-2xl border border-amber-300 bg-amber-50 p-3"
              >
                <Text className="mb-2 text-center text-xs font-semibold text-amber-950">
                  {getApiErrorMessage(
                    formQuery.error,
                    'Unable to load alternate form offline. Connect and retry.'
                  )}
                </Text>
                <Button
                  testID="retry-form-button"
                  variant="outline"
                  onPress={() => formQuery.refetch()}
                  accessibilityLabel="Retry loading alternate form"
                  className="border-amber-400 bg-white"
                >
                  <ButtonText variant="outline">Retry Form</ButtonText>
                </Button>
              </View>
            ) : null}
          </View>
        </View>

        {/* Structured Detail Sections */}
        <View className="gap-4 rounded-t-3xl bg-slate-50 px-4 pt-5">
          {/* About & Pokédex Entry */}
          <View className="rounded-3xl border border-slate-200 bg-white p-4">
            <Text className="mb-3 text-base font-bold text-slate-900">About</Text>

            <View className="mb-4 flex-row justify-between rounded-2xl bg-slate-50 p-3">
              <View className="flex-1 items-center">
                <Text className="text-[11px] font-bold uppercase text-slate-500">Category</Text>
                <Text className="mt-0.5 text-center text-sm font-bold text-slate-900">
                  {entry.genus}
                </Text>
              </View>
              <View className="flex-1 items-center border-x border-slate-200 px-2">
                <Text className="text-[11px] font-bold uppercase text-slate-500">Height</Text>
                <Text className="mt-0.5 text-sm font-bold text-slate-900">
                  {activeForm.heightMeters.toFixed(1)} m
                </Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-[11px] font-bold uppercase text-slate-500">Weight</Text>
                <Text className="mt-0.5 text-sm font-bold text-slate-900">
                  {activeForm.weightKg.toFixed(1)} kg
                </Text>
              </View>
            </View>

            {/* Abilities (distinguishing regular vs Hidden Abilities) */}
            <Text className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-600">
              Abilities
            </Text>
            <View className="mb-4 flex-row flex-wrap gap-2">
              {activeForm.abilities.map((ab) => (
                <Badge
                  key={`${ab.slot}-${ab.slug}`}
                  variant={ab.isHidden ? 'solid' : 'outline'}
                  className={ab.isHidden ? 'bg-purple-700' : ''}
                >
                  <BadgeText variant={ab.isHidden ? 'solid' : 'outline'}>
                    {ab.isHidden ? `${ab.name} · Hidden` : ab.name}
                  </BadgeText>
                </Badge>
              ))}
            </View>

            {/* Pokédex Flavor Text + Game-Version Selector */}
            <Text className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-600">
              Pokédex Entry
            </Text>
            {entry.flavorTexts.length > 0 && activeFlavor ? (
              <View>
                <Text
                  testID="detail-flavor-text"
                  className="mb-3 text-sm leading-6 text-slate-800"
                >
                  {activeFlavor.text}
                </Text>
                {entry.flavorTexts.length > 1 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8 }}
                  >
                    {entry.flavorTexts.map((ft) => {
                      const active = ft.versionSlug === activeFlavor.versionSlug;
                      return (
                        <Pressable
                          key={ft.versionSlug}
                          testID={`flavor-version-${ft.versionSlug}`}
                          accessibilityRole="button"
                          accessibilityLabel={`View Pokédex entry from ${ft.versionLabel}`}
                          accessibilityState={{ selected: active }}
                          onPress={() => setSelectedFlavorSlug(ft.versionSlug)}
                          className={`min-h-[44px] items-center justify-center rounded-full border px-3.5 ${
                            active
                              ? 'border-slate-900 bg-slate-900'
                              : 'border-slate-300 bg-slate-50'
                          }`}
                        >
                          <Text
                            className={`text-xs font-semibold ${
                              active ? 'text-white' : 'text-slate-700'
                            }`}
                          >
                            {ft.versionLabel}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                ) : null}
              </View>
            ) : (
              <Text className="text-sm text-slate-500">
                No English Pokédex entry available for this species.
              </Text>
            )}
          </View>

          {/* Base Stats */}
          <View className="rounded-3xl border border-slate-200 bg-white p-4">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-base font-bold text-slate-900">Base Stats</Text>
              <Badge variant="subtle">
                <BadgeText variant="subtle" testID="detail-stat-total">
                  Total {activeForm.stats.total}
                </BadgeText>
              </Badge>
            </View>
            <StatBarRow label="HP" value={activeForm.stats.hp} />
            <StatBarRow label="Attack" value={activeForm.stats.attack} />
            <StatBarRow label="Defense" value={activeForm.stats.defense} />
            <StatBarRow label="Sp. Atk" value={activeForm.stats.spAtk} />
            <StatBarRow label="Sp. Def" value={activeForm.stats.spDef} />
            <StatBarRow label="Speed" value={activeForm.stats.speed} />
          </View>

          {/* Defensive Type Effectiveness */}
          <TypeEffectivenessSection profile={typeProfile} />

          {/* Evolution Chain */}
          {evolutionQuery.data ? (
            <EvolutionChainSection
              chain={evolutionQuery.data}
              currentSpeciesId={entry.id}
              onSelectSpecies={handleSelectEvolution}
            />
          ) : evolutionQuery.isError ? (
            <View
              testID="evolution-error-retry"
              className="items-center rounded-3xl border border-amber-300 bg-amber-50 p-4"
            >
              <Text className="mb-3 text-center text-sm font-semibold text-amber-950">
                {getApiErrorMessage(
                  evolutionQuery.error,
                  'Unable to load evolution chain offline. Connect and retry.'
                )}
              </Text>
              <Button
                testID="retry-evolution-button"
                variant="outline"
                onPress={() => evolutionQuery.refetch()}
                accessibilityLabel="Retry loading evolution chain"
                className="border-amber-400 bg-white"
              >
                <ButtonText variant="outline">Retry Evolution Chain</ButtonText>
              </Button>
            </View>
          ) : evolutionQuery.isLoading ? (
            <Skeleton className="h-32 w-full rounded-3xl" />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
