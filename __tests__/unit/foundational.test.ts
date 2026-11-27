import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  mapRawEvolutionChain,
  mapRawPokemonToForm,
  mapRawSpeciesToEntry,
  mapSpeciesListToCatalogIndex,
  sanitizeFlavorText,
} from '@/src/api/mappers';
import { formatDexNumber, getGenerationForId } from '@/src/domain/generations';
import { parsePokemonRouteParam } from '@/src/domain/navigation';
import { POKEMON_TYPES } from '@/src/domain/types';
import {
  AsyncStorageCollectionAdapter,
  COLLECTION_STORAGE_KEY,
  InMemoryCollectionStorageAdapter,
} from '@/src/storage/collection-storage';
import { getContrastRatio, POKEMON_TYPE_TOKENS } from '@/src/theme/pokemon-types';
import {
  MOCK_RAW_EVOLUTION_CHAINS,
  MOCK_RAW_POKEMON,
  MOCK_RAW_SPECIES,
  MOCK_SPECIES_INDEX_RESULTS,
} from '../fixtures/pokeapi-fixtures';

describe('Foundational domain, mappers, tokens, and storage', () => {
  it('formats National Dex numbers with minimum 4 digits', () => {
    expect(formatDexNumber(1)).toBe('#0001');
    expect(formatDexNumber(25)).toBe('#0025');
    expect(formatDexNumber(151)).toBe('#0151');
    expect(formatDexNumber(1025)).toBe('#1025');
  });

  it('maps Gen I-IX boundary IDs accurately', () => {
    expect(getGenerationForId(1).id).toBe(1);
    expect(getGenerationForId(151).region).toBe('Kanto');
    expect(getGenerationForId(152).id).toBe(2);
    expect(getGenerationForId(252).region).toBe('Hoenn');
    expect(getGenerationForId(906).id).toBe(9);
    expect(getGenerationForId(1025).region).toBe('Paldea');
  });

  it('maintains WCAG AA (>= 4.5:1) foreground contrast across all 18 Pokémon types', () => {
    for (const type of POKEMON_TYPES) {
      const token = POKEMON_TYPE_TOKENS[type];
      const ratio = getContrastRatio(token.background, token.foreground);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('parses and validates route parameters including regional/mega deep links', () => {
    expect(parsePokemonRouteParam('#0025')).toEqual({
      ok: true,
      lookupKey: '25',
      numericId: 25,
      initialFormSlug: null,
    });
    expect(parsePokemonRouteParam('  Pikachu  ')).toEqual({
      ok: true,
      lookupKey: 'pikachu',
      numericId: null,
      initialFormSlug: null,
    });
    expect(parsePokemonRouteParam('raichu-alola')).toEqual({
      ok: true,
      lookupKey: 'raichu',
      numericId: null,
      initialFormSlug: 'raichu-alola',
    });
    expect(parsePokemonRouteParam('charizard-mega-x')).toEqual({
      ok: true,
      lookupKey: 'charizard',
      numericId: null,
      initialFormSlug: 'charizard-mega-x',
    });
    expect(parsePokemonRouteParam('0')).toEqual({ ok: false, reason: 'INVALID_PARAM' });
    expect(parsePokemonRouteParam('-5')).toEqual({ ok: false, reason: 'INVALID_PARAM' });
    expect(parsePokemonRouteParam('9999')).toEqual({ ok: false, reason: 'INVALID_PARAM' });
    expect(parsePokemonRouteParam('pikachu!!')).toEqual({ ok: false, reason: 'INVALID_PARAM' });
  });

  it('maps species list into sorted Gen I-IX index with special display names', () => {
    const index = mapSpeciesListToCatalogIndex(MOCK_SPECIES_INDEX_RESULTS);
    expect(index[0]?.id).toBe(1);
    expect(index[0]?.dexNumber).toBe('#0001');
    expect(index.find((i) => i.slug === 'mr-mime')?.name).toBe('Mr. Mime');
    expect(index.find((i) => i.slug === 'flabebe')?.name).toBe('Flabébé');
    expect(index.find((i) => i.slug === 'nidoran-f')?.name).toBe('Nidoran♀');
  });

  it('sanitizes control chars and soft hyphens in flavor text and selects newest English entry', () => {
    expect(sanitizeFlavorText('It\u00ad uses\npacked\fnutrients.')).toBe(
      'It uses packed nutrients.'
    );
    const entry = mapRawSpeciesToEntry(MOCK_RAW_SPECIES.bulbasaur, MOCK_RAW_POKEMON.bulbasaur);
    expect(entry.defaultFlavorVersion).toBe('scarlet');
    expect(entry.flavorTexts[0]?.text).not.toMatch(/[\f\n\u00ad]/);
    expect(entry.defaultForm.stats.total).toBe(318);
  });

  it('filters varieties to regional, Mega, and Gigantamax forms only', () => {
    const pikachuEntry = mapRawSpeciesToEntry(MOCK_RAW_SPECIES.pikachu, MOCK_RAW_POKEMON.pikachu);
    expect(pikachuEntry.varieties.map((v) => v.label)).toEqual(['Default']);

    const charizardEntry = mapRawSpeciesToEntry(
      MOCK_RAW_SPECIES.charizard,
      MOCK_RAW_POKEMON.charizard
    );
    expect(charizardEntry.varieties.map((v) => v.label)).toEqual([
      'Default',
      'Mega X',
      'Gigantamax',
    ]);

    const alolanRaichu = mapRawPokemonToForm(
      MOCK_RAW_POKEMON['raichu-alola'],
      'Alolan',
      false
    );
    expect(alolanRaichu.types).toEqual(['electric', 'psychic']);
    expect(alolanRaichu.heightMeters).toBe(0.7);
    expect(alolanRaichu.weightKg).toBe(21);
  });

  it('maps linear, single-stage, and branching evolution chains accurately', () => {
    const bulbaChain = mapRawEvolutionChain(MOCK_RAW_EVOLUTION_CHAINS[1]);
    expect(bulbaChain.hasBranching).toBe(false);
    expect(bulbaChain.root.evolvesTo[0]?.triggerLabel).toBe('Lv. 16');

    const taurosChain = mapRawEvolutionChain(MOCK_RAW_EVOLUTION_CHAINS[62]);
    expect(taurosChain.root.evolvesTo).toHaveLength(0);

    const eeveeChain = mapRawEvolutionChain(MOCK_RAW_EVOLUTION_CHAINS[67]);
    expect(eeveeChain.hasBranching).toBe(true);
    expect(eeveeChain.root.evolvesTo).toHaveLength(8);
    expect(eeveeChain.root.evolvesTo[3]?.triggerLabel).toBe('Friendship · Day');

    const wurmpleChain = mapRawEvolutionChain(MOCK_RAW_EVOLUTION_CHAINS[135]);
    expect(wurmpleChain.hasBranching).toBe(true);
    expect(wurmpleChain.root.evolvesTo).toHaveLength(2);
  });

  it('recovers safely from corrupted storage data and deduplicates valid IDs', async () => {
    await AsyncStorage.setItem(COLLECTION_STORAGE_KEY, '{invalid-json');
    const adapter = new AsyncStorageCollectionAdapter();
    expect(await adapter.load()).toEqual({ version: 1, caughtIds: [], favoriteIds: [] });

    await adapter.save({ version: 1, caughtIds: [25, 25, 0, 1026, 1], favoriteIds: [133, 25] });
    expect(await adapter.load()).toEqual({
      version: 1,
      caughtIds: [1, 25],
      favoriteIds: [25, 133],
    });

    const memory = new InMemoryCollectionStorageAdapter({ caughtIds: [6, 1] });
    expect((await memory.load()).caughtIds).toEqual([1, 6]);
  });
});
