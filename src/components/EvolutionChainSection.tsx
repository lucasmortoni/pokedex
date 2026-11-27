import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { ArrowRight } from 'lucide-react-native';
import type { EvolutionChain, EvolutionNode } from '@/src/domain/types';

export interface EvolutionChainSectionProps {
  chain: EvolutionChain;
  currentSpeciesId: number;
  onSelectSpecies: (node: EvolutionNode) => void;
}

function flattenLinearChain(node: EvolutionNode): EvolutionNode[] {
  const list: EvolutionNode[] = [node];
  let cursor = node;
  while (cursor.evolvesTo.length === 1) {
    cursor = cursor.evolvesTo[0]!;
    list.push(cursor);
  }
  return list;
}

function collectBranches(node: EvolutionNode): Array<{ from: EvolutionNode; to: EvolutionNode }> {
  const pairs: Array<{ from: EvolutionNode; to: EvolutionNode }> = [];
  for (const child of node.evolvesTo) {
    pairs.push({ from: node, to: child });
    pairs.push(...collectBranches(child));
  }
  return pairs;
}

function EvolutionStageCard({
  node,
  isCurrent,
  onPress,
}: {
  node: EvolutionNode;
  isCurrent: boolean;
  onPress: (node: EvolutionNode) => void;
}) {
  return (
    <Pressable
      testID={`evo-node-${node.slug}`}
      accessibilityRole="button"
      accessibilityLabel={`${node.dexNumber} ${node.name}${
        isCurrent ? ', currently viewing' : ', tap to view entry'
      }`}
      accessibilityState={{ selected: isCurrent }}
      onPress={() => {
        if (!isCurrent) {
          onPress(node);
        }
      }}
      className={`min-h-[96px] min-w-[92px] items-center rounded-2xl border p-2.5 ${
        isCurrent
          ? 'border-red-500 bg-red-50'
          : 'border-slate-200 bg-slate-50 active:bg-slate-100'
      }`}
    >
      {node.spriteUrl ? (
        <Image
          source={{ uri: node.spriteUrl }}
          cachePolicy="memory-disk"
          contentFit="contain"
          accessibilityLabel={`${node.name} evolution sprite`}
          style={{ width: 52, height: 52 }}
        />
      ) : null}
      <Text className="mt-1 text-[11px] font-bold text-slate-500">{node.dexNumber}</Text>
      <Text className="text-center text-xs font-bold text-slate-900">{node.name}</Text>
    </Pressable>
  );
}

export function EvolutionChainSection({
  chain,
  currentSpeciesId,
  onSelectSpecies,
}: EvolutionChainSectionProps) {
  const isSingleStage = chain.root.evolvesTo.length === 0;

  return (
    <View testID="evolution-chain-section" className="rounded-3xl border border-slate-200 bg-white p-4">
      <Text className="mb-3 text-base font-bold text-slate-900">Evolution Chain</Text>

      {isSingleStage ? (
        <View className="items-center rounded-2xl bg-slate-50 p-4">
          <EvolutionStageCard
            node={chain.root}
            isCurrent={chain.root.speciesId === currentSpeciesId}
            onPress={onSelectSpecies}
          />
          <Text className="mt-2 text-xs font-medium text-slate-600">
            This Pokémon does not evolve.
          </Text>
        </View>
      ) : chain.hasBranching ? (
        <View className="gap-3">
          {collectBranches(chain.root).map(({ from, to }) => (
            <View
              key={`${from.slug}-${to.slug}`}
              className="flex-row items-center justify-between gap-2 rounded-2xl bg-slate-50 p-2.5"
            >
              <View className="flex-1">
                <EvolutionStageCard
                  node={from}
                  isCurrent={from.speciesId === currentSpeciesId}
                  onPress={onSelectSpecies}
                />
              </View>
              <View className="w-24 items-center px-1">
                <ArrowRight size={16} color="#475569" />
                <Text className="mt-1 text-center text-[11px] font-semibold text-slate-700">
                  {to.triggerLabel ?? 'Evolves'}
                </Text>
              </View>
              <View className="flex-1">
                <EvolutionStageCard
                  node={to}
                  isCurrent={to.speciesId === currentSpeciesId}
                  onPress={onSelectSpecies}
                />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row items-center gap-2">
            {flattenLinearChain(chain.root).map((node, idx) => (
              <React.Fragment key={node.slug}>
                {idx > 0 ? (
                  <View className="items-center px-1">
                    <ArrowRight size={16} color="#475569" />
                    <Text className="mt-1 max-w-[76px] text-center text-[11px] font-semibold text-slate-700">
                      {node.triggerLabel ?? 'Evolves'}
                    </Text>
                  </View>
                ) : null}
                <EvolutionStageCard
                  node={node}
                  isCurrent={node.speciesId === currentSpeciesId}
                  onPress={onSelectSpecies}
                />
              </React.Fragment>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
