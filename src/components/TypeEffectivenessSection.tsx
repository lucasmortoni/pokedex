import React from 'react';
import { Text, View } from 'react-native';
import type { PokemonTypeName, TypeEffectivenessProfile } from '@/src/domain/types';
import { TypeBadge } from './TypeBadge';

interface MatchupRow {
  label: string;
  types: PokemonTypeName[];
}

export function TypeEffectivenessSection({
  profile,
}: {
  profile: TypeEffectivenessProfile;
}) {
  const rows: MatchupRow[] = [
    { label: '4× Weaknesses', types: profile.quadWeaknesses },
    { label: '2× Weaknesses', types: profile.weaknesses },
    { label: '0.5× Resistances', types: profile.resistances },
    { label: '0.25× Resistances', types: profile.quadResistances },
    { label: '0× Immunities', types: profile.immunities },
  ].filter((row) => row.types.length > 0);

  return (
    <View testID="type-effectiveness-section" className="rounded-3xl border border-slate-200 bg-white p-4">
      <Text className="mb-3 text-base font-bold text-slate-900">
        Defensive Type Effectiveness
      </Text>
      {rows.map((row) => (
        <View key={row.label} className="mb-3 last:mb-0">
          <Text className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-600">
            {row.label}
          </Text>
          <View className="flex-row flex-wrap gap-1.5">
            {row.types.map((t) => (
              <TypeBadge key={`${row.label}-${t}`} type={t} size="sm" />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}
