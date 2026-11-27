import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';
import PokemonDetailScreen from '@/app/pokemon/[idOrName]';
import { mockRouterBack, mockRouterPush } from '../setup';
import { createMockPokeApiClient, createTestWrapper } from '../fixtures/test-wrapper';
import { PokedexApiError } from '@/src/api/pokeapi-client';

const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;

describe('PokemonDetailScreen (US3)', () => {
  it('supports Default/Shiny toggle, regional/Mega form switching, and multi-game flavor picker', async () => {
    mockUseLocalSearchParams.mockReturnValue({ idOrName: 'raichu' });
    const Wrapper = createTestWrapper();
    await render(<PokemonDetailScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByTestId('detail-pokemon-name').props.children).toBe('Raichu');
      expect(screen.getByText('Total 485')).toBeTruthy();
    });

    // Switch flavor text version to Shield
    await fireEvent.press(screen.getByTestId('flavor-version-shield'));
    expect(screen.getByTestId('detail-flavor-text').props.children).toContain(
      'protect itself from its own high voltage power'
    );

    // Toggle Shiny
    await fireEvent.press(screen.getByTestId('shiny-toggle-button'));
    expect(screen.getByTestId('detail-hero-image').props['data-uri']).toContain('/shiny/26.png');

    // Switch to Alolan Raichu form -> updates types (Psychic), stats, and physical dimensions
    await fireEvent.press(screen.getByTestId('form-pill-raichu-alola'));
    await waitFor(() => {
      expect(within(screen.getByTestId('detail-hero-types')).getByText('Psychic')).toBeTruthy();
      expect(screen.getByText('0.7 m')).toBeTruthy();
      expect(screen.getByText('21.0 kg')).toBeTruthy();
      expect(screen.getByText('Surge Surfer')).toBeTruthy();
    });
  });

  it('preselects form when deep-linked directly to an alternate form slug', async () => {
    mockUseLocalSearchParams.mockReturnValue({ idOrName: 'raichu-alola' });
    const Wrapper = createTestWrapper();
    await render(<PokemonDetailScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByTestId('detail-pokemon-name').props.children).toBe('Raichu');
      expect(within(screen.getByTestId('detail-hero-types')).getByText('Psychic')).toBeTruthy();
    });
  });

  it('renders branching evolution chain (Eevee) and navigates on stage tap', async () => {
    mockUseLocalSearchParams.mockReturnValue({ idOrName: 'eevee' });
    const Wrapper = createTestWrapper();
    await render(<PokemonDetailScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByTestId('detail-pokemon-name').props.children).toBe('Eevee');
      expect(screen.getByTestId('evo-node-vaporeon')).toBeTruthy();
      expect(screen.getByTestId('evo-node-umbreon')).toBeTruthy();
      expect(screen.getByText('Water Stone')).toBeTruthy();
      expect(screen.getByText('Friendship · Night')).toBeTruthy();
    });

    // Tapping current node is a no-op; tapping Vaporeon navigates
    await fireEvent.press(screen.getAllByTestId('evo-node-eevee')[0]!);
    expect(mockRouterPush).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByTestId('evo-node-vaporeon'));
    expect(mockRouterPush).toHaveBeenCalledWith('/pokemon/vaporeon');
  });

  it('shows missing-shiny fallback notice when shiny artwork is null', async () => {
    mockUseLocalSearchParams.mockReturnValue({ idOrName: '128' });
    const Wrapper = createTestWrapper();
    await render(<PokemonDetailScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByTestId('detail-pokemon-name').props.children).toBe('Tauros');
    });

    await fireEvent.press(screen.getByTestId('shiny-toggle-button'));
    expect(screen.getByTestId('missing-shiny-notice')).toBeTruthy();
  });

  it('shows recoverable Not Found state on invalid params and unknown 404 slugs', async () => {
    mockUseLocalSearchParams.mockReturnValue({ idOrName: '0' });
    const Wrapper = createTestWrapper();
    const { rerender } = await render(<PokemonDetailScreen />, { wrapper: Wrapper });

    expect(screen.getByTestId('pokemon-not-found-state')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Back to Pokédex'));
    expect(mockRouterBack).toHaveBeenCalled();

    mockUseLocalSearchParams.mockReturnValue({ idOrName: 'missingno' });
    await rerender(<PokemonDetailScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('pokemon-not-found-state')).toBeTruthy();
    });
  });

  it('supports 1-tap retry for alternate-form and evolution-chain load failures', async () => {
    mockUseLocalSearchParams.mockReturnValue({ idOrName: 'raichu' });
    let failForm = true;
    let failEvolution = true;
    const baseClient = createMockPokeApiClient();
    const client = createMockPokeApiClient({
      async fetchPokemonForm(slug, label, isDefault) {
        if (failForm) throw new PokedexApiError('OFFLINE', 'Offline form');
        return baseClient.fetchPokemonForm(slug, label, isDefault);
      },
      async fetchEvolutionChain(chainId) {
        if (failEvolution) throw new PokedexApiError('OFFLINE', 'Offline evo');
        return baseClient.fetchEvolutionChain(chainId);
      },
    });

    const Wrapper = createTestWrapper({ apiClient: client });
    await render(<PokemonDetailScreen />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByTestId('evolution-error-retry')).toBeTruthy();
    });

    failEvolution = false;
    await fireEvent.press(screen.getByTestId('retry-evolution-button'));
    await waitFor(() => {
      expect(screen.getByTestId('evolution-chain-section')).toBeTruthy();
    });

    await fireEvent.press(screen.getByTestId('form-pill-raichu-alola'));
    await waitFor(() => {
      expect(screen.getByTestId('form-error-retry')).toBeTruthy();
    });

    failForm = false;
    await fireEvent.press(screen.getByTestId('retry-form-button'));
    await waitFor(() => {
      expect(within(screen.getByTestId('detail-hero-types')).getByText('Psychic')).toBeTruthy();
    });
  });
});
