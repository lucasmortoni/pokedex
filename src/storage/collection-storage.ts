import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOTAL_SPECIES_COUNT } from '@/src/domain/generations';
import type { CollectionRecord } from '@/src/domain/types';

export const COLLECTION_STORAGE_KEY = 'pokedex:collection:v1';

export interface CollectionStorageAdapter {
  load(): Promise<CollectionRecord>;
  save(record: CollectionRecord): Promise<void>;
  clear(): Promise<void>;
}

function sanitizeIdList(input: unknown): number[] {
  if (!Array.isArray(input)) return [];
  const valid = new Set<number>();
  for (const item of input) {
    if (typeof item === 'number' && Number.isInteger(item) && item >= 1 && item <= TOTAL_SPECIES_COUNT) {
      valid.add(item);
    }
  }
  return Array.from(valid).sort((a, b) => a - b);
}

export function emptyCollectionRecord(): CollectionRecord {
  return {
    version: 1,
    caughtIds: [],
    favoriteIds: [],
  };
}

export function normalizeCollectionRecord(raw: unknown): CollectionRecord {
  if (!raw || typeof raw !== 'object') {
    return emptyCollectionRecord();
  }
  const obj = raw as Record<string, unknown>;
  if (obj.version !== 1) {
    return emptyCollectionRecord();
  }
  return {
    version: 1,
    caughtIds: sanitizeIdList(obj.caughtIds),
    favoriteIds: sanitizeIdList(obj.favoriteIds),
  };
}

export class AsyncStorageCollectionAdapter implements CollectionStorageAdapter {
  constructor(private readonly storageKey = COLLECTION_STORAGE_KEY) {}

  async load(): Promise<CollectionRecord> {
    try {
      const serialized = await AsyncStorage.getItem(this.storageKey);
      if (!serialized) return emptyCollectionRecord();
      const parsed: unknown = JSON.parse(serialized);
      return normalizeCollectionRecord(parsed);
    } catch {
      return emptyCollectionRecord();
    }
  }

  async save(record: CollectionRecord): Promise<void> {
    const normalized = normalizeCollectionRecord(record);
    await AsyncStorage.setItem(this.storageKey, JSON.stringify(normalized));
  }

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(this.storageKey);
  }
}

export class InMemoryCollectionStorageAdapter implements CollectionStorageAdapter {
  private record: CollectionRecord;

  constructor(initial?: Partial<CollectionRecord>) {
    this.record = normalizeCollectionRecord({
      version: 1,
      caughtIds: initial?.caughtIds ?? [],
      favoriteIds: initial?.favoriteIds ?? [],
    });
  }

  async load(): Promise<CollectionRecord> {
    return {
      version: 1,
      caughtIds: [...this.record.caughtIds],
      favoriteIds: [...this.record.favoriteIds],
    };
  }

  async save(record: CollectionRecord): Promise<void> {
    this.record = normalizeCollectionRecord(record);
  }

  async clear(): Promise<void> {
    this.record = emptyCollectionRecord();
  }
}
