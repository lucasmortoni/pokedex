import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { CheckCircle2, Circle, Heart } from 'lucide-react-native';
import type { PokemonSummary } from '@/src/domain/types';
import { getTypeToken } from '@/src/theme/pokemon-types';
import { TypeBadge } from './TypeBadge';

export interface PokemonCardProps {
  pokemon: PokemonSummary;
  isCaught: boolean;
  isFavorite: boolean;
  onPress: (pokemon: PokemonSummary) => void;
  onToggleCaught: (speciesId: number) => void;
  onToggleFavorite: (speciesId: number) => void;
}

function PokemonCardBase({
  pokemon,
  isCaught,
  isFavorite,
  onPress,
  onToggleCaught,
  onToggleFavorite,
}: PokemonCardProps) {
  const primaryType = pokemon.types[0];
  const token = getTypeToken(primaryType);
  const typeNames = pokemon.types.map((t) => getTypeToken(t).label).join(' and ');

  return (
    <Pressable
      testID={`pokemon-card-${pokemon.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${pokemon.dexNumber} ${pokemon.name}, ${typeNames} type${
        isCaught ? ', Caught' : ''
      }${isFavorite ? ', Favorite' : ''}`}
      onPress={() => onPress(pokemon)}
      style={{
        backgroundColor: token.cardTint,
        borderColor: token.border,
      }}
      className="relative mb-3 min-h-[188px] flex-1 overflow-hidden rounded-3xl border p-3"
    >
      {/* Subtle Pokéball watermark silhouette */}
      <View
        pointerEvents="none"
        className="absolute -bottom-5 -right-5 h-24 w-24 rounded-full border-8 border-slate-900/5"
      />

      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-extrabold tracking-wide text-slate-700">
          {pokemon.dexNumber}
        </Text>

        <View className="flex-row items-center">
          <Pressable
            testID={`card-caught-${pokemon.id}`}
            accessibilityRole="button"
            accessibilityLabel={
              isCaught ? `Unmark ${pokemon.name} as caught` : `Mark ${pokemon.name} as caught`
            }
            accessibilityState={{ selected: isCaught }}
            hitSlop={4}
            onPress={(e) => {
              e?.stopPropagation?.();
              onToggleCaught(pokemon.id);
            }}
            className="min-h-[44px] min-w-[44px] items-center justify-center rounded-full"
          >
            {isCaught ? (
              <CheckCircle2 size={20} color="#15803D" />
            ) : (
              <Circle size={20} color="#64748B" />
            )}
          </Pressable>

          <Pressable
            testID={`card-favorite-${pokemon.id}`}
            accessibilityRole="button"
            accessibilityLabel={
              isFavorite
                ? `Remove ${pokemon.name} from favorites`
                : `Add ${pokemon.name} to favorites`
            }
            accessibilityState={{ selected: isFavorite }}
            hitSlop={4}
            onPress={(e) => {
              e?.stopPropagation?.();
              onToggleFavorite(pokemon.id);
            }}
            className="min-h-[44px] min-w-[44px] items-center justify-center rounded-full"
          >
            <Heart
              size={20}
              color={isFavorite ? '#DC2626' : '#64748B'}
              fill={isFavorite ? '#DC2626' : 'none'}
            />
          </Pressable>
        </View>
      </View>

      <Text
        numberOfLines={2}
        className="mb-1.5 text-base font-bold text-slate-900"
      >
        {pokemon.name}
      </Text>

      <View className="mb-2 flex-row flex-wrap gap-1.5">
        {pokemon.types.map((t) => (
          <TypeBadge key={t} type={t} size="sm" />
        ))}
      </View>

      <View className="mt-auto items-center justify-center pt-1">
        {pokemon.spriteUrl ? (
          <Image
            source={{ uri: pokemon.spriteUrl }}
            cachePolicy="memory-disk"
            contentFit="contain"
            accessibilityLabel={`${pokemon.name} artwork`}
            style={{ width: 88, height: 88 }}
          />
        ) : (
          <View className="h-[88px] w-[88px] items-center justify-center rounded-2xl bg-white/70">
            <Text className="text-xs font-semibold text-slate-500">No Image</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export const PokemonCard = React.memo(PokemonCardBase);
