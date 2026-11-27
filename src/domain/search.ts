import type {
  CatalogFilterState,
  PokemonCatalogIndexItem,
} from './types';

export function normalizeSearchText(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/♀/g, ' f ')
    .replace(/♂/g, ' m ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export type ParsedSearchQuery =
  | { kind: 'empty' }
  | { kind: 'dexId'; id: number }
  | { kind: 'text'; normalized: string };

export function parseSearchQuery(rawQuery: string): ParsedSearchQuery {
  const trimmed = rawQuery.trim();
  if (!trimmed) {
    return { kind: 'empty' };
  }

  const numericMatch = trimmed.match(/^#?0*(\d+)$/);
  if (numericMatch && numericMatch[1]) {
    const id = Number.parseInt(numericMatch[1], 10);
    return { kind: 'dexId', id };
  }

  // Handle #0000 specifically when all digits are zero
  if (/^#?0+$/.test(trimmed)) {
    return { kind: 'dexId', id: 0 };
  }

  const normalized = normalizeSearchText(trimmed);
  if (!normalized) {
    return { kind: 'text', normalized: trimmed.toLowerCase() };
  }
  return { kind: 'text', normalized };
}

export function matchesSearchQuery(
  item: PokemonCatalogIndexItem,
  parsed: ParsedSearchQuery
): boolean {
  if (parsed.kind === 'empty') return true;
  if (parsed.kind === 'dexId') {
    return item.id === parsed.id;
  }

  const normalizedName = normalizeSearchText(item.name);
  const normalizedSlug = normalizeSearchText(item.slug);
  return (
    normalizedName.includes(parsed.normalized) ||
    normalizedSlug.includes(parsed.normalized)
  );
}

export interface FilterCatalogOptions {
  index: PokemonCatalogIndexItem[];
  filters: CatalogFilterState;
  caughtSet: ReadonlySet<number>;
  favoriteSet: ReadonlySet<number>;
  typeIdSets?: ReadonlySet<number>[];
}

export function filterCatalogIndex({
  index,
  filters,
  caughtSet,
  favoriteSet,
  typeIdSets = [],
}: FilterCatalogOptions): PokemonCatalogIndexItem[] {
  const parsedQuery = parseSearchQuery(filters.searchQuery);

  return index.filter((item) => {
    if (filters.selectedGeneration !== null && item.generation !== filters.selectedGeneration) {
      return false;
    }

    if (filters.collectionStatus === 'caught' && !caughtSet.has(item.id)) {
      return false;
    }
    if (filters.collectionStatus === 'favorites' && !favoriteSet.has(item.id)) {
      return false;
    }

    for (const typeSet of typeIdSets) {
      if (!typeSet.has(item.id)) {
        return false;
      }
    }

    if (!matchesSearchQuery(item, parsedQuery)) {
      return false;
    }

    return true;
  });
}
