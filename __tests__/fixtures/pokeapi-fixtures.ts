import type { PokemonTypeName } from '@/src/domain/types';

function artworkUrl(id: number, shiny = false): string {
  return shiny
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`
    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

function makeRawPokemon(params: {
  id: number;
  name: string;
  types: PokemonTypeName[];
  stats: [number, number, number, number, number, number];
  abilities: Array<{ name: string; isHidden: boolean; slot: number }>;
  height?: number;
  weight?: number;
  shinyArtwork?: string | null;
}) {
  const statNames = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
  return {
    id: params.id,
    name: params.name,
    height: params.height ?? 7,
    weight: params.weight ?? 69,
    types: params.types.map((t, idx) => ({ slot: idx + 1, type: { name: t } })),
    stats: params.stats.map((base_stat, idx) => ({
      base_stat,
      stat: { name: statNames[idx] },
    })),
    abilities: params.abilities.map((ab) => ({
      is_hidden: ab.isHidden,
      slot: ab.slot,
      ability: { name: ab.name },
    })),
    sprites: {
      front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${params.id}.png`,
      front_shiny:
        params.shinyArtwork === null
          ? null
          : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${params.id}.png`,
      other: {
        'official-artwork': {
          front_default: artworkUrl(params.id, false),
          front_shiny:
            params.shinyArtwork === undefined ? artworkUrl(params.id, true) : params.shinyArtwork,
        },
      },
    },
  };
}

export const MOCK_SPECIES_INDEX_RESULTS = [
  { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
  { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon-species/2/' },
  { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon-species/3/' },
  { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon-species/4/' },
  { name: 'charmeleon', url: 'https://pokeapi.co/api/v2/pokemon-species/5/' },
  { name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon-species/6/' },
  ...Array.from({ length: 18 }, (_, i) => ({
    name: `kanto-mon-${i + 7}`,
    url: `https://pokeapi.co/api/v2/pokemon-species/${i + 7}/`,
  })),
  { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon-species/25/' },
  { name: 'raichu', url: 'https://pokeapi.co/api/v2/pokemon-species/26/' },
  { name: 'nidoran-f', url: 'https://pokeapi.co/api/v2/pokemon-species/29/' },
  { name: 'farfetchd', url: 'https://pokeapi.co/api/v2/pokemon-species/83/' },
  { name: 'mr-mime', url: 'https://pokeapi.co/api/v2/pokemon-species/122/' },
  { name: 'tauros', url: 'https://pokeapi.co/api/v2/pokemon-species/128/' },
  { name: 'eevee', url: 'https://pokeapi.co/api/v2/pokemon-species/133/' },
  { name: 'vaporeon', url: 'https://pokeapi.co/api/v2/pokemon-species/134/' },
  { name: 'jolteon', url: 'https://pokeapi.co/api/v2/pokemon-species/135/' },
  { name: 'flareon', url: 'https://pokeapi.co/api/v2/pokemon-species/136/' },
  { name: 'espeon', url: 'https://pokeapi.co/api/v2/pokemon-species/196/' },
  { name: 'umbreon', url: 'https://pokeapi.co/api/v2/pokemon-species/197/' },
  { name: 'swampert', url: 'https://pokeapi.co/api/v2/pokemon-species/260/' },
  { name: 'wurmple', url: 'https://pokeapi.co/api/v2/pokemon-species/265/' },
  { name: 'silcoon', url: 'https://pokeapi.co/api/v2/pokemon-species/266/' },
  { name: 'cascoon', url: 'https://pokeapi.co/api/v2/pokemon-species/268/' },
  { name: 'leafeon', url: 'https://pokeapi.co/api/v2/pokemon-species/470/' },
  { name: 'glaceon', url: 'https://pokeapi.co/api/v2/pokemon-species/471/' },
  { name: 'porygon-z', url: 'https://pokeapi.co/api/v2/pokemon-species/474/' },
  { name: 'flabebe', url: 'https://pokeapi.co/api/v2/pokemon-species/669/' },
  { name: 'sylveon', url: 'https://pokeapi.co/api/v2/pokemon-species/700/' },
  { name: 'type-null', url: 'https://pokeapi.co/api/v2/pokemon-species/772/' },
  { name: 'sprigatito', url: 'https://pokeapi.co/api/v2/pokemon-species/906/' },
];

