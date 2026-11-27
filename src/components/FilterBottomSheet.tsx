import React from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetScrollView,
} from '@/components/ui/actionsheet';
import { Button, ButtonText } from '@/components/ui/button';
import { GENERATIONS } from '@/src/domain/generations';
import {
  POKEMON_TYPES,
  type GenerationId,
  type PokemonTypeName,
} from '@/src/domain/types';
import { getTypeToken } from '@/src/theme/pokemon-types';

export interface FilterBottomSheetProps {
  isOpen: boolean;
  appliedTypes: PokemonTypeName[];
  appliedGeneration: GenerationId | null;
  onClose: () => void;
  onApply: (next: {
    selectedTypes: PokemonTypeName[];
    selectedGeneration: GenerationId | null;
  }) => void;
}

export function FilterBottomSheet({
  isOpen,
  appliedTypes,
  appliedGeneration,
  onClose,
  onApply,
}: FilterBottomSheetProps) {
  const [draftTypes, setDraftTypes] = React.useState<PokemonTypeName[]>(appliedTypes);
  const [draftGeneration, setDraftGeneration] = React.useState<GenerationId | null>(
    appliedGeneration
  );

  React.useEffect(() => {
    if (isOpen) {
      setDraftTypes(appliedTypes);
      setDraftGeneration(appliedGeneration);
    }
  }, [isOpen, appliedTypes, appliedGeneration]);

  const toggleType = (type: PokemonTypeName) => {
    setDraftTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((item) => item !== type);
      }
      // FIFO cap at 2 elemental types for dual-type filtering
      if (prev.length >= 2) {
        return [prev[1]!, type];
      }
      return [...prev, type];
    });
  };

  const toggleGeneration = (genId: GenerationId) => {
    setDraftGeneration((prev) => (prev === genId ? null : genId));
  };

  const handleResetDraft = () => {
    setDraftTypes([]);
    setDraftGeneration(null);
  };

  const activeDraftCount = draftTypes.length + (draftGeneration !== null ? 1 : 0);

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent testID="filter-bottom-sheet">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-slate-900">Filters</Text>
          <Text className="text-xs font-medium text-slate-500">
            Up to 2 types · 1 region
          </Text>
        </View>

        <ActionsheetScrollView className="mb-4">
          <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">
            Elemental Type
          </Text>
          <View className="mb-5 flex-row flex-wrap gap-2">
            {POKEMON_TYPES.map((type) => {
              const selected = draftTypes.includes(type);
              const token = getTypeToken(type);
              return (
                <Pressable
                  key={type}
                  testID={`filter-type-${type}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter by ${token.label} type`}
                  accessibilityState={{ selected }}
                  onPress={() => toggleType(type)}
                  style={{
                    backgroundColor: selected ? token.background : '#F8FAFC',
                    borderColor: selected ? token.background : '#CBD5E1',
                  }}
                  className="min-h-[44px] flex-row items-center rounded-full border px-3.5 py-2"
                >
                  <Text
                    style={{ color: selected ? token.foreground : '#1E293B' }}
                    className="text-xs font-bold"
                  >
                    {selected ? `✓ ${token.label}` : token.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">
            Generation & Region
          </Text>
          <View className="mb-2 flex-row flex-wrap gap-2">
            {GENERATIONS.map((gen) => {
              const selected = draftGeneration === gen.id;
              return (
                <Pressable
                  key={gen.id}
                  testID={`filter-gen-${gen.id}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter by ${gen.label}`}
                  accessibilityState={{ selected }}
                  onPress={() => toggleGeneration(gen.id)}
                  className={`min-h-[44px] flex-row items-center rounded-full border px-3.5 py-2 ${
                    selected
                      ? 'border-slate-900 bg-slate-900'
                      : 'border-slate-300 bg-slate-50'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      selected ? 'text-white' : 'text-slate-800'
                    }`}
                  >
                    {selected ? `✓ ${gen.label}` : gen.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ActionsheetScrollView>

        <View className="flex-row gap-3 border-t border-slate-200 pt-3">
          <Button
            testID="filter-reset-button"
            variant="outline"
            onPress={handleResetDraft}
            accessibilityLabel="Reset draft filters"
            className="flex-1"
          >
            <ButtonText variant="outline">Reset All</ButtonText>
          </Button>
          <Button
            testID="filter-apply-button"
            onPress={() => {
              onApply({
                selectedTypes: draftTypes,
                selectedGeneration: draftGeneration,
              });
              onClose();
            }}
            accessibilityLabel={
              activeDraftCount > 0 ? `Apply ${activeDraftCount} filters` : 'Apply filters'
            }
            className="flex-1"
          >
            <ButtonText>
              {activeDraftCount > 0 ? `Apply (${activeDraftCount})` : 'Apply'}
            </ButtonText>
          </Button>
        </View>
      </ActionsheetContent>
    </Actionsheet>
  );
}
