import React from 'react';
import { Badge, BadgeText } from '@/components/ui/badge';
import type { PokemonTypeName } from '@/src/domain/types';
import { getTypeToken } from '@/src/theme/pokemon-types';

export interface TypeBadgeProps {
  type: PokemonTypeName;
  size?: 'sm' | 'md';
}

export function TypeBadge({ type, size = 'sm' }: TypeBadgeProps) {
  const token = getTypeToken(type);
  return (
    <Badge
      accessibilityLabel={`Type ${token.label}`}
      style={{ backgroundColor: token.background }}
      className={size === 'sm' ? 'px-2.5 py-0.5' : 'px-3.5 py-1'}
    >
      <BadgeText
        style={{ color: token.foreground }}
        className={size === 'sm' ? 'text-[11px]' : 'text-xs'}
      >
        {token.label}
      </BadgeText>
    </Badge>
  );
}
