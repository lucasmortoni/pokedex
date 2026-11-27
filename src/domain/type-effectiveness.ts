import {
  POKEMON_TYPES,
  type EffectivenessMultiplier,
  type PokemonTypeName,
  type TypeEffectivenessProfile,
} from './types';

/**
 * Canonical 18x18 attacking -> defending elemental type effectiveness multipliers
 * (Gen VI+ standard chart including Steel's removal of Ghost/Dark resistances).
 * Only non-1x entries are listed; all omitted pairs default to 1x.
 */
const TYPE_CHART: Record<PokemonTypeName, Partial<Record<PokemonTypeName, number>>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: {
    fire: 0.5,
    water: 2,
    grass: 0.5,
    poison: 0.5,
    ground: 2,
    flying: 0.5,
    bug: 0.5,
    rock: 2,
    dragon: 0.5,
    steel: 0.5,
  },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: {
    normal: 2,
    ice: 2,
    poison: 0.5,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    rock: 2,
    ghost: 0,
    dark: 2,
    steel: 2,
    fairy: 0.5,
  },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: {
    fire: 0.5,
    grass: 2,
    fighting: 0.5,
    poison: 0.5,
    flying: 0.5,
    psychic: 2,
    ghost: 0.5,
    dark: 2,
    steel: 0.5,
    fairy: 0.5,
  },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

export function getAttackMultiplier(
  attackingType: PokemonTypeName,
  defendingTypes: readonly PokemonTypeName[]
): EffectivenessMultiplier {
  let product = 1;
  for (const defender of defendingTypes) {
    const factor = TYPE_CHART[attackingType]?.[defender] ?? 1;
    product *= factor;
  }
  return product as EffectivenessMultiplier;
}

export function calculateTypeEffectiveness(
  defendingTypes: readonly PokemonTypeName[]
): TypeEffectivenessProfile {
  const uniqueDefenders = Array.from(new Set(defendingTypes)).slice(0, 2);

  const profile: TypeEffectivenessProfile = {
    defendingTypes: uniqueDefenders,
    quadWeaknesses: [],
    weaknesses: [],
    neutral: [],
    resistances: [],
    quadResistances: [],
    immunities: [],
  };

  for (const attacker of POKEMON_TYPES) {
    const multiplier = getAttackMultiplier(attacker, uniqueDefenders);
    if (multiplier === 4) {
      profile.quadWeaknesses.push(attacker);
    } else if (multiplier === 2) {
      profile.weaknesses.push(attacker);
    } else if (multiplier === 0.5) {
      profile.resistances.push(attacker);
    } else if (multiplier === 0.25) {
      profile.quadResistances.push(attacker);
    } else if (multiplier === 0) {
      profile.immunities.push(attacker);
    } else {
      profile.neutral.push(attacker);
    }
  }

  return profile;
}
