import type { PokemonTypeName } from '@/src/domain/types';

export interface PokemonTypeColorToken {
  label: string;
  background: string;
  foreground: string;
  cardTint: string;
  border: string;
}

/**
 * WCAG AA (>= 4.5:1 text contrast) palette for all 18 canonical Pokémon types.
 * Lighter elemental shades pair with dark slate ink (#0F172A) while saturated
 * deeper shades pair with crisp white (#FFFFFF).
 */
export const POKEMON_TYPE_TOKENS: Record<PokemonTypeName, PokemonTypeColorToken> = {
  normal: {
    label: 'Normal',
    background: '#5C5F4B',
    foreground: '#FFFFFF',
    cardTint: '#F4F4EE',
    border: '#D6D6C8',
  },
  fire: {
    label: 'Fire',
    background: '#B93D0B',
    foreground: '#FFFFFF',
    cardTint: '#FFF1EB',
    border: '#FED7C7',
  },
  water: {
    label: 'Water',
    background: '#1D5FD6',
    foreground: '#FFFFFF',
    cardTint: '#EEF4FF',
    border: '#C7DBFF',
  },
  electric: {
    label: 'Electric',
    background: '#F5C518',
    foreground: '#0F172A',
    cardTint: '#FEF9E3',
    border: '#FDE68A',
  },
  grass: {
    label: 'Grass',
    background: '#2E7D32',
    foreground: '#FFFFFF',
    cardTint: '#EDF8EE',
    border: '#C3E6C5',
  },
  ice: {
    label: 'Ice',
    background: '#96D9D6',
    foreground: '#0F172A',
    cardTint: '#EEFAFA',
    border: '#BCEAE8',
  },
  fighting: {
    label: 'Fighting',
    background: '#B7261E',
    foreground: '#FFFFFF',
    cardTint: '#FDEEEE',
    border: '#FAC8C5',
  },
  poison: {
    label: 'Poison',
    background: '#8E359B',
    foreground: '#FFFFFF',
    cardTint: '#F9EEF9',
    border: '#E9C5EC',
  },
  ground: {
    label: 'Ground',
    background: '#D9B35B',
    foreground: '#0F172A',
    cardTint: '#FBF6E8',
    border: '#EFE0B9',
  },
  flying: {
    label: 'Flying',
    background: '#5D44CC',
    foreground: '#FFFFFF',
    cardTint: '#F2EFFE',
    border: '#D4CCFB',
  },
  psychic: {
    label: 'Psychic',
    background: '#C41C58',
    foreground: '#FFFFFF',
    cardTint: '#FDECF2',
    border: '#FAC5D8',
  },
  bug: {
    label: 'Bug',
    background: '#5E6E10',
    foreground: '#FFFFFF',
    cardTint: '#F4F6E6',
    border: '#DBE0B4',
  },
  rock: {
    label: 'Rock',
    background: '#73611F',
    foreground: '#FFFFFF',
    cardTint: '#F6F3EA',
    border: '#DFD7BF',
  },
  ghost: {
    label: 'Ghost',
    background: '#644B8A',
    foreground: '#FFFFFF',
    cardTint: '#F3EFF8',
    border: '#D8CBEB',
  },
  dragon: {
    label: 'Dragon',
    background: '#5222E6',
    foreground: '#FFFFFF',
    cardTint: '#F0ECFE',
    border: '#CFC3FC',
  },
  dark: {
    label: 'Dark',
    background: '#4F3D32',
    foreground: '#FFFFFF',
    cardTint: '#F3EFECE6',
    border: '#D6CBC4',
  },
  steel: {
    label: 'Steel',
    background: '#B7B7CE',
    foreground: '#0F172A',
    cardTint: '#F2F3F7',
    border: '#D5D7E4',
  },
  fairy: {
    label: 'Fairy',
    background: '#E8A5C4',
    foreground: '#0F172A',
    cardTint: '#FDF1F7',
    border: '#F6CFE1',
  },
};

export function getTypeToken(type: PokemonTypeName): PokemonTypeColorToken {
  return POKEMON_TYPE_TOKENS[type];
}

function relativeLuminance(hex: string): number {
  const clean = hex.replace('#', '').slice(0, 6);
  const channels = [0, 2, 4].map((offset) => {
    const val = parseInt(clean.slice(offset, offset + 2), 16) / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * (channels[0] ?? 0) + 0.7152 * (channels[1] ?? 0) + 0.0722 * (channels[2] ?? 0);
}

/**
 * Computes WCAG 2.x contrast ratio between two hex colors.
 */
export function getContrastRatio(hexA: string, hexB: string): number {
  const lumA = relativeLuminance(hexA);
  const lumB = relativeLuminance(hexB);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}
