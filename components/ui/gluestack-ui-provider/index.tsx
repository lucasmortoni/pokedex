import React from 'react';
import { View, type ViewProps } from 'react-native';

export interface GluestackUIProviderProps extends ViewProps {
  mode?: 'light' | 'dark';
  children: React.ReactNode;
}

export function GluestackUIProvider({
  mode = 'light',
  className = '',
  children,
  ...props
}: GluestackUIProviderProps) {
  return (
    <View
      className={`flex-1 ${mode === 'dark' ? 'dark bg-slate-950' : 'bg-slate-50'} ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}
