import { calculateTypeEffectiveness, getAttackMultiplier } from '@/src/domain/type-effectiveness';

describe('Canonical 18x18 defensive type effectiveness', () => {
  it('calculates single-type weaknesses, resistances, and immunities', () => {
    const electric = calculateTypeEffectiveness(['electric']);
    expect(electric.weaknesses).toEqual(['ground']);
    expect(electric.resistances).toEqual(['electric', 'flying', 'steel']);
    expect(electric.immunities).toEqual([]);
    expect(electric.quadWeaknesses).toEqual([]);
  });

  it('calculates dual-type 4x weaknesses, 0.25x resistances, and 0x immunities', () => {
    // Charizard (Fire / Flying): 4x Rock; 0x Ground; 0.25x Grass, Bug
    const charizard = calculateTypeEffectiveness(['fire', 'flying']);
    expect(charizard.quadWeaknesses).toEqual(['rock']);
    expect(charizard.weaknesses).toEqual(['water', 'electric']);
    expect(charizard.immunities).toEqual(['ground']);
    expect(charizard.quadResistances).toEqual(['grass', 'bug']);

    // Swampert (Water / Ground): 4x Grass; 0x Electric
    const swampert = calculateTypeEffectiveness(['water', 'ground']);
    expect(swampert.quadWeaknesses).toEqual(['grass']);
    expect(swampert.weaknesses).toEqual([]);
    expect(swampert.immunities).toEqual(['electric']);
  });

  it('recalculates accurately for regional and Mega alternate forms', () => {
    // Alolan Raichu (Electric / Psychic)
    const alolanRaichu = calculateTypeEffectiveness(['electric', 'psychic']);
    expect(alolanRaichu.weaknesses).toEqual(['ground', 'bug', 'ghost', 'dark']);
    expect(getAttackMultiplier('fighting', ['electric', 'psychic'])).toBe(0.5);

    // Mega Charizard X (Fire / Dragon)
    const megaX = calculateTypeEffectiveness(['fire', 'dragon']);
    expect(megaX.quadResistances).toEqual(['fire', 'grass']);
    expect(megaX.weaknesses).toEqual(['ground', 'rock', 'dragon']);
    expect(getAttackMultiplier('fairy', ['fire', 'dragon'])).toBe(1);
  });
});