export const MOCK_RAW_POKEMON: Record<string, any> = {
  '1': makeRawPokemon({
    id: 1,
    name: 'bulbasaur',
    types: ['grass', 'poison'],
    stats: [45, 49, 49, 65, 65, 45],
    abilities: [
      { name: 'overgrow', isHidden: false, slot: 1 },
      { name: 'chlorophyll', isHidden: true, slot: 3 },
    ],
    height: 7,
    weight: 69,
  }),
  bulbasaur: makeRawPokemon({
    id: 1,
    name: 'bulbasaur',
    types: ['grass', 'poison'],
    stats: [45, 49, 49, 65, 65, 45],
    abilities: [
      { name: 'overgrow', isHidden: false, slot: 1 },
      { name: 'chlorophyll', isHidden: true, slot: 3 },
    ],
  }),
  '6': makeRawPokemon({
    id: 6,
    name: 'charizard',
    types: ['fire', 'flying'],
    stats: [78, 84, 78, 109, 85, 100],
    abilities: [
      { name: 'blaze', isHidden: false, slot: 1 },
      { name: 'solar-power', isHidden: true, slot: 3 },
    ],
    height: 17,
    weight: 905,
  }),
  charizard: makeRawPokemon({
    id: 6,
    name: 'charizard',
    types: ['fire', 'flying'],
    stats: [78, 84, 78, 109, 85, 100],
    abilities: [
      { name: 'blaze', isHidden: false, slot: 1 },
      { name: 'solar-power', isHidden: true, slot: 3 },
    ],
    height: 17,
    weight: 905,
  }),
  'charizard-mega-x': makeRawPokemon({
    id: 10034,
    name: 'charizard-mega-x',
    types: ['fire', 'dragon'],
    stats: [78, 130, 111, 130, 85, 100],
    abilities: [{ name: 'tough-claws', isHidden: false, slot: 1 }],
    height: 17,
    weight: 1105,
  }),
  'charizard-gmax': makeRawPokemon({
    id: 10196,
    name: 'charizard-gmax',
    types: ['fire', 'flying'],
    stats: [78, 84, 78, 109, 85, 100],
    abilities: [
      { name: 'blaze', isHidden: false, slot: 1 },
      { name: 'solar-power', isHidden: true, slot: 3 },
    ],
    height: 280,
    weight: 10000,
  }),
  '25': makeRawPokemon({
    id: 25,
    name: 'pikachu',
    types: ['electric'],
    stats: [35, 55, 40, 50, 50, 90],
    abilities: [
      { name: 'static', isHidden: false, slot: 1 },
      { name: 'lightning-rod', isHidden: true, slot: 3 },
    ],
    height: 4,
    weight: 60,
  }),
  pikachu: makeRawPokemon({
    id: 25,
    name: 'pikachu',
    types: ['electric'],
    stats: [35, 55, 40, 50, 50, 90],
    abilities: [
      { name: 'static', isHidden: false, slot: 1 },
      { name: 'lightning-rod', isHidden: true, slot: 3 },
    ],
    height: 4,
    weight: 60,
  }),
  '26': makeRawPokemon({
    id: 26,
    name: 'raichu',
    types: ['electric'],
    stats: [60, 90, 55, 90, 80, 110],
    abilities: [
      { name: 'static', isHidden: false, slot: 1 },
      { name: 'lightning-rod', isHidden: true, slot: 3 },
    ],
    height: 8,
    weight: 300,
  }),
  raichu: makeRawPokemon({
    id: 26,
    name: 'raichu',
    types: ['electric'],
    stats: [60, 90, 55, 90, 80, 110],
    abilities: [
      { name: 'static', isHidden: false, slot: 1 },
      { name: 'lightning-rod', isHidden: true, slot: 3 },
    ],
    height: 8,
    weight: 300,
  }),
  'raichu-alola': makeRawPokemon({
    id: 10100,
    name: 'raichu-alola',
    types: ['electric', 'psychic'],
    stats: [60, 85, 50, 95, 85, 110],
    abilities: [{ name: 'surge-surfer', isHidden: false, slot: 1 }],
    height: 7,
    weight: 210,
  }),
  '128': makeRawPokemon({
    id: 128,
    name: 'tauros',
    types: ['normal'],
    stats: [75, 100, 95, 40, 70, 110],
    abilities: [
      { name: 'intimidate', isHidden: false, slot: 1 },
      { name: 'anger-point', isHidden: false, slot: 2 },
      { name: 'sheer-force', isHidden: true, slot: 3 },
    ],
    shinyArtwork: null,
  }),
  '133': makeRawPokemon({
    id: 133,
    name: 'eevee',
    types: ['normal'],
    stats: [55, 55, 50, 45, 65, 55],
    abilities: [
      { name: 'run-away', isHidden: false, slot: 1 },
      { name: 'adaptability', isHidden: false, slot: 2 },
      { name: 'anticipation', isHidden: true, slot: 3 },
    ],
    height: 3,
    weight: 65,
  }),
  eevee: makeRawPokemon({
    id: 133,
    name: 'eevee',
    types: ['normal'],
    stats: [55, 55, 50, 45, 65, 55],
    abilities: [
      { name: 'run-away', isHidden: false, slot: 1 },
      { name: 'adaptability', isHidden: false, slot: 2 },
      { name: 'anticipation', isHidden: true, slot: 3 },
    ],
    height: 3,
    weight: 65,
  }),
  vaporeon: makeRawPokemon({
    id: 134,
    name: 'vaporeon',
    types: ['water'],
    stats: [130, 65, 60, 110, 95, 65],
    abilities: [
      { name: 'water-absorb', isHidden: false, slot: 1 },
      { name: 'hydration', isHidden: true, slot: 3 },
    ],
    height: 10,
    weight: 290,
  }),
  '260': makeRawPokemon({
    id: 260,
    name: 'swampert',
    types: ['water', 'ground'],
    stats: [100, 110, 90, 85, 90, 60],
    abilities: [
      { name: 'torrent', isHidden: false, slot: 1 },
      { name: 'damp', isHidden: true, slot: 3 },
    ],
    height: 15,
    weight: 819,
  }),
  swampert: makeRawPokemon({
    id: 260,
    name: 'swampert',
    types: ['water', 'ground'],
    stats: [100, 110, 90, 85, 90, 60],
    abilities: [
      { name: 'torrent', isHidden: false, slot: 1 },
      { name: 'damp', isHidden: true, slot: 3 },
    ],
    height: 15,
    weight: 819,
  }),
};

