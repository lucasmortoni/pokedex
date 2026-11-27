# Contract: Local Collection Storage Adapter

**Scope**: `src/storage/collection-storage.ts`, `src/hooks/use-collection.ts`

## 1. Storage Adapter Interface

Collection state (`Caught` and `Favorite` base National Dex species IDs) is decoupled from UI and query caches behind a minimal async interface so `AsyncStorage` can be swapped for MMKV or SQLite without touching domain or UI code.

```ts
export interface CollectionRecord {
  version: 1;
  caughtIds: number[];
  favoriteIds: number[];
}

export interface CollectionStorageAdapter {
  load(): Promise<CollectionRecord>;
  save(record: CollectionRecord): Promise<void>;
  clear(): Promise<void>;
}
```

## 2. Persistence Envelope & Key

- **AsyncStorage Key**: `pokedex:collection:v1`
- **Serialized JSON Format**:
  ```json
  {
    "version": 1,
    "caughtIds": [1, 25, 133],
    "favoriteIds": [25]
  }
  ```

## 3. Behavioral & Fault-Tolerance Guarantees

1. **Corrupted or Missing Data**: If storage returns `null`, invalid JSON, wrong schema version, or non-array fields, `load()` MUST recover safely by returning `{ version: 1, caughtIds: [], favoriteIds: [] }` rather than throwing or crashing on startup (`FR-013`).
2. **Sanitization on Read & Write**: Filter both arrays to unique integer IDs within `1..1025`, sorted ascending (`normalizeCollectionRecord`).
3. **Species-Level Semantics (`Q4`)**: IDs always represent base National Dex species IDs (`1..1025`), shared across regional, Mega, and Gigantamax forms.
4. **Isolation from Query Cache**: `CollectionStorageAdapter` uses its own storage key (`pokedex:collection:v1`), completely separate from TanStack Query's cache key (`pokedex:query-cache:v1`), so cache clearing or `buster` upgrades never affect Caught or Favorite records.
5. **Test Double**: Provide `InMemoryCollectionStorageAdapter` for deterministic Jest unit and component tests without mocking native AsyncStorage internals repeatedly.
