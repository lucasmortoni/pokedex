import React from 'react';
import { TOTAL_SPECIES_COUNT } from '@/src/domain/generations';
import type { CollectionRecord } from '@/src/domain/types';
import {
  AsyncStorageCollectionAdapter,
  emptyCollectionRecord,
  type CollectionStorageAdapter,
} from '@/src/storage/collection-storage';

export interface CollectionContextValue {
  caughtIds: number[];
  favoriteIds: number[];
  caughtSet: ReadonlySet<number>;
  favoriteSet: ReadonlySet<number>;
  caughtCount: number;
  totalCount: number;
  isLoaded: boolean;
  storageError: string | null;
  isCaught: (speciesId: number) => boolean;
  isFavorite: (speciesId: number) => boolean;
  toggleCaught: (speciesId: number) => Promise<void>;
  toggleFavorite: (speciesId: number) => Promise<void>;
}

const CollectionContext = React.createContext<CollectionContextValue | null>(null);

const defaultAdapter = new AsyncStorageCollectionAdapter();

function toggleInSortedIds(ids: number[], targetId: number): number[] {
  const set = new Set(ids);
  if (set.has(targetId)) {
    set.delete(targetId);
  } else {
    set.add(targetId);
  }
  return Array.from(set).sort((a, b) => a - b);
}

export function CollectionProvider({
  adapter = defaultAdapter,
  children,
}: {
  adapter?: CollectionStorageAdapter;
  children: React.ReactNode;
}) {
  const [record, setRecord] = React.useState<CollectionRecord>(() => emptyCollectionRecord());
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [storageError, setStorageError] = React.useState<string | null>(null);
  const recordRef = React.useRef(record);
  recordRef.current = record;

  React.useEffect(() => {
    let active = true;
    adapter.load().then((loaded) => {
      if (!active) return;
      recordRef.current = loaded;
      setRecord(loaded);
      setIsLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [adapter]);

  const persistUpdate = React.useCallback(
    async (next: CollectionRecord) => {
      recordRef.current = next;
      setRecord(next);
      setStorageError(null);
      try {
        await adapter.save(next);
      } catch {
        setStorageError('Unable to save collection changes locally.');
      }
    },
    [adapter]
  );

  const toggleCaught = React.useCallback(
    async (speciesId: number) => {
      if (!Number.isInteger(speciesId) || speciesId < 1 || speciesId > TOTAL_SPECIES_COUNT) {
        return;
      }
      const current = recordRef.current;
      await persistUpdate({
        ...current,
        caughtIds: toggleInSortedIds(current.caughtIds, speciesId),
      });
    },
    [persistUpdate]
  );

  const toggleFavorite = React.useCallback(
    async (speciesId: number) => {
      if (!Number.isInteger(speciesId) || speciesId < 1 || speciesId > TOTAL_SPECIES_COUNT) {
        return;
      }
      const current = recordRef.current;
      await persistUpdate({
        ...current,
        favoriteIds: toggleInSortedIds(current.favoriteIds, speciesId),
      });
    },
    [persistUpdate]
  );

  const caughtSet = React.useMemo(() => new Set(record.caughtIds), [record.caughtIds]);
  const favoriteSet = React.useMemo(() => new Set(record.favoriteIds), [record.favoriteIds]);

  const value = React.useMemo<CollectionContextValue>(
    () => ({
      caughtIds: record.caughtIds,
      favoriteIds: record.favoriteIds,
      caughtSet,
      favoriteSet,
      caughtCount: record.caughtIds.length,
      totalCount: TOTAL_SPECIES_COUNT,
      isLoaded,
      storageError,
      isCaught: (id: number) => caughtSet.has(id),
      isFavorite: (id: number) => favoriteSet.has(id),
      toggleCaught,
      toggleFavorite,
    }),
    [record, caughtSet, favoriteSet, isLoaded, storageError, toggleCaught, toggleFavorite]
  );

  return React.createElement(CollectionContext.Provider, { value }, children);
}

export function useCollection(): CollectionContextValue {
  const ctx = React.useContext(CollectionContext);
  if (!ctx) {
    throw new Error('useCollection must be used within a CollectionProvider.');
  }
  return ctx;
}
