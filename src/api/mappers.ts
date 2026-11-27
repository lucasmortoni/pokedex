import { formatDexNumber, getGenerationForId, TOTAL_SPECIES_COUNT } from '@/src/domain/generations';
import {
  POKEMON_TYPES,
  type EvolutionChain,
  type EvolutionNode,
  type FlavorTextEntry,
  type PokemonAbility,
  type PokemonBaseStats,
  type PokemonCatalogIndexItem,
  type PokemonEntry,
  type PokemonForm,
  type PokemonSummary,
  type PokemonTypeName,
  type PokemonVarietyRef,
} from '@/src/domain/types';

const POKEMON_TYPE_SET = new Set<string>(POKEMON_TYPES);

/**
 * Ordered from newest mainline releases to oldest so the default Pokédex
 * flavor text entry selects the most recent available English entry.
 */
const VERSION_RECENCY_ORDER = [
  'violet',
  'scarlet',
  'legends-arceus',
  'shining-pearl',
  'brilliant-diamond',
  'shield',
  'sword',
  'lets-go-eevee',
  'lets-go-pikachu',
  'ultra-moon',
  'ultra-sun',
  'moon',
  'sun',
  'alpha-sapphire',
  'omega-ruby',
  'y',
  'x',
  'white-2',
  'black-2',
  'white',
  'black',
  'soulsilver',
  'heartgold',
  'platinum',
  'pearl',
  'diamond',
  'emerald',
  'leafgreen',
  'firered',
  'sapphire',
  'ruby',
  'crystal',
  'silver',
  'gold',
  'yellow',
  'blue',
  'red',
];

const SPECIAL_DISPLAY_NAMES: Record<string, string> = {
  'nidoran-f': 'Nidoran♀',
  'nidoran-m': 'Nidoran♂',
  'mr-mime': 'Mr. Mime',
  'mime-jr': 'Mime Jr.',
  'mr-rime': 'Mr. Rime',
  farfetchd: "Farfetch'd",
  sirfetchd: "Sirfetch'd",
  flabebe: 'Flabébé',
  'type-null': 'Type: Null',
  'porygon-z': 'Porygon-Z',
  'ho-oh': 'Ho-Oh',
  'jangmo-o': 'Jangmo-o',
  'hakamo-o': 'Hakamo-o',
  'kommo-o': 'Kommo-o',
  'tapu-koko': 'Tapu Koko',
  'tapu-lele': 'Tapu Lele',
  'tapu-bulu': 'Tapu Bulu',
  'tapu-fini': 'Tapu Fini',
  'wo-chien': 'Wo-Chien',
  'chien-pao': 'Chien-Pao',
  'ting-lu': 'Ting-Lu',
  'chi-yu': 'Chi-Yu',
};

