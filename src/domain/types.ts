export const POKEMON_TYPES = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
] as const;

export type PokemonTypeName = (typeof POKEMON_TYPES)[number];

export type GenerationId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type CollectionStatusFilter = 'all' | 'caught' | 'favorites';

export type EffectivenessMultiplier = 0 | 0.25 | 0.5 | 1 | 2 | 4;

export interface PokemonCatalogIndexItem {
  id: number;
  dexNumber: string;
  slug: string;
  name: string;
  generation: GenerationId;
  region: string;
}

export interface PokemonSummary extends PokemonCatalogIndexItem {
  types: [PokemonTypeName] | [PokemonTypeName, PokemonTypeName];
  spriteUrl: string | null;
}

export interface PokemonBaseStats {
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
  total: number;
}

export interface PokemonAbility {
  slug: string;
  name: string;
  isHidden: boolean;
  slot: number;
}

export interface FlavorTextEntry {
  versionSlug: string;
  versionLabel: string;
  text: string;
}

export interface PokemonForm {
  id: number;
  slug: string;
  label: string;
  isDefault: boolean;
  types: [PokemonTypeName] | [PokemonTypeName, PokemonTypeName];
  artworkUrl: string | null;
  shinyArtworkUrl: string | null;
  stats: PokemonBaseStats;
  abilities: PokemonAbility[];
  heightMeters: number;
  weightKg: number;
}

export interface PokemonVarietyRef {
  slug: string;
  label: string;
  isDefault: boolean;
  pokemonId: number;
}

export interface PokemonEntry extends PokemonCatalogIndexItem {
  genus: string;
  flavorTexts: FlavorTextEntry[];
  defaultFlavorVersion: string | null;
  defaultForm: PokemonForm;
  varieties: PokemonVarietyRef[];
  evolutionChainId: number | null;
}

export interface TypeEffectivenessProfile {
  defendingTypes: PokemonTypeName[];
  quadWeaknesses: PokemonTypeName[];
  weaknesses: PokemonTypeName[];
  neutral: PokemonTypeName[];
  resistances: PokemonTypeName[];
  quadResistances: PokemonTypeName[];
  immunities: PokemonTypeName[];
}

export interface EvolutionNode {
  speciesId: number;
  dexNumber: string;
  slug: string;
  name: string;
  spriteUrl: string | null;
  triggerLabel: string | null;
  evolvesTo: EvolutionNode[];
}

export interface EvolutionChain {
  id: number;
  root: EvolutionNode;
  hasBranching: boolean;
}

export interface CollectionRecord {
  version: 1;
  caughtIds: number[];
  favoriteIds: number[];
}

export interface CatalogFilterState {
  searchQuery: string;
  selectedTypes: PokemonTypeName[];
  selectedGeneration: GenerationId | null;
  collectionStatus: CollectionStatusFilter;
}
