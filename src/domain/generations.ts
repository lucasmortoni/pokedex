import type { GenerationId } from './types';

export const TOTAL_SPECIES_COUNT = 1025;

export interface GenerationInfo {
  id: GenerationId;
  label: string;
  roman: string;
  region: string;
  startId: number;
  endId: number;
}

export const GENERATIONS: readonly GenerationInfo[] = [
  { id: 1, label: 'Gen I · Kanto', roman: 'I', region: 'Kanto', startId: 1, endId: 151 },
  { id: 2, label: 'Gen II · Johto', roman: 'II', region: 'Johto', startId: 152, endId: 251 },
  { id: 3, label: 'Gen III · Hoenn', roman: 'III', region: 'Hoenn', startId: 252, endId: 386 },
  { id: 4, label: 'Gen IV · Sinnoh', roman: 'IV', region: 'Sinnoh', startId: 387, endId: 493 },
  { id: 5, label: 'Gen V · Unova', roman: 'V', region: 'Unova', startId: 494, endId: 649 },
  { id: 6, label: 'Gen VI · Kalos', roman: 'VI', region: 'Kalos', startId: 650, endId: 721 },
  { id: 7, label: 'Gen VII · Alola', roman: 'VII', region: 'Alola', startId: 722, endId: 809 },
  { id: 8, label: 'Gen VIII · Galar', roman: 'VIII', region: 'Galar', startId: 810, endId: 905 },
  { id: 9, label: 'Gen IX · Paldea', roman: 'IX', region: 'Paldea', startId: 906, endId: 1025 },
];

export function formatDexNumber(id: number): string {
  const safeId = Number.isInteger(id) && id > 0 ? id : 0;
  return `#${String(safeId).padStart(4, '0')}`;
}

export function getGenerationForId(id: number): GenerationInfo {
  for (const gen of GENERATIONS) {
    if (id >= gen.startId && id <= gen.endId) {
      return gen;
    }
  }
  return GENERATIONS[GENERATIONS.length - 1]!;
}
