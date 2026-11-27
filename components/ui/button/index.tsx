import React from 'react';
import { Pressable, Text, type PressableProps, type TextProps } from 'react-native';
import { tva } from '@gluestack-ui/nativewind-utils/tva';

const buttonStyle = tva({
  base: 'min-h-[44px] min-w-[44px] flex-row items-center justify-center rounded-xl px-4 py-2.5',
  variants: {
    variant: {
      solid: 'bg-red-600 active:bg-red-700',
      outline: 'border border-slate-300 bg-white active:bg-slate-100',
      ghost: 'bg-transparent active:bg-slate-100',
    },
    isDisabled: {
      true: 'opacity-50',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'solid',
    isDisabled: false,
  },
});

const buttonTextStyle = tva({
  base: 'text-sm font-semibold text-center',
  variants: {
    variant: {
      solid: 'text-white',
      outline: 'text-slate-900',
      ghost: 'text-slate-700',
    },
  },
  defaultVariants: {
    variant: 'solid',
  },
});

export interface ButtonProps extends PressableProps {
  variant?: 'solid' | 'outline' | 'ghost';
  isDisabled?: boolean;
}

export function Button({
  variant = 'solid',
  isDisabled = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const effectiveDisabled = Boolean(disabled || isDisabled);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: effectiveDisabled }}
      disabled={effectiveDisabled}
      className={buttonStyle({ variant, isDisabled: effectiveDisabled, class: className })}
      {...props}
    >
      {children}
    </Pressable>
  );
}

export interface ButtonTextProps extends TextProps {
  variant?: 'solid' | 'outline' | 'ghost';
}

export function ButtonText({
  variant = 'solid',
  className = '',
  children,
  ...props
}: ButtonTextProps) {
  return (
    <Text className={buttonTextStyle({ variant, class: className })} {...props}>
      {children}
    </Text>
  );
}
