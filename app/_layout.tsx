import '../global.css';
import 'react-native-reanimated';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { onlineManager, QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { CollectionProvider } from '@/src/hooks/use-collection';
import {
  PokedexApiProvider,
  SEVEN_DAYS_MS,
  TWENTY_FOUR_HOURS_MS,
} from '@/src/hooks/use-pokedex-queries';

onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => {
    setOnline(Boolean(state.isConnected));
  })
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: TWENTY_FOUR_HOURS_MS,
      gcTime: SEVEN_DAYS_MS,
      networkMode: 'offlineFirst',
      retry: 1,
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'pokedex:query-cache:v1',
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GluestackUIProvider mode="light">
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{
            persister: asyncStoragePersister,
            maxAge: SEVEN_DAYS_MS,
            buster: 'v1',
          }}
        >
          <PokedexApiProvider>
            <CollectionProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="pokemon/[idOrName]" />
              </Stack>
            </CollectionProvider>
          </PokedexApiProvider>
        </PersistQueryClientProvider>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}
