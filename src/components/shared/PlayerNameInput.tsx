import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { useColorScheme } from '#/hooks/use-color-scheme';

export type PlayerNameInputProps = TextInputProps & {
  label: string;
  errorMessage?: string;
};

export function PlayerNameInput({ label, errorMessage, style, ...textInputProps }: PlayerNameInputProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const labelColor = colorScheme === 'light' ? '#1f2937' : '#e5e7eb';
  const inputTextColor = colorScheme === 'light' ? '#0f172a' : '#f8fafc';
  const borderColor = colorScheme === 'light' ? '#cbd5f5' : '#334155';
  const backgroundColor = colorScheme === 'light' ? '#ffffff' : '#0f172a';
  const errorColor = '#ef4444';
  const computedBorderColor = errorMessage ? errorColor : borderColor;
  const placeholderColor = colorScheme === 'light' ? '#94a3b8' : '#64748b';

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      <TextInput
        placeholderTextColor={placeholderColor}
        style={[
          styles.input,
          { borderColor: computedBorderColor, backgroundColor, color: inputTextColor },
          style,
        ]}
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
