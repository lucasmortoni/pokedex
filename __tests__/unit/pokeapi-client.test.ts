import { createPokeApiClient, getApiErrorMessage, PokedexApiError } from '@/src/api/pokeapi-client';
import {
  MOCK_RAW_EVOLUTION_CHAINS,
  MOCK_RAW_POKEMON,
  MOCK_RAW_SPECIES,
  MOCK_SPECIES_INDEX_RESULTS,
  MOCK_TYPE_POKEMON,
} from '../fixtures/pokeapi-fixtures';

function mockJsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe('createPokeApiClient & error normalization', () => {
  it('fetches and maps all PokéAPI endpoints cleanly', async () => {
    const fetchMock = jest.fn(async (url: string) => {
      if (url.endsWith('/pokemon-species?limit=1025&offset=0')) {
        return mockJsonResponse({ results: MOCK_SPECIES_INDEX_RESULTS });
      }
      if (url.endsWith('/type/electric')) {
        return mockJsonResponse({
          pokemon: MOCK_TYPE_POKEMON.electric!.map((id) => ({
            pokemon: { url: `https://pokeapi.co/api/v2/pokemon/${id}/` },
          })),
        });
      }
      if (url.endsWith('/pokemon/25')) {
        return mockJsonResponse(MOCK_RAW_POKEMON['25']);
      }
      if (url.endsWith('/pokemon-species/raichu')) {
        return mockJsonResponse(MOCK_RAW_SPECIES.raichu);
      }
      if (url.endsWith('/pokemon/raichu')) {
        return mockJsonResponse(MOCK_RAW_POKEMON.raichu);
      }
      if (url.endsWith('/pokemon/raichu-alola')) {
        return mockJsonResponse(MOCK_RAW_POKEMON['raichu-alola']);
      }
      if (url.endsWith('/evolution-chain/10')) {
        return mockJsonResponse(MOCK_RAW_EVOLUTION_CHAINS[10]);
      }
      throw new Error(`Unexpected URL: ${url}`);
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const client = createPokeApiClient();

    const index = await client.fetchCatalogIndex();
    expect(index[0]?.id).toBe(1);

    const electricIds = await client.fetchTypePokemonIds('electric');
    expect(electricIds).toEqual(MOCK_TYPE_POKEMON.electric);

    const summary = await client.fetchPokemonSummary(25);
    expect(summary.name).toBe('Pikachu');

    const entry = await client.fetchPokemonEntry('  Raichu  ');
    expect(entry.id).toBe(26);

    const alolan = await client.fetchPokemonForm('raichu-alola', 'Alolan', false);
    expect(alolan.types).toEqual(['electric', 'psychic']);

    const chain = await client.fetchEvolutionChain(10);
    expect(chain.root.slug).toBe('pikachu');
  });

  it('normalizes OFFLINE, AbortError, NOT_FOUND, RATE_LIMITED, SERVER_ERROR, and INVALID_RESPONSE', async () => {
    const client = createPokeApiClient();

    globalThis.fetch = jest.fn(async () => {
      throw new TypeError('Network request failed');
    }) as unknown as typeof fetch;
    await expect(client.fetchCatalogIndex()).rejects.toMatchObject({ code: 'OFFLINE' });

    globalThis.fetch = jest.fn(async () => {
      const err = new Error('Aborted');
      err.name = 'AbortError';
      throw err;
    }) as unknown as typeof fetch;
    await expect(client.fetchCatalogIndex()).rejects.toMatchObject({ code: 'OFFLINE' });

    globalThis.fetch = jest.fn(async () => mockJsonResponse({}, 404)) as unknown as typeof fetch;
    await expect(client.fetchPokemonEntry('missingno')).rejects.toMatchObject({
      code: 'NOT_FOUND',
      status: 404,
    });

    globalThis.fetch = jest.fn(async () => mockJsonResponse({}, 429)) as unknown as typeof fetch;
    await expect(client.fetchPokemonSummary(25)).rejects.toMatchObject({
      code: 'RATE_LIMITED',
      status: 429,
    });

    globalThis.fetch = jest.fn(async () => mockJsonResponse({}, 503)) as unknown as typeof fetch;
    await expect(client.fetchEvolutionChain(1)).rejects.toMatchObject({
      code: 'SERVER_ERROR',
      status: 503,
    });

    globalThis.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError('Unexpected token');
      },
    })) as unknown as typeof fetch;
    await expect(client.fetchPokemonSummary(1)).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
    });

    expect(
      getApiErrorMessage(new PokedexApiError('RATE_LIMITED', 'Rate limited msg', 429), 'Offline')
    ).toBe('Rate limited msg');
    expect(
      getApiErrorMessage(new PokedexApiError('OFFLINE', 'Raw offline'), 'Offline fallback')
    ).toBe('Offline fallback');
  });

  it('blocks unmocked global.fetch via test setup guard', async () => {
    await expect(fetch('https://pokeapi.co/api/v2/pokemon/1')).rejects.toThrow(
      'Live network requests are disabled in automated tests'
    );
  });
});
