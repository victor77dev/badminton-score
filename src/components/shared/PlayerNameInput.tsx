import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { useColorScheme } from '#/hooks/use-color-scheme';

export type PlayerNameInputProps = TextInputProps & {
  label: string;
  errorMessage?: string;
};

export function PlayerNameInput({ label, errorMessage, style, ...textInputProps }: PlayerNameInputProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const labelColor = colorScheme === 'light' ? '#1f2937' : '#e5e7eb';
  const borderColor = colorScheme === 'light' ? '#cbd5f5' : '#334155';
  const backgroundColor = colorScheme === 'light' ? '#ffffff' : '#0f172a';
  const errorColor = '#ef4444';

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      <TextInput
        placeholderTextColor={colorScheme === 'light' ? '#94a3b8' : '#64748b'}
        style={[styles.input, { borderColor, backgroundColor, color: labelColor }, style]}
        {...textInputProps}
      />
      {Boolean(errorMessage) && <Text style={[styles.error, { color: errorColor }]}>{errorMessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  error: {
    marginTop: 6,
    fontSize: 12,
  },
});
