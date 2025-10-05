import { useEffect, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  PrimaryButton,
  ScoreBox,
  ServeIndicator,
  TopBar,
} from '#/components/shared';
import { ThemedText } from '#/components/themed-text';
import { ThemedView } from '#/components/themed-view';
import { useColorScheme } from '#/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '#/redux/hooks';
import { addPoint, selectMatch, undoLastPoint } from '#/redux/matchSlice';
import type { TeamId } from '#/types/match';

export default function ScoreboardScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const matchState = useAppSelector(selectMatch);
  const colorScheme = useColorScheme() ?? 'light';
  const cardBackground = colorScheme === 'light' ? '#ffffff' : '#0f172a';
  const dividerColor = colorScheme === 'light' ? '#e2e8f0' : '#1f2937';
  const matchInProgress = matchState.status === 'in-progress';

  useEffect(() => {
    if (!matchInProgress) {
      router.replace('/');
    }
  }, [matchInProgress, router]);

  const { teams } = matchState;
  const orderedTeams = (['sideA', 'sideB'] as TeamId[]).map((id) => teams[id]);

  const handleAddPoint = useCallback(
    (teamId: TeamId) => {
      dispatch(addPoint(teamId));
    },
    [dispatch],
  );

  const handleUndo = useCallback(() => {
    dispatch(undoLastPoint());
  }, [dispatch]);

  if (!matchInProgress) {
    return null;
  }

  const topBarMatchType = matchState.matchType === 'singles' ? 'Singles' : 'Doubles';
  const canUndo = matchState.history.length > 0;

  return (
    <ThemedView style={styles.container}>
      <TopBar
        matchTitle={matchState.matchTitle}
        matchType={topBarMatchType}
        currentGame={matchState.currentGame}
        totalGames={matchState.totalGames}
        venueName={matchState.venueName}
      />

      <View style={[styles.scoreboardCard, { backgroundColor: cardBackground }]}>
        <View style={styles.scoreRow}>
          {orderedTeams.map((team) => {
            const isServing = matchState.servingTeam === team.id;
            const playerLabel = team.players.join(' & ') || 'Ready to Play';

            return (
              <View key={team.id} style={styles.teamColumn}>
                <View style={styles.teamHeader}>
                  <ThemedText type="subtitle" style={styles.teamLabel}>
                    {team.label}
                  </ThemedText>
                  <View style={styles.serveRow}>
                    <ServeIndicator active={isServing} />
                    <ThemedText type="default" style={styles.serveText}>
                      {isServing ? 'Serving' : 'Receiving'}
                    </ThemedText>
                  </View>
                </View>
                <ScoreBox
                  playerName={playerLabel}
                  score={team.score}
                  highlight={isServing}
                />
                <View style={styles.pointButtonWrapper}>
                  <PrimaryButton label="+1 Point" onPress={() => handleAddPoint(team.id)} />
                </View>
              </View>
            );
          })}
        </View>

        <View style={[styles.divider, { backgroundColor: dividerColor }]} />

        <View style={styles.undoWrapper}>
          <PrimaryButton label="Undo" disabled={!canUndo} onPress={handleUndo} />
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
