import { StyleSheet, Text, View } from 'react-native';

import { useColorScheme } from '#/hooks/use-color-scheme';

export type ScoreBoxProps = {
  playerName: string;
  score: number;
  highlight?: boolean;
};

export function ScoreBox({ playerName, score, highlight = false }: ScoreBoxProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const baseBackground = colorScheme === 'light' ? '#f8fafc' : '#1f2937';
  const highlightBackground = colorScheme === 'light' ? '#dbeafe' : '#1e3a8a';
  const nameColor = colorScheme === 'light' ? '#1f2937' : '#e5e7eb';
  const scoreColor = colorScheme === 'light' ? '#0f172a' : '#f8fafc';

  return (
    <View style={[styles.container, { backgroundColor: highlight ? highlightBackground : baseBackground }]}>
      <Text style={[styles.name, { color: nameColor }]} numberOfLines={1}>
        {playerName}
      </Text>
      <Text style={[styles.score, { color: scoreColor }]}>{score}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    minWidth: 140,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
  },
  score: {
    fontSize: 32,
    fontWeight: '700',
  },
});
