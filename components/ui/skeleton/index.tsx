import React from 'react';
import { View, type ViewProps } from 'react-native';

export function Skeleton({ className = '', ...props }: ViewProps) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={`rounded-2xl bg-slate-200 ${className}`}
      {...props}
    />
  );
}
