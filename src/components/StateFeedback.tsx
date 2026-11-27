import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function CatalogSkeletonGrid() {
  return (
    <View testID="catalog-skeleton" className="flex-row flex-wrap justify-between px-4 pt-2">
      {Array.from({ length: 6 }).map((_, idx) => (
        <View key={idx} className="mb-3 w-[48.5%] rounded-2xl border border-slate-200 bg-white p-3">
          <Skeleton className="mb-2 h-4 w-16" />
          <Skeleton className="mb-2 h-5 w-28" />
          <Skeleton className="mb-3 h-20 w-full" />
          <View className="flex-row gap-2">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </View>
        </View>
      ))}
    </View>
  );
}

export function EmptyCatalogState({
  title = 'No Pokémon Found',
  message = 'No Pokémon match your active search or filter criteria.',
  actionLabel = 'Reset Filters',
  onReset,
}: {
  title?: string;
  message?: string;
  actionLabel?: string;
  onReset?: () => void;
}) {
  return (
    <View testID="empty-catalog-state" className="items-center justify-center px-6 py-14">
      <Text className="mb-2 text-center text-xl font-bold text-slate-900">{title}</Text>
      <Text className="mb-5 text-center text-sm leading-5 text-slate-600">{message}</Text>
      {onReset ? (
        <Button onPress={onReset} accessibilityLabel={actionLabel}>
          <ButtonText>{actionLabel}</ButtonText>
        </Button>
      ) : null}
    </View>
  );
}

export function OfflineBanner({
  testID = 'offline-banner',
  message,
  onRetry,
  onDismiss,
}: {
  testID?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}) {
  return (
    <View
      testID={testID}
      accessibilityRole="alert"
      className="mx-4 mb-2 flex-row items-center justify-between rounded-2xl border border-amber-300 bg-amber-50 px-3.5 py-2.5"
    >
      <Text className="mr-2 flex-1 text-xs font-medium text-amber-950">{message}</Text>
      <View className="flex-row items-center gap-2">
        {onRetry ? (
          <Button
            variant="outline"
            onPress={onRetry}
            accessibilityLabel="Retry refresh"
            className="min-h-[44px] border-amber-400 bg-white px-3 py-1"
          >
            <ButtonText variant="outline" className="text-xs text-amber-950">
              Retry
            </ButtonText>
          </Button>
        ) : null}
        {onDismiss ? (
          <Button
            variant="ghost"
            onPress={onDismiss}
            accessibilityLabel="Dismiss notice"
            className="min-h-[44px] px-2 py-1"
          >
            <ButtonText variant="ghost" className="text-xs text-amber-950">
              Dismiss
            </ButtonText>
          </Button>
        ) : null}
      </View>
    </View>
  );
}

export function InfiniteScrollFooter({
  isLoading,
  errorMessage,
  onRetry,
}: {
  isLoading: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
}) {
  if (errorMessage) {
    return (
      <View testID="infinite-retry-footer" className="items-center px-4 py-5">
        <Text className="mb-2 text-center text-sm text-slate-700">{errorMessage}</Text>
        {onRetry ? (
          <Button variant="outline" onPress={onRetry} accessibilityLabel="Retry loading more Pokémon">
            <ButtonText variant="outline">Retry Loading More</ButtonText>
          </Button>
        ) : null}
      </View>
    );
  }

  if (isLoading) {
    return (
      <View testID="infinite-loading-footer" className="items-center py-5">
        <ActivityIndicator size="small" color="#DC2626" />
        <Text className="mt-2 text-xs text-slate-600">Loading more Pokémon...</Text>
      </View>
    );
  }

  return <View className="h-6" />;
}

export function ErrorRetryState({
  title = 'Connection Issue',
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry: () => void;
}) {
  return (
    <View testID="error-retry-state" className="flex-1 items-center justify-center px-6 py-12">
      <Text className="mb-2 text-center text-xl font-bold text-slate-900">{title}</Text>
      <Text className="mb-6 text-center text-sm leading-5 text-slate-600">{message}</Text>
      <Button onPress={onRetry} accessibilityLabel="Retry">
        <ButtonText>Retry</ButtonText>
      </Button>
    </View>
  );
}

export function PokemonNotFoundState({
  message = 'We could not find a Pokémon matching that National Dex number or name.',
  onBack,
}: {
  message?: string;
  onBack: () => void;
}) {
  return (
    <View testID="pokemon-not-found-state" className="flex-1 items-center justify-center bg-slate-50 px-6 py-12">
      <Text className="mb-2 text-center text-2xl font-bold text-slate-900">
        Pokémon Not Found
      </Text>
      <Text className="mb-6 text-center text-sm leading-5 text-slate-600">{message}</Text>
      <Button onPress={onBack} accessibilityLabel="Back to Pokédex">
        <ButtonText>Back to Pokédex</ButtonText>
      </Button>
    </View>
  );
}
