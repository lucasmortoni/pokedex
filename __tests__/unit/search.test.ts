import { mapSpeciesListToCatalogIndex } from '@/src/api/mappers';
import { filterCatalogIndex, matchesSearchQuery, parseSearchQuery } from '@/src/domain/search';
import { MOCK_SPECIES_INDEX_RESULTS, MOCK_TYPE_POKEMON } from '../fixtures/pokeapi-fixtures';

describe('Real-time search and multi-facet catalog filtering', () => {
  const index = mapSpeciesListToCatalogIndex(MOCK_SPECIES_INDEX_RESULTS);

  it('parses and matches numeric queries with or without # and leading zeros', () => {
    expect(parseSearchQuery('25')).toEqual({ kind: 'dexId', id: 25 });
    expect(parseSearchQuery('0025')).toEqual({ kind: 'dexId', id: 25 });
    expect(parseSearchQuery('#0025')).toEqual({ kind: 'dexId', id: 25 });
    expect(parseSearchQuery('#0000')).toEqual({ kind: 'dexId', id: 0 });

    const pikachu = index.find((i) => i.id === 25)!;
    expect(matchesSearchQuery(pikachu, parseSearchQuery('#0025'))).toBe(true);
    expect(matchesSearchQuery(pikachu, parseSearchQuery('#0000'))).toBe(false);
  });

  it('normalizes diacritics, punctuation, apostrophes, and gender symbols', () => {
    const flabebe = index.find((i) => i.slug === 'flabebe')!;
    const farfetchd = index.find((i) => i.slug === 'farfetchd')!;
    const mrMime = index.find((i) => i.slug === 'mr-mime')!;
    const typeNull = index.find((i) => i.slug === 'type-null')!;
    const nidoranF = index.find((i) => i.slug === 'nidoran-f')!;
    const porygonZ = index.find((i) => i.slug === 'porygon-z')!;

    expect(matchesSearchQuery(flabebe, parseSearchQuery('flabebe'))).toBe(true);
    expect(matchesSearchQuery(flabebe, parseSearchQuery('Flabébé'))).toBe(true);
    expect(matchesSearchQuery(farfetchd, parseSearchQuery('farfetchd'))).toBe(true);
    expect(matchesSearchQuery(mrMime, parseSearchQuery('mr mime'))).toBe(true);
    expect(matchesSearchQuery(typeNull, parseSearchQuery('type null'))).toBe(true);
    expect(matchesSearchQuery(nidoranF, parseSearchQuery('nidoran f'))).toBe(true);
    expect(matchesSearchQuery(porygonZ, parseSearchQuery('porygon z'))).toBe(true);
  });

  it('filters across single-type, dual-type, generation, and collection facets', () => {
    const waterSet = new Set(MOCK_TYPE_POKEMON.water);
    const groundSet = new Set(MOCK_TYPE_POKEMON.ground);

    const dualHoenn = filterCatalogIndex({
      index,
      filters: {
        searchQuery: '',
        selectedTypes: ['water', 'ground'],
        selectedGeneration: 3,
        collectionStatus: 'all',
      },
      caughtSet: new Set([260]),
      favoriteSet: new Set(),
      typeIdSets: [waterSet, groundSet],
    });
    expect(dualHoenn.map((i) => i.slug)).toEqual(['swampert']);

    const favOnly = filterCatalogIndex({
      index,
      filters: {
        searchQuery: 'sprig',
        selectedTypes: [],
        selectedGeneration: 9,
        collectionStatus: 'favorites',
      },
      caughtSet: new Set(),
      favoriteSet: new Set([906]),
    });
    expect(favOnly.map((i) => i.slug)).toEqual(['sprigatito']);
  });
});
