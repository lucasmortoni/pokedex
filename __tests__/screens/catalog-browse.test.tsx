import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import CatalogScreen from '@/app/index';
import { PokedexApiError } from '@/src/api/pokeapi-client';
import { mockRouterPush } from '../setup';
import { createMockPokeApiClient, createTestWrapper } from '../fixtures/test-wrapper';

describe('CatalogScreen browsing & offline resilience (US1)', () => {
  it('renders Pokémon in ascending National Dex order and navigates on card tap', async () => {
    const Wrapper = createTestWrapper();
    await render(<CatalogScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('#0001')).toBeTruthy();
      expect(screen.getByText('Bulbasaur')).toBeTruthy();
      expect(screen.getByText('#0006')).toBeTruthy();
      expect(screen.getByText('Charizard')).toBeTruthy();
    });

    await fireEvent.press(screen.getByTestId('pokemon-card-1'));
    expect(mockRouterPush).toHaveBeenCalledWith('/pokemon/bulbasaur');
  });

  it('triggers automatic infinite scroll and supports inline retry when next batch fails', async () => {
    let failSecondPage = true;
    const client = createMockPokeApiClient({
      async fetchPokemonSummary(id) {
        if (id >= 25 && failSecondPage) {
          throw new PokedexApiError('OFFLINE', 'Network lost');
        }
        return createMockPokeApiClient().fetchPokemonSummary(id);
      },
    });

    const Wrapper = createTestWrapper({ apiClient: client });
    await render(<CatalogScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('Bulbasaur')).toBeTruthy();
    });

    await fireEvent(screen.getByTestId('catalog-flatlist'), 'endReached');

    await waitFor(() => {
      expect(screen.getByTestId('infinite-retry-footer')).toBeTruthy();
      expect(screen.getByText('Bulbasaur')).toBeTruthy();
    });

    failSecondPage = false;
    await fireEvent.press(screen.getByLabelText('Retry loading more Pokémon'));

    await waitFor(() => {
      expect(screen.getByText('Pikachu')).toBeTruthy();
    });
  });

  it('retains loaded Pokémon and displays non-destructive notice if pull-to-refresh fails offline', async () => {
    let shouldFailRefresh = false;
    const baseClient = createMockPokeApiClient();
    const client = createMockPokeApiClient({
      async fetchCatalogIndex() {
        if (shouldFailRefresh) {
          throw new PokedexApiError('OFFLINE', 'Offline');
        }
        return baseClient.fetchCatalogIndex();
      },
    });

    const Wrapper = createTestWrapper({ apiClient: client });
    await render(<CatalogScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('Bulbasaur')).toBeTruthy();
    });

    shouldFailRefresh = true;
    const list = screen.getByTestId('catalog-flatlist');
    const refreshControl = list.props.refreshControl;
    await act(async () => {
      await refreshControl.props.onRefresh();
    });

    await waitFor(() => {
      expect(screen.getByTestId('offline-banner')).toBeTruthy();
      expect(screen.getByText('Bulbasaur')).toBeTruthy();
    });
  });

  it('shows cold-start error retry state and recovers on tap', async () => {
    let offline = true;
    const baseClient = createMockPokeApiClient();
    const client = createMockPokeApiClient({
      async fetchCatalogIndex() {
        if (offline) throw new PokedexApiError('OFFLINE', 'No internet');
        return baseClient.fetchCatalogIndex();
      },
    });

    const Wrapper = createTestWrapper({ apiClient: client });
    await render(<CatalogScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByTestId('error-retry-state')).toBeTruthy();
    });

    offline = false;
    await fireEvent.press(screen.getByLabelText('Retry'));

    await waitFor(() => {
      expect(screen.getByText('Bulbasaur')).toBeTruthy();
    });
  });

  it('surfaces normalized rate-limit error message on 429 failure', async () => {
    const client = createMockPokeApiClient({
      async fetchCatalogIndex() {
        throw new PokedexApiError(
          'RATE_LIMITED',
          'Too many requests to PokéAPI. Please retry shortly.',
          429
        );
      },
    });

    const Wrapper = createTestWrapper({ apiClient: client });
    await render(<CatalogScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(
        screen.getByText('Too many requests to PokéAPI. Please retry shortly.')
      ).toBeTruthy();
    });
  });
});