export function formatDisplayName(slug: string): string {
  const lower = slug.trim().toLowerCase();
  if (SPECIAL_DISPLAY_NAMES[lower]) {
    return SPECIAL_DISPLAY_NAMES[lower]!;
  }
  return lower
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function extractIdFromUrl(url: string | undefined): number | null {
  if (!url) return null;
  const match = url.match(/\/(\d+)\/?$/);
  return match && match[1] ? Number.parseInt(match[1], 10) : null;
}

export function officialArtworkUrlForId(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export function mapSpeciesListToCatalogIndex(
  results: Array<{ name: string; url: string }>
): PokemonCatalogIndexItem[] {
  const items: PokemonCatalogIndexItem[] = [];
  for (const row of results) {
    const id = extractIdFromUrl(row.url);
    if (!id || id < 1 || id > TOTAL_SPECIES_COUNT) {
      continue;
    }
    const gen = getGenerationForId(id);
    items.push({
      id,
      dexNumber: formatDexNumber(id),
      slug: row.name,
      name: formatDisplayName(row.name),
      generation: gen.id,
      region: gen.region,
    });
  }
  return items.sort((a, b) => a.id - b.id);
}

function mapRawTypes(
  rawTypes: any[]
): [PokemonTypeName] | [PokemonTypeName, PokemonTypeName] {
  const sorted = [...(Array.isArray(rawTypes) ? rawTypes : [])].sort(
    (a, b) => (a?.slot ?? 0) - (b?.slot ?? 0)
  );
  const valid: PokemonTypeName[] = [];
  for (const item of sorted) {
    const name = item?.type?.name;
    if (typeof name === 'string' && POKEMON_TYPE_SET.has(name)) {
      valid.push(name as PokemonTypeName);
    }
  }
  if (valid.length >= 2) {
    return [valid[0]!, valid[1]!];
  }
  return [valid[0] ?? 'normal'];
}

function mapRawStats(rawStats: any[]): PokemonBaseStats {
  const statMap: Record<string, number> = {};
  for (const item of Array.isArray(rawStats) ? rawStats : []) {
    const name = item?.stat?.name;
    if (typeof name === 'string' && typeof item?.base_stat === 'number') {
      statMap[name] = item.base_stat;
    }
  }
  const hp = statMap.hp ?? 0;
  const attack = statMap.attack ?? 0;
  const defense = statMap.defense ?? 0;
  const spAtk = statMap['special-attack'] ?? 0;
  const spDef = statMap['special-defense'] ?? 0;
  const speed = statMap.speed ?? 0;
  return {
    hp,
    attack,
    defense,
    spAtk,
    spDef,
    speed,
    total: hp + attack + defense + spAtk + spDef + speed,
  };
}

function mapRawAbilities(rawAbilities: any[]): PokemonAbility[] {
  return [...(Array.isArray(rawAbilities) ? rawAbilities : [])]
    .sort((a, b) => (a?.slot ?? 0) - (b?.slot ?? 0))
    .map((item) => {
      const slug = String(item?.ability?.name ?? 'unknown');
      return {
        slug,
        name: formatDisplayName(slug),
        isHidden: Boolean(item?.is_hidden),
        slot: Number(item?.slot ?? 1),
      };
    });
}

export function mapRawPokemonToSummary(raw: any): PokemonSummary {
  const id = Number(raw?.id ?? 0);
  const gen = getGenerationForId(id);
  const slug = String(raw?.name ?? `pokemon-${id}`);
  const artwork =
    raw?.sprites?.other?.['official-artwork']?.front_default ??
    raw?.sprites?.front_default ??
    (id > 0 ? officialArtworkUrlForId(id) : null);

  return {
    id,
    dexNumber: formatDexNumber(id),
    slug,
    name: formatDisplayName(slug),
    generation: gen.id,
    region: gen.region,
    types: mapRawTypes(raw?.types),
    spriteUrl: artwork ?? null,
  };
}

export function mapRawPokemonToForm(
  raw: any,
  label: string,
  isDefault: boolean
): PokemonForm {
  const id = Number(raw?.id ?? 0);
  const slug = String(raw?.name ?? '');
  const officialDefault = raw?.sprites?.other?.['official-artwork']?.front_default;
  const officialShiny = raw?.sprites?.other?.['official-artwork']?.front_shiny;
  const spriteDefault = raw?.sprites?.front_default;
  const spriteShiny = raw?.sprites?.front_shiny;

  return {
    id,
    slug,
    label,
    isDefault,
    types: mapRawTypes(raw?.types),
    artworkUrl: officialDefault ?? spriteDefault ?? null,
    shinyArtworkUrl: officialShiny ?? spriteShiny ?? null,
    stats: mapRawStats(raw?.stats),
    abilities: mapRawAbilities(raw?.abilities),
    heightMeters: Number(((Number(raw?.height ?? 0)) / 10).toFixed(1)),
    weightKg: Number(((Number(raw?.weight ?? 0)) / 10).toFixed(1)),
  };
}

export function sanitizeFlavorText(rawText: string): string {
  return rawText
    .replace(/\u00ad[\f\n\r]+/g, '')
    .replace(/\u00ad/g, '')
    .replace(/[\f\n\r]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function mapRawSpeciesToFlavorTexts(rawEntries: any[]): FlavorTextEntry[] {
  const byVersion = new Map<string, FlavorTextEntry>();

  for (const entry of Array.isArray(rawEntries) ? rawEntries : []) {
    if (entry?.language?.name !== 'en') continue;
    const versionSlug = String(entry?.version?.name ?? '');
    if (!versionSlug || byVersion.has(versionSlug)) continue;
    const text = sanitizeFlavorText(String(entry?.flavor_text ?? ''));
    if (!text) continue;

    byVersion.set(versionSlug, {
      versionSlug,
      versionLabel: formatDisplayName(versionSlug),
      text,
    });
  }

  return Array.from(byVersion.values()).sort((a, b) => {
    const idxA = VERSION_RECENCY_ORDER.indexOf(a.versionSlug);
    const idxB = VERSION_RECENCY_ORDER.indexOf(b.versionSlug);
    const rankA = idxA === -1 ? Number.MAX_SAFE_INTEGER : idxA;
    const rankB = idxB === -1 ? Number.MAX_SAFE_INTEGER : idxB;
    return rankA - rankB;
  });
}

function deriveVarietyLabel(slug: string, isDefault: boolean): string | null {
  if (isDefault) return 'Default';
  if (slug.endsWith('-alola')) return 'Alolan';
  if (slug.endsWith('-galar')) return 'Galarian';
  if (slug.endsWith('-hisui')) return 'Hisuian';
  if (slug.endsWith('-paldea')) return 'Paldean';
  if (slug.endsWith('-mega-x')) return 'Mega X';
  if (slug.endsWith('-mega-y')) return 'Mega Y';
  if (slug.endsWith('-mega')) return 'Mega';
  if (slug.endsWith('-gmax')) return 'Gigantamax';
  return null;
}

export function mapRawVarieties(rawVarieties: any[]): PokemonVarietyRef[] {
  const mapped: PokemonVarietyRef[] = [];
  for (const item of Array.isArray(rawVarieties) ? rawVarieties : []) {
    const slug = String(item?.pokemon?.name ?? '');
    const isDefault = Boolean(item?.is_default);
    const pokemonId = extractIdFromUrl(item?.pokemon?.url) ?? 0;
    const label = deriveVarietyLabel(slug, isDefault);
    if (!slug || !label) continue;
    mapped.push({
      slug,
      label,
      isDefault,
      pokemonId,
    });
  }
  return mapped.sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
}

export function mapRawSpeciesToEntry(rawSpecies: any, rawPokemon: any): PokemonEntry {
  const id = Number(rawSpecies?.id ?? rawPokemon?.id ?? 0);
  const slug = String(rawSpecies?.name ?? rawPokemon?.name ?? `pokemon-${id}`);
  const gen = getGenerationForId(id);
  const genusEntry = Array.isArray(rawSpecies?.genera)
    ? rawSpecies.genera.find((g: any) => g?.language?.name === 'en')
    : null;
  const flavorTexts = mapRawSpeciesToFlavorTexts(rawSpecies?.flavor_text_entries);
  const varieties = mapRawVarieties(rawSpecies?.varieties);
  const defaultVariety = varieties.find((v) => v.isDefault);
  const defaultForm = mapRawPokemonToForm(
    rawPokemon,
    defaultVariety?.label ?? 'Default',
    true
  );

  return {
    id,
    dexNumber: formatDexNumber(id),
    slug,
    name: formatDisplayName(slug),
    generation: gen.id,
    region: gen.region,
    genus: String(genusEntry?.genus ?? 'Pokémon'),
    flavorTexts,
    defaultFlavorVersion: flavorTexts[0]?.versionSlug ?? null,
    defaultForm,
    varieties,
    evolutionChainId: extractIdFromUrl(rawSpecies?.evolution_chain?.url),
  };
}

function formatEvolutionTrigger(details: any[]): string | null {
  if (!Array.isArray(details) || details.length === 0) return null;
  const d = details[0];
  const parts: string[] = [];

  if (typeof d?.min_level === 'number') {
    parts.push(`Lv. ${d.min_level}`);
  } else if (d?.item?.name) {
    parts.push(formatDisplayName(String(d.item.name)));
  } else if (d?.trigger?.name === 'trade') {
    parts.push(
      d?.held_item?.name ? `Trade (${formatDisplayName(String(d.held_item.name))})` : 'Trade'
    );
  } else if (typeof d?.min_happiness === 'number') {
    parts.push('Friendship');
  } else if (typeof d?.min_affection === 'number') {
    parts.push('Affection');
  } else if (d?.known_move?.name) {
    parts.push(`Know ${formatDisplayName(String(d.known_move.name))}`);
  } else if (d?.trigger?.name) {
    parts.push(formatDisplayName(String(d.trigger.name)));
  }

  if (d?.time_of_day) {
    parts.push(formatDisplayName(String(d.time_of_day)));
  }

  return parts.length > 0 ? parts.join(' · ') : 'Level up';
}

function mapChainNode(rawNode: any): { node: EvolutionNode; hasBranching: boolean } {
  const speciesSlug = String(rawNode?.species?.name ?? 'unknown');
  const speciesId = extractIdFromUrl(rawNode?.species?.url) ?? 0;
  const childrenRaw = Array.isArray(rawNode?.evolves_to) ? rawNode.evolves_to : [];

  let hasBranching = childrenRaw.length > 1;
  const evolvesTo: EvolutionNode[] = [];

  for (const childRaw of childrenRaw) {
    const mappedChild = mapChainNode(childRaw);
    if (mappedChild.hasBranching) {
      hasBranching = true;
    }
    evolvesTo.push(mappedChild.node);
  }

  return {
    hasBranching,
    node: {
      speciesId,
      dexNumber: formatDexNumber(speciesId),
      slug: speciesSlug,
      name: formatDisplayName(speciesSlug),
      spriteUrl: speciesId > 0 ? officialArtworkUrlForId(speciesId) : null,
      triggerLabel: formatEvolutionTrigger(rawNode?.evolution_details),
      evolvesTo,
    },
  };
}

export function mapRawEvolutionChain(raw: any): EvolutionChain {
  const mapped = mapChainNode(raw?.chain ?? {});
  return {
    id: Number(raw?.id ?? 0),
    root: mapped.node,
    hasBranching: mapped.hasBranching,
  };
}
