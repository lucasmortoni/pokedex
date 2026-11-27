import React from 'react';
import { View, type ViewProps } from 'react-native';

export interface ProgressProps extends ViewProps {
  value: number;
  max?: number;
}

export function Progress({
  value,
  max = 100,
  className = '',
  children,
  ...props
}: ProgressProps) {
  const safeMax = max > 0 ? max : 100;
  const clampedPct = Math.max(0, Math.min(100, (value / safeMax) * 100));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: safeMax, now: Math.round(value) }}
      className={`h-2.5 w-full overflow-hidden rounded-full bg-slate-200 ${className}`}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement<{ widthPercent?: number }>(child)) {
          return React.cloneElement(child, { widthPercent: clampedPct });
        }
        return child;
      })}
    </View>
  );
}

export interface ProgressFilledTrackProps extends ViewProps {
  widthPercent?: number;
}

export function ProgressFilledTrack({
  widthPercent = 0,
  className = '',
  style,
  ...props
}: ProgressFilledTrackProps) {
  return (
    <View
      className={`h-full rounded-full bg-emerald-600 ${className}`}
      style={[{ width: `${widthPercent}%` }, style]}
      {...props}
    />
  );
}
