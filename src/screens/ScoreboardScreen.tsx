import { useEffect, useCallback, Fragment } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';

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

const CHART_HEIGHT = 160;
const HORIZONTAL_STEP = 80;
const PADDING = { top: 16, right: 32, bottom: 40, left: 44 };

function SetScoresGraph({ setScores, teams, colorScheme, trackColor, mutedColor }: SetScoresGraphProps) {
  const teamColors: Record<TeamId, string> =
    colorScheme === 'light'
      ? { sideA: '#2563eb', sideB: '#f97316' }
      : { sideA: '#60a5fa', sideB: '#fb923c' };

  const maxScore = Math.max(
    1,
    ...setScores.map((set) => Math.max(set.scores.sideA, set.scores.sideB)),
  );

  const setCount = setScores.length;
  const chartWidth = Math.max(1, setCount - 1) * HORIZONTAL_STEP;
  const viewBoxWidth = PADDING.left + chartWidth + PADDING.right;
  const viewBoxHeight = PADDING.top + CHART_HEIGHT + PADDING.bottom;
  const chartLeft = PADDING.left;
  const chartRight = viewBoxWidth - PADDING.right;
  const chartTop = PADDING.top;
  const chartBottom = PADDING.top + CHART_HEIGHT;
  const xStep = setCount > 1 ? (chartRight - chartLeft) / (setCount - 1) : 0;

  const xForIndex = (index: number) =>
    setCount > 1 ? chartLeft + index * xStep : (chartLeft + chartRight) / 2;

  const yForScore = (score: number) =>
    chartBottom - (score / maxScore) * CHART_HEIGHT;

  const yTickStep = Math.max(1, Math.ceil(maxScore / 4));
  const yTicks: number[] = [];
  for (let value = 0; value <= maxScore; value += yTickStep) {
    yTicks.push(value);
  }
  if (yTicks[yTicks.length - 1] !== maxScore) {
    yTicks.push(maxScore);
  }

  const teamPointMap = teams.reduce(
    (acc, team) => {
      acc[team.id] = setScores.map((set, index) => ({
        x: xForIndex(index),
        y: yForScore(set.scores[team.id]),
        set,
      }));
      return acc;
    },
    {} as Record<TeamId, { x: number; y: number; set: ScoreboardSetScore }[]>,
  );

  return (
    <View style={styles.graphWrapper}>
      <View style={styles.legendRow}>
        {teams.map((team) => (
          <View key={team.id} style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: teamColors[team.id] }]} />
            <ThemedText type="default" style={[styles.legendLabel, { color: mutedColor }]}>
              {team.label}
            </ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.svgWrapper}>
        <Svg
          width="100%"
          height={viewBoxHeight}
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        >
          <Line x1={chartLeft} y1={chartTop} x2={chartLeft} y2={chartBottom} stroke={trackColor} strokeWidth={1} />
          <Line x1={chartLeft} y1={chartBottom} x2={chartRight} y2={chartBottom} stroke={trackColor} strokeWidth={1} />

          {yTicks.map((tick) => {
            const y = yForScore(tick);
            const isBaseLine = tick === 0;

            return (
              <Fragment key={`tick-${tick}`}>
                <Line
                  x1={chartLeft}
                  y1={y}
                  x2={chartRight}
                  y2={y}
                  stroke={trackColor}
                  strokeWidth={1}
                  opacity={isBaseLine ? 1 : 0.35}
                />
                <SvgText
                  x={chartLeft - 8}
                  y={y + 4}
                  fontSize={12}
                  fill={mutedColor}
                  textAnchor="end"
                >
                  {tick}
                </SvgText>
              </Fragment>
            );
          })}

          {setScores.map((set, index) => {
            const x = xForIndex(index);
            const statusLabel = set.isComplete
              ? 'Completed'
              : set.isCurrent
                ? 'In Progress'
                : 'Pending';

            return (
              <Fragment key={`labels-${set.gameNumber}`}>
                <SvgText
                  x={x}
                  y={chartBottom + 18}
                  fontSize={12}
                  fill={mutedColor}
                  textAnchor="middle"
                >
                  Set {set.gameNumber}
                </SvgText>
                <SvgText
                  x={x}
                  y={chartBottom + 34}
                  fontSize={11}
                  fill={mutedColor}
                  textAnchor="middle"
                >
                  {statusLabel}
                </SvgText>
              </Fragment>
            );
          })}

          {teams.map((team) => {
            const points = teamPointMap[team.id];

            return (
              <Fragment key={`series-${team.id}`}>
                {points.length > 1 && (
                  <Polyline
                    points={points.map((point) => `${point.x},${point.y}`).join(' ')}
                    fill="none"
                    stroke={teamColors[team.id]}
                    strokeWidth={2.5}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                )}
                {points.map((point) => (
                  <Circle
                    key={`point-${team.id}-${point.set.gameNumber}`}
                    cx={point.x}
                    cy={point.y}
                    r={6}
                    stroke={colorScheme === 'light' ? '#ffffff' : '#020617'}
                    strokeWidth={2}
                    fill={teamColors[team.id]}
                    opacity={point.set.isComplete || point.set.isCurrent ? 1 : 0.4}
                  />
                ))}
              </Fragment>
            );
          })}
        </Svg>
      </View>
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
  graphWrapper: {
    gap: 16,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    fontSize: 14,
  },
  svgWrapper: {
    width: '100%',
  },
});
