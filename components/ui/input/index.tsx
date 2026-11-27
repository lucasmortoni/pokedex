import React from 'react';
import {
  Pressable,
  TextInput,
  View,
  type PressableProps,
  type TextInputProps,
  type ViewProps,
} from 'react-native';
import { tva } from '@gluestack-ui/nativewind-utils/tva';

const inputStyle = tva({
  base: 'min-h-[48px] flex-row items-center rounded-2xl border border-slate-200 bg-white px-3.5',
});

export function Input({ className = '', children, ...props }: ViewProps) {
  return (
    <View className={inputStyle({ class: className })} {...props}>
      {children}
    </View>
  );
}

export function InputField({ className = '', ...props }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor="#64748B"
      className={`flex-1 py-2.5 text-base text-slate-900 ${className}`}
      {...props}
    />
  );
}

export function InputSlot({ className = '', children, ...props }: PressableProps) {
  return (
    <Pressable
      className={`min-h-[44px] min-w-[44px] items-center justify-center ${className}`}
      {...props}
    >
      {children}
    </Pressable>
  );
}
