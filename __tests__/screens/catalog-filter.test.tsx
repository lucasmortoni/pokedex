import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import CatalogScreen from '@/app/index';
import { PokedexApiError } from '@/src/api/pokeapi-client';
import { createMockPokeApiClient, createTestWrapper } from '../fixtures/test-wrapper';

describe('CatalogScreen search and FilterBottomSheet (US2)', () => {
  it('searches across the full catalog by name and #0025 Dex ID', async () => {
    const Wrapper = createTestWrapper();
    await render(<CatalogScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('Bulbasaur')).toBeTruthy();
    });

    // Search for a Pokémon beyond the initial 24-card page
    await fireEvent.changeText(screen.getByTestId('catalog-search-input'), '#0025');
    await waitFor(() => {
      expect(screen.getByText('Pikachu')).toBeTruthy();
      expect(screen.queryByText('Bulbasaur')).toBeNull();
    });

    await fireEvent.press(screen.getByTestId('clear-search-button'));
    await waitFor(() => {
      expect(screen.getByText('Bulbasaur')).toBeTruthy();
    });
  });

  it('applies dual-type and generation filters from FilterBottomSheet with FIFO 2-type cap', async () => {
    const Wrapper = createTestWrapper();
    await render(<CatalogScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('Bulbasaur')).toBeTruthy();
    });

    await fireEvent.press(screen.getByTestId('open-filters-button'));
    expect(screen.getByTestId('filter-bottom-sheet')).toBeTruthy();

    // Select 3 types -> FIFO replaces 'fire' with 'ground', keeping ['water', 'ground']
    await fireEvent.press(screen.getByTestId('filter-type-fire'));
    await fireEvent.press(screen.getByTestId('filter-type-water'));
    await fireEvent.press(screen.getByTestId('filter-type-ground'));
    await fireEvent.press(screen.getByTestId('filter-gen-3'));

    await fireEvent.press(screen.getByTestId('filter-apply-button'));

    await waitFor(() => {
      expect(screen.getByText('Swampert')).toBeTruthy();
      expect(screen.queryByText('Bulbasaur')).toBeNull();
    });
  });

  it('shows empty state with 1-tap Reset Filters when no Pokémon match', async () => {
    const Wrapper = createTestWrapper();
    await render(<CatalogScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('Bulbasaur')).toBeTruthy();
    });

    await fireEvent.changeText(screen.getByTestId('catalog-search-input'), 'zzzz-nonexistent');

    await waitFor(() => {
      expect(screen.getByTestId('empty-catalog-state')).toBeTruthy();
    });

    await fireEvent.press(screen.getByLabelText('Reset Filters'));

    await waitFor(() => {
      expect(screen.getByText('Bulbasaur')).toBeTruthy();
    });
  });

  it('displays explicit offline notice when selecting an uncached elemental type offline', async () => {
    const client = createMockPokeApiClient({
      async fetchTypePokemonIds() {
        throw new PokedexApiError('OFFLINE', 'Type list not cached');
      },
    });
    const Wrapper = createTestWrapper({ apiClient: client });
    await render(<CatalogScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('Bulbasaur')).toBeTruthy();
    });

    await fireEvent.press(screen.getByTestId('open-filters-button'));
    await fireEvent.press(screen.getByTestId('filter-type-water'));
    await fireEvent.press(screen.getByTestId('filter-apply-button'));

    await waitFor(() => {
      expect(screen.getByText('Filter Data Unavailable Offline')).toBeTruthy();
    });
  });
});
