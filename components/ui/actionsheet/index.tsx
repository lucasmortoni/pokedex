import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  View,
  type PressableProps,
  type ScrollViewProps,
  type ViewProps,
} from 'react-native';
import { tva } from '@gluestack-ui/nativewind-utils/tva';

const contentStyle = tva({
  base: 'w-full rounded-t-3xl bg-white px-5 pb-6 pt-3 shadow-2xl max-h-[85%]',
});

export interface ActionsheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const ActionsheetContext = React.createContext<{ onClose: () => void }>({
  onClose: () => undefined,
});

export function Actionsheet({ isOpen, onClose, children }: ActionsheetProps) {
  return (
    <ActionsheetContext.Provider value={{ onClose }}>
      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={onClose}
      >
        <View className="flex-1 justify-end">{children}</View>
      </Modal>
    </ActionsheetContext.Provider>
  );
}

export function ActionsheetBackdrop({
  className = '',
  onPress,
  ...props
}: PressableProps) {
  const { onClose } = React.useContext(ActionsheetContext);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Close filter sheet"
      onPress={onPress ?? onClose}
      className={`absolute inset-0 bg-slate-950/50 ${className}`}
      {...props}
    />
  );
}

export function ActionsheetContent({ className = '', children, ...props }: ViewProps) {
  return (
    <View
      accessibilityViewIsModal
      className={contentStyle({ class: className })}
      {...props}
    >
      {children}
    </View>
  );
}

export function ActionsheetDragIndicatorWrapper({
  className = '',
  children,
  ...props
}: ViewProps) {
  return (
    <View className={`w-full items-center py-2 ${className}`} {...props}>
      {children}
    </View>
  );
}

export function ActionsheetDragIndicator({ className = '', ...props }: ViewProps) {
  return (
    <View
      className={`h-1.5 w-12 rounded-full bg-slate-300 ${className}`}
      {...props}
    />
  );
}

export function ActionsheetScrollView({
  className = '',
  children,
  ...props
}: ScrollViewProps) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className={`w-full ${className}`}
      {...props}
    >
      {children}
    </ScrollView>
  );
}
