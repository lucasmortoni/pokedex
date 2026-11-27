import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';
import CatalogScreen from '@/app/index';
import PokemonDetailScreen from '@/app/pokemon/[idOrName]';
import { InMemoryCollectionStorageAdapter } from '@/src/storage/collection-storage';
import { createTestWrapper } from '../fixtures/test-wrapper';

const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;

describe('Personal collection tracking & offline persistence (US4)', () => {
  it('toggles Caught & Favorite on catalog cards, updates Caught X / Y counter, and filters pills', async () => {
    const storage = new InMemoryCollectionStorageAdapter();
    const Wrapper = createTestWrapper({ storageAdapter: storage });
    await render(<CatalogScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('Caught 0 / 1025')).toBeTruthy();
      expect(screen.getByText('Bulbasaur')).toBeTruthy();
    });

    await fireEvent.press(screen.getByTestId('card-caught-1'));
    await fireEvent.press(screen.getByTestId('card-favorite-6'));

    await waitFor(() => {
      expect(screen.getByText('Caught 1 / 1025')).toBeTruthy();
    });

    await fireEvent.press(screen.getByTestId('status-pill-caught'));
    await waitFor(() => {
      expect(screen.getByText('Bulbasaur')).toBeTruthy();
      expect(screen.queryByText('Charizard')).toBeNull();
    });

    await fireEvent.press(screen.getByTestId('status-pill-favorites'));
    await waitFor(() => {
      expect(screen.getByText('Charizard')).toBeTruthy();
      expect(screen.queryByText('Bulbasaur')).toBeNull();
    });
  });

  it('tracks base species across alternate form views and persists across simulated app restart', async () => {
    const storage = new InMemoryCollectionStorageAdapter();
    mockUseLocalSearchParams.mockReturnValue({ idOrName: 'raichu' });

    const FirstLaunchWrapper = createTestWrapper({ storageAdapter: storage });
    const { unmount } = await render(<PokemonDetailScreen />, { wrapper: FirstLaunchWrapper });

    await waitFor(() => {
      expect(screen.getByTestId('detail-pokemon-name').props.children).toBe('Raichu');
    });

    // Switch to Alolan Raichu form and mark Caught
    await fireEvent.press(screen.getByTestId('form-pill-raichu-alola'));
    await fireEvent.press(screen.getByTestId('detail-caught-toggle'));

    await waitFor(async () => {
      expect((await storage.load()).caughtIds).toEqual([26]);
    });

    await unmount();

    // Simulate full app restart with a fresh QueryClient/Provider reading the same persisted storage
    const RestartedWrapper = createTestWrapper({ storageAdapter: storage });
    await render(<CatalogScreen />, { wrapper: RestartedWrapper });

    await waitFor(() => {
      expect(screen.getByText('Caught 1 / 1025')).toBeTruthy();
    });
  });

  it('surfaces non-blocking alert when local collection save fails', async () => {
    const storage = new InMemoryCollectionStorageAdapter();
    storage.save = async () => {
      throw new Error('Disk full');
    };
    const Wrapper = createTestWrapper({ storageAdapter: storage });
    await render(<CatalogScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('Bulbasaur')).toBeTruthy();
    });

    await fireEvent.press(screen.getByTestId('card-caught-1'));
    await waitFor(() => {
      expect(screen.getByTestId('storage-error-banner')).toBeTruthy();
      expect(screen.getByText('Unable to save collection changes locally.')).toBeTruthy();
    });
  });
});