for (const item of MOCK_SPECIES_INDEX_RESULTS) {
  const idMatch = item.url.match(/\/pokemon-species\/(\d+)\//);
  const id = idMatch ? Number(idMatch[1]) : 999;
  if (!MOCK_RAW_POKEMON[String(id)]) {
    const type: PokemonTypeName =
      item.name === 'sprigatito' ? 'grass' : item.name === 'flabebe' ? 'fairy' : 'normal';
    const raw = makeRawPokemon({
      id,
      name: item.name,
      types: [type],
      stats: [50, 50, 50, 50, 50, 50],
      abilities: [{ name: 'run-away', isHidden: false, slot: 1 }],
    });
    MOCK_RAW_POKEMON[String(id)] = raw;
    MOCK_RAW_POKEMON[item.name] = raw;
  }
}

export const MOCK_RAW_SPECIES: Record<string, any> = {
  bulbasaur: {
    id: 1,
    name: 'bulbasaur',
    genera: [{ genus: 'Seed Pokémon', language: { name: 'en' } }],
    flavor_text_entries: [
      {
        flavor_text: 'A strange seed was\nplanted on its\fback at birth.',
        language: { name: 'en' },
        version: { name: 'red' },
      },
      {
        flavor_text: 'For some time after its birth, it\u00ad uses the nutrients that are packed into the seed on its back.',
        language: { name: 'en' },
        version: { name: 'scarlet' },
      },
    ],
    evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/1/' },
    varieties: [
      { is_default: true, pokemon: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' } },
    ],
  },
  charizard: {
    id: 6,
    name: 'charizard',
    genera: [{ genus: 'Flame Pokémon', language: { name: 'en' } }],
    flavor_text_entries: [
      {
        flavor_text: 'Spits fire that is hot enough to melt boulders.',
        language: { name: 'en' },
        version: { name: 'red' },
      },
      {
        flavor_text: 'It is said that Charizard’s fire burns hotter if it has experienced harsh battles.',
        language: { name: 'en' },
        version: { name: 'scarlet' },
      },
    ],
    evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/2/' },
    varieties: [
      { is_default: true, pokemon: { name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon/6/' } },
      { is_default: false, pokemon: { name: 'charizard-mega-x', url: 'https://pokeapi.co/api/v2/pokemon/10034/' } },
      { is_default: false, pokemon: { name: 'charizard-gmax', url: 'https://pokeapi.co/api/v2/pokemon/10196/' } },
    ],
  },
  pikachu: {
    id: 25,
    name: 'pikachu',
    genera: [{ genus: 'Mouse Pokémon', language: { name: 'en' } }],
    flavor_text_entries: [
      {
        flavor_text: 'When several of\nthese POKéMON\fgather, their electricity could build.',
        language: { name: 'en' },
        version: { name: 'red' },
      },
      {
        flavor_text: 'When it is angered, it immediately discharges the energy stored in the pouches in its cheeks.',
        language: { name: 'en' },
        version: { name: 'scarlet' },
      },
    ],
    evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/10/' },
    varieties: [
      { is_default: true, pokemon: { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' } },
      { is_default: false, pokemon: { name: 'pikachu-rock-star', url: 'https://pokeapi.co/api/v2/pokemon/10080/' } },
    ],
  },
  raichu: {
    id: 26,
    name: 'raichu',
    genera: [{ genus: 'Mouse Pokémon', language: { name: 'en' } }],
    flavor_text_entries: [
      {
        flavor_text: 'Its long tail serves as a ground to protect\nitself from its own high voltage power.',
        language: { name: 'en' },
        version: { name: 'shield' },
      },
      {
        flavor_text: 'Its tail discharges electricity into the ground, protecting it from getting shocked.',
        language: { name: 'en' },
        version: { name: 'scarlet' },
      },
    ],
    evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/10/' },
    varieties: [
      { is_default: true, pokemon: { name: 'raichu', url: 'https://pokeapi.co/api/v2/pokemon/26/' } },
      { is_default: false, pokemon: { name: 'raichu-alola', url: 'https://pokeapi.co/api/v2/pokemon/10100/' } },
    ],
  },
  tauros: {
    id: 128,
    name: 'tauros',
    genera: [{ genus: 'Wild Bull Pokémon', language: { name: 'en' } }],
    flavor_text_entries: [
      {
        flavor_text: 'When it is about to tackle, it whips its body repeatedly with its three long tails.',
        language: { name: 'en' },
        version: { name: 'scarlet' },
      },
    ],
    evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/62/' },
    varieties: [
      { is_default: true, pokemon: { name: 'tauros', url: 'https://pokeapi.co/api/v2/pokemon/128/' } },
    ],
  },
  eevee: {
    id: 133,
    name: 'eevee',
    genera: [{ genus: 'Evolution Pokémon', language: { name: 'en' } }],
    flavor_text_entries: [
      {
        flavor_text: 'Its genetic code is irregular. It may mutate if it is exposed to radiation from element stones.',
        language: { name: 'en' },
        version: { name: 'scarlet' },
      },
      {
        flavor_text: 'It has the ability to alter the composition of its body to suit its surrounding environment.',
        language: { name: 'en' },
        version: { name: 'shield' },
      },
    ],
    evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/67/' },
    varieties: [
      { is_default: true, pokemon: { name: 'eevee', url: 'https://pokeapi.co/api/v2/pokemon/133/' } },
    ],
  },
  vaporeon: {
    id: 134,
    name: 'vaporeon',
    genera: [{ genus: 'Bubble Jet Pokémon', language: { name: 'en' } }],
    flavor_text_entries: [
      {
        flavor_text: 'Lives close to water. Its long tail is ridged with a fin which is often mistaken for a mermaid’s.',
        language: { name: 'en' },
        version: { name: 'scarlet' },
      },
    ],
    evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/67/' },
    varieties: [
      { is_default: true, pokemon: { name: 'vaporeon', url: 'https://pokeapi.co/api/v2/pokemon/134/' } },
    ],
  },
  swampert: {
    id: 260,
    name: 'swampert',
    genera: [{ genus: 'Mud Fish Pokémon', language: { name: 'en' } }],
    flavor_text_entries: [
      {
        flavor_text: 'Its arms are rock-hard. With one swing, it can batter down its foe.',
        language: { name: 'en' },
        version: { name: 'violet' },
      },
    ],
    evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/132/' },
    varieties: [
      { is_default: true, pokemon: { name: 'swampert', url: 'https://pokeapi.co/api/v2/pokemon/260/' } },
    ],
  },
  wurmple: {
    id: 265,
    name: 'wurmple',
    genera: [{ genus: 'Worm Pokémon', language: { name: 'en' } }],
    flavor_text_entries: [
      {
        flavor_text: 'Often targeted by bird Pokémon, it desperately resists by releasing poison from its tail spikes.',
        language: { name: 'en' },
        version: { name: 'legends-arceus' },
      },
    ],
    evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/135/' },
    varieties: [
      { is_default: true, pokemon: { name: 'wurmple', url: 'https://pokeapi.co/api/v2/pokemon/265/' } },
    ],
  },
};

for (const [slug, sp] of Object.entries({ ...MOCK_RAW_SPECIES })) {
  MOCK_RAW_SPECIES[String(sp.id)] = sp;
  MOCK_RAW_SPECIES[slug] = sp;
}

export const MOCK_RAW_EVOLUTION_CHAINS: Record<number, any> = {
  1: {
    id: 1,
    chain: {
      species: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
      evolution_details: [],
      evolves_to: [
        {
          species: { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon-species/2/' },
          evolution_details: [{ min_level: 16, trigger: { name: 'level-up' } }],
          evolves_to: [
            {
              species: { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon-species/3/' },
              evolution_details: [{ min_level: 32, trigger: { name: 'level-up' } }],
              evolves_to: [],
            },
          ],
        },
      ],
    },
  },
  2: {
    id: 2,
    chain: {
      species: { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon-species/4/' },
      evolution_details: [],
      evolves_to: [
        {
          species: { name: 'charmeleon', url: 'https://pokeapi.co/api/v2/pokemon-species/5/' },
          evolution_details: [{ min_level: 16, trigger: { name: 'level-up' } }],
          evolves_to: [
            {
              species: { name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon-species/6/' },
              evolution_details: [{ min_level: 36, trigger: { name: 'level-up' } }],
              evolves_to: [],
            },
          ],
        },
      ],
    },
  },
  10: {
    id: 10,
    chain: {
      species: { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon-species/25/' },
      evolution_details: [],
      evolves_to: [
        {
          species: { name: 'raichu', url: 'https://pokeapi.co/api/v2/pokemon-species/26/' },
          evolution_details: [{ item: { name: 'thunder-stone' }, trigger: { name: 'use-item' } }],
          evolves_to: [],
        },
      ],
    },
  },
  62: {
    id: 62,
    chain: {
      species: { name: 'tauros', url: 'https://pokeapi.co/api/v2/pokemon-species/128/' },
      evolution_details: [],
      evolves_to: [],
    },
  },
  67: {
    id: 67,
    chain: {
      species: { name: 'eevee', url: 'https://pokeapi.co/api/v2/pokemon-species/133/' },
      evolution_details: [],
      evolves_to: [
        {
          species: { name: 'vaporeon', url: 'https://pokeapi.co/api/v2/pokemon-species/134/' },
          evolution_details: [{ item: { name: 'water-stone' }, trigger: { name: 'use-item' } }],
          evolves_to: [],
        },
        {
          species: { name: 'jolteon', url: 'https://pokeapi.co/api/v2/pokemon-species/135/' },
          evolution_details: [{ item: { name: 'thunder-stone' }, trigger: { name: 'use-item' } }],
          evolves_to: [],
        },
        {
          species: { name: 'flareon', url: 'https://pokeapi.co/api/v2/pokemon-species/136/' },
          evolution_details: [{ item: { name: 'fire-stone' }, trigger: { name: 'use-item' } }],
          evolves_to: [],
        },
        {
          species: { name: 'espeon', url: 'https://pokeapi.co/api/v2/pokemon-species/196/' },
          evolution_details: [{ min_happiness: 160, time_of_day: 'day', trigger: { name: 'level-up' } }],
          evolves_to: [],
        },
        {
          species: { name: 'umbreon', url: 'https://pokeapi.co/api/v2/pokemon-species/197/' },
          evolution_details: [{ min_happiness: 160, time_of_day: 'night', trigger: { name: 'level-up' } }],
          evolves_to: [],
        },
        {
          species: { name: 'leafeon', url: 'https://pokeapi.co/api/v2/pokemon-species/470/' },
          evolution_details: [{ item: { name: 'leaf-stone' }, trigger: { name: 'use-item' } }],
          evolves_to: [],
        },
        {
          species: { name: 'glaceon', url: 'https://pokeapi.co/api/v2/pokemon-species/471/' },
          evolution_details: [{ item: { name: 'ice-stone' }, trigger: { name: 'use-item' } }],
          evolves_to: [],
        },
        {
          species: { name: 'sylveon', url: 'https://pokeapi.co/api/v2/pokemon-species/700/' },
          evolution_details: [{ min_affection: 2, trigger: { name: 'level-up' } }],
          evolves_to: [],
        },
      ],
    },
  },
  132: {
    id: 132,
    chain: {
      species: { name: 'swampert', url: 'https://pokeapi.co/api/v2/pokemon-species/260/' },
      evolution_details: [],
      evolves_to: [],
    },
  },
  135: {
    id: 135,
    chain: {
      species: { name: 'wurmple', url: 'https://pokeapi.co/api/v2/pokemon-species/265/' },
      evolution_details: [],
      evolves_to: [
        {
          species: { name: 'silcoon', url: 'https://pokeapi.co/api/v2/pokemon-species/266/' },
          evolution_details: [{ min_level: 7, trigger: { name: 'level-up' } }],
          evolves_to: [],
        },
        {
          species: { name: 'cascoon', url: 'https://pokeapi.co/api/v2/pokemon-species/268/' },
          evolution_details: [{ min_level: 7, trigger: { name: 'level-up' } }],
          evolves_to: [],
        },
      ],
    },
  },
};

export const MOCK_TYPE_POKEMON: Record<string, number[]> = {
  grass: [1, 2, 3, 906],
  poison: [1, 2, 3],
  fire: [4, 5, 6, 136],
  flying: [6],
  electric: [25, 26, 135],
  water: [134, 260],
  ground: [260],
  normal: [128, 133, 474, 772],
  fairy: [669, 700],
  dark: [197],
};
