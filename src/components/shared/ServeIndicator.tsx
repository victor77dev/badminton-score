import { StyleSheet, View } from 'react-native';

import { useColorScheme } from '#/hooks/use-color-scheme';

export type ServeIndicatorProps = {
  active?: boolean;
};

export function ServeIndicator({ active = false }: ServeIndicatorProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const activeColor = colorScheme === 'light' ? '#22c55e' : '#4ade80';
  const inactiveColor = colorScheme === 'light' ? '#cbd5f5' : '#1f2937';
  const borderColor = colorScheme === 'light' ? '#e2e8f0' : '#334155';

  return (
    <View
      style={[
        styles.indicator,
        { backgroundColor: active ? activeColor : inactiveColor, borderColor },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  indicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
});
