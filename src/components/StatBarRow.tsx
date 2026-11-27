import React from 'react';
import { Text, View } from 'react-native';
import { Progress, ProgressFilledTrack } from '@/components/ui/progress';

export const MAX_BASE_STAT = 255;

function getStatTier(value: number): { label: string; colorClass: string } {
  if (value >= 120) return { label: 'Very High', colorClass: 'bg-emerald-600' };
  if (value >= 85) return { label: 'High', colorClass: 'bg-teal-600' };
  if (value >= 55) return { label: 'Average', colorClass: 'bg-amber-500' };
  return { label: 'Low', colorClass: 'bg-rose-500' };
}

export function StatBarRow({ label, value }: { label: string; value: number }) {
  const tier = getStatTier(value);

  return (
    <View
      accessibilityLabel={`${label} base stat ${value} out of ${MAX_BASE_STAT}, ${tier.label}`}
      className="mb-3 flex-row items-center gap-3"
    >
      <Text className="w-16 text-xs font-bold text-slate-600">{label}</Text>
      <Text className="w-10 text-right text-sm font-extrabold text-slate-900">{value}</Text>
      <View className="flex-1">
        <Progress value={value} max={MAX_BASE_STAT}>
          <ProgressFilledTrack className={tier.colorClass} />
        </Progress>
      </View>
      <Text className="w-16 text-right text-[11px] font-semibold text-slate-500">
        {tier.label}
      </Text>
    </View>
  );
}
