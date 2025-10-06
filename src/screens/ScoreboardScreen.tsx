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
import { addPoint, selectScoreboardViewModel, undoLastPoint } from '#/redux/matchSlice';
import type { ScoreboardSetScore, ScoreboardTeam } from '#/redux/matchSlice';
import type { TeamId } from '#/types/match';

export default function ScoreboardScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    matchInProgress,
    matchTitle,
    matchTypeLabel,
    currentGame,
    totalGames,
    venueName,
    canUndo,
    teams,
    setScores,
  } = useAppSelector(selectScoreboardViewModel);
  const colorScheme = useColorScheme() ?? 'light';
  const cardBackground = colorScheme === 'light' ? '#ffffff' : '#0f172a';
  const dividerColor = colorScheme === 'light' ? '#e2e8f0' : '#1f2937';
  const trackColor = colorScheme === 'light' ? '#e2e8f0' : '#1f2937';
  const mutedColor = colorScheme === 'light' ? '#64748b' : '#94a3b8';

  useEffect(() => {
    if (!matchInProgress) {
      router.replace('/');
    }
  }, [matchInProgress, router]);

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

  return (
    <ThemedView style={styles.container}>
      <TopBar
        matchTitle={matchTitle}
        matchType={matchTypeLabel}
        currentGame={currentGame}
        totalGames={totalGames}
        venueName={venueName}
      />

      <View style={[styles.scoreboardCard, { backgroundColor: cardBackground }]}>
        <View style={styles.scoreRow}>
          {teams.map((team) => (
            <View key={team.id} style={styles.teamColumn}>
              <View style={styles.teamHeader}>
                <ThemedText type="subtitle" style={styles.teamLabel}>
                  {team.label}
                </ThemedText>
                <View style={styles.serveRow}>
                  <ServeIndicator active={team.isServing} />
                  <ThemedText type="default" style={styles.serveText}>
                    {team.isServing ? 'Serving' : 'Receiving'}
                  </ThemedText>
                </View>
              </View>
              <ScoreBox playerName={team.playerLabel} score={team.score} highlight={team.isServing} />
              <View style={styles.pointButtonWrapper}>
                <PrimaryButton label="+1 Point" onPress={() => handleAddPoint(team.id)} />
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.divider, { backgroundColor: dividerColor }]} />

        <View style={styles.undoWrapper}>
          <PrimaryButton label="Undo" disabled={!canUndo} onPress={handleUndo} />
        </View>
      </View>

      <View style={[styles.setsCard, { backgroundColor: cardBackground }]}>
        <View style={styles.setsHeader}>
          <ThemedText type="subtitle">Set Scores</ThemedText>
          <ThemedText type="default" style={[styles.setsDescription, { color: mutedColor }]}>
            Compare how each side performed in every set throughout the match.
          </ThemedText>
        </View>

        <SetScoresGraph
          colorScheme={colorScheme}
          mutedColor={mutedColor}
          setScores={setScores}
          teams={teams}
          trackColor={trackColor}
        />
      </View>
    </ThemedView>
  );
}

type SetScoresGraphProps = {
  setScores: ScoreboardSetScore[];
  teams: ScoreboardTeam[];
  colorScheme: 'light' | 'dark';
  trackColor: string;
  mutedColor: string;
};

const BAR_MAX_HEIGHT = 140;

function SetScoresGraph({ setScores, teams, colorScheme, trackColor, mutedColor }: SetScoresGraphProps) {
  const teamColors: Record<TeamId, string> =
    colorScheme === 'light'
      ? { sideA: '#2563eb', sideB: '#f97316' }
      : { sideA: '#60a5fa', sideB: '#fb923c' };

  const maxScore = Math.max(
    1,
    ...setScores.map((set) => Math.max(set.scores.sideA, set.scores.sideB)),
  );

  return (
    <View style={styles.graphContainer}>
      {setScores.map((set) => (
        <View key={set.gameNumber} style={styles.setColumn}>
          <ThemedText type="defaultSemiBold" style={styles.setLabel}>
            Set {set.gameNumber}
          </ThemedText>

          <View style={styles.barGroup}>
            {teams.map((team) => {
              const score = set.scores[team.id];
              const height = (score / maxScore) * BAR_MAX_HEIGHT;
              const opacity = set.isComplete || set.isCurrent ? 1 : 0.35;

              return (
                <View key={team.id} style={styles.barColumn}>
                  <View style={[styles.barTrack, { backgroundColor: trackColor }]}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height,
                          backgroundColor: teamColors[team.id],
                          opacity,
                        },
                      ]}
                    />
                  </View>
                  <ThemedText type="defaultSemiBold" style={styles.barScore}>
                    {score}
                  </ThemedText>
                  <ThemedText type="default" style={[styles.barTeamLabel, { color: mutedColor }]}>
                    {team.label}
                  </ThemedText>
                </View>
              );
            })}
          </View>

          <ThemedText type="default" style={[styles.setStatus, { color: mutedColor }]}>
            {set.isComplete ? 'Completed' : set.isCurrent ? 'In Progress' : 'Pending'}
          </ThemedText>
        </View>
      ))}
    </View>
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
  setsCard: {
    borderRadius: 24,
    padding: 24,
    gap: 24,
  },
  setsHeader: {
    gap: 4,
  },
  setsDescription: {
    color: '#64748b',
  },
  graphContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  setColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 12,
  },
  setLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  barGroup: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-end',
  },
  barColumn: {
    alignItems: 'center',
    gap: 8,
  },
  barTrack: {
    width: 28,
    height: BAR_MAX_HEIGHT,
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 18,
  },
  barScore: {
    fontSize: 16,
  },
  barTeamLabel: {
    fontSize: 12,
    textAlign: 'center',
    color: '#64748b',
  },
  setStatus: {
    fontSize: 12,
    color: '#64748b',
  },
});
