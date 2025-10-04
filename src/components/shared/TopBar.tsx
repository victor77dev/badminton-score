import { StyleSheet, Text, View } from 'react-native';

import { useColorScheme } from '#/hooks/use-color-scheme';

export type TopBarProps = {
  matchTitle?: string;
  matchType: 'Singles' | 'Doubles';
  currentGame: number;
  totalGames: number;
  venueName?: string;
};

export function TopBar({
  matchTitle = 'Friendly Match',
  matchType,
  currentGame,
  totalGames,
  venueName,
}: TopBarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = colorScheme === 'light' ? '#0f172a' : '#020617';
  const subtleTextColor = colorScheme === 'light' ? 'rgba(255,255,255,0.72)' : 'rgba(226,232,240,0.72)';
  const accentColor = colorScheme === 'light' ? '#38bdf8' : '#38bdf8';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View>
        <Text style={styles.title}>{matchTitle}</Text>
        <Text style={[styles.subtitle, { color: subtleTextColor }]}>
          {matchType} {venueName ? `• ${venueName}` : ''}
        </Text>
      </View>
      <View style={styles.gameInfoContainer}>
        <Text style={[styles.gameLabel, { color: subtleTextColor }]}>Game</Text>
        <Text style={[styles.gameCount, { color: accentColor }]}>
          {currentGame}
          <Text style={{ color: subtleTextColor }}>/{totalGames}</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  gameInfoContainer: {
    alignItems: 'flex-end',
  },
  gameLabel: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  gameCount: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
  },
});
