jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(async () => ({ isConnected: true, isInternetReachable: true })),
}));

jest.mock('expo-image', () => {
  const mockReact = require('react');
  const { View, Text } = require('react-native');
  return {
    Image: ({ source, accessibilityLabel, testID, ...props }: any) =>
      mockReact.createElement(
        View,
        {
          testID: testID ?? 'expo-image',
          accessibilityLabel,
          'data-uri': typeof source === 'object' ? source?.uri : String(source),
          ...props,
        },
        accessibilityLabel ? mockReact.createElement(Text, null, accessibilityLabel) : null
      ),
  };
});

jest.mock('react-native-safe-area-context', () => {
  const mockReact = require('react');
  const { View } = require('react-native');
  const insets = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }: any) => mockReact.createElement(View, null, children),
    SafeAreaView: ({ children, ...props }: any) => mockReact.createElement(View, props, children),
    useSafeAreaInsets: () => insets,
  };
});

export const mockRouterPush = jest.fn();
export const mockRouterBack = jest.fn();
export const mockRouterReplace = jest.fn();

jest.mock('expo-router', () => ({
  Stack: Object.assign(
    ({ children }: any) => children ?? null,
    { Screen: () => null }
  ),
  useRouter: () => ({
    push: mockRouterPush,
    back: mockRouterBack,
    replace: mockRouterReplace,
  }),
  useLocalSearchParams: jest.fn(() => ({})),
}));

jest.setTimeout(20000);

beforeEach(() => {
  mockRouterPush.mockClear();
  mockRouterBack.mockClear();
  mockRouterReplace.mockClear();
  globalThis.fetch = jest.fn(() =>
    Promise.reject(new Error('Live network requests are disabled in automated tests'))
  ) as unknown as typeof fetch;
});
