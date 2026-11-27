import React from 'react';
import { Text, View, type TextProps, type ViewProps } from 'react-native';
import { tva } from '@gluestack-ui/nativewind-utils/tva';

const badgeStyle = tva({
  base: 'flex-row items-center rounded-full px-2.5 py-1',
  variants: {
    variant: {
      solid: 'bg-slate-800',
      outline: 'border border-slate-300 bg-white',
      subtle: 'bg-slate-100',
    },
  },
  defaultVariants: {
    variant: 'solid',
  },
});

const badgeTextStyle = tva({
  base: 'text-xs font-bold uppercase tracking-wide',
  variants: {
    variant: {
      solid: 'text-white',
      outline: 'text-slate-700',
      subtle: 'text-slate-800',
    },
  },
  defaultVariants: {
    variant: 'solid',
  },
});

export interface BadgeProps extends ViewProps {
  variant?: 'solid' | 'outline' | 'subtle';
}

export function Badge({
  variant = 'solid',
  className = '',
  children,
  ...props
}: BadgeProps) {
  return (
    <View className={badgeStyle({ variant, class: className })} {...props}>
      {children}
    </View>
  );
}

export interface BadgeTextProps extends TextProps {
  variant?: 'solid' | 'outline' | 'subtle';
}

export function BadgeText({
  variant = 'solid',
  className = '',
  children,
  ...props
}: BadgeTextProps) {
  return (
    <Text className={badgeTextStyle({ variant, class: className })} {...props}>
      {children}
    </Text>
  );
}
