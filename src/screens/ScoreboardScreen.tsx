import { StyleSheet, View } from 'react-native';

import {
  PrimaryButton,
  ScoreBox,
  ServeIndicator,
  TopBar,
} from '#/components/shared';
import { ThemedText } from '#/components/themed-text';
import { ThemedView } from '#/components/themed-view';
import { useColorScheme } from '#/hooks/use-color-scheme';

const mockMatchState = {
  matchTitle: 'Club Championship',
  matchType: 'Singles' as const,
  currentGame: 1,
  totalGames: 3,
  venue: 'Court 2',
  teams: [
    {
      id: 'sideA',
      label: 'Side A',
      playerName: 'Alex Chen',
      score: 18,
      serving: true,
    },
    {
      id: 'sideB',
      label: 'Side B',
      playerName: 'Priya Singh',
      score: 15,
      serving: false,
    },
  ],
};

export default function ScoreboardScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const cardBackground = colorScheme === 'light' ? '#ffffff' : '#0f172a';
  const dividerColor = colorScheme === 'light' ? '#e2e8f0' : '#1f2937';

  return (
    <ThemedView style={styles.container}>
      <TopBar
        matchTitle={mockMatchState.matchTitle}
        matchType={mockMatchState.matchType}
        currentGame={mockMatchState.currentGame}
        totalGames={mockMatchState.totalGames}
        venueName={mockMatchState.venue}
      />

      <View style={[styles.scoreboardCard, { backgroundColor: cardBackground }]}>
        <View style={styles.scoreRow}>
          {mockMatchState.teams.map((team) => (
            <View key={team.id} style={styles.teamColumn}>
              <View style={styles.teamHeader}>
                <ThemedText type="subtitle" style={styles.teamLabel}>
                  {team.label}
                </ThemedText>
                <View style={styles.serveRow}>
                  <ServeIndicator active={team.serving} />
                  <ThemedText type="default" style={styles.serveText}>
                    {team.serving ? 'Serving' : 'Receiving'}
                  </ThemedText>
                </View>
              </View>
              <ScoreBox
                playerName={team.playerName}
                score={team.score}
                highlight={team.serving}
              />
              <View style={styles.pointButtonWrapper}>
                <PrimaryButton label="+1 Point" onPress={() => {}} />
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.divider, { backgroundColor: dividerColor }]} />

        <View style={styles.undoWrapper}>
          <PrimaryButton label="Undo" disabled onPress={() => {}} />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 24,
  },
  scoreboardCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#0f172a',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    gap: 24,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 16,
  },
  teamColumn: {
    flex: 1,
    gap: 16,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamLabel: {
    fontWeight: '600',
  },
  serveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serveText: {
    fontSize: 14,
  },
  pointButtonWrapper: {
    alignSelf: 'stretch',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  undoWrapper: {
    alignSelf: 'stretch',
  },
});
