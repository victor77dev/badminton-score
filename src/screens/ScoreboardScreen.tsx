import { Fragment, useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Redirect, useRootNavigationState } from 'expo-router';
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
import {
  addPoint,
  selectScoreboardViewModel,
  undoLastPoint,
} from '#/redux/matchSlice';
import type {
  ScoreboardSetProgression,
  ScoreboardTeam,
} from '#/redux/matchSlice';
import type { TeamId } from '#/types/match';

const CHART_HEIGHT = 184;
const HORIZONTAL_STEP = 36;
const PADDING = { top: 20, right: 28, bottom: 44, left: 44 };

export default function ScoreboardScreen() {
  const navigationState = useRootNavigationState();
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
    setProgressions,
  } = useAppSelector(selectScoreboardViewModel);
  const colorScheme = useColorScheme() ?? 'light';
  const cardBackground = colorScheme === 'light' ? '#ffffff' : '#0f172a';
  const dividerColor = colorScheme === 'light' ? '#e2e8f0' : '#1f2937';
  const trackColor = colorScheme === 'light' ? '#e2e8f0' : '#1f2937';
  const mutedColor = colorScheme === 'light' ? '#64748b' : '#94a3b8';

  const handleAddPoint = useCallback(
    (teamId: TeamId) => {
      dispatch(addPoint(teamId));
    },
    [dispatch],
  );

  const handleUndo = useCallback(() => {
    dispatch(undoLastPoint());
  }, [dispatch]);

  if (!navigationState?.key) {
    return null;
  }

  if (!matchInProgress) {
    return <Redirect href="/" />;
  }

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
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
          setProgressions={setProgressions}
          teams={teams}
          trackColor={trackColor}
        />
      </View>
      </ScrollView>
    </ThemedView>
  );
}

type SetScoresGraphProps = {
  setProgressions: ScoreboardSetProgression[];
  teams: ScoreboardTeam[];
  colorScheme: 'light' | 'dark';
  trackColor: string;
  mutedColor: string;
};

function SetScoresGraph({
  setProgressions,
  teams,
  colorScheme,
  trackColor,
  mutedColor,
}: SetScoresGraphProps) {
  const teamColors: Record<TeamId, string> =
    colorScheme === 'light'
      ? { sideA: '#ef4444', sideB: '#0f172a' }
      : { sideA: '#f87171', sideB: '#e2e8f0' };

  if (setProgressions.length === 0) {
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
        <ThemedText type="default" style={[styles.setsDescription, { color: mutedColor }]}>
          Match data will appear here once a set begins.
        </ThemedText>
      </View>
    );
  }

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

      <View style={styles.setList}>
        {setProgressions.map((set) => (
          <View key={set.gameNumber} style={styles.setItem}>
            <View style={styles.setItemHeader}>
              <ThemedText type="defaultSemiBold">Game {set.gameNumber}</ThemedText>
              <ThemedText type="default" style={[styles.setStatus, { color: mutedColor }]}>
                {set.isComplete ? 'Completed' : set.isCurrent ? 'In Progress' : 'Not Started'}
              </ThemedText>
            </View>

            <SetLineChart
              colorScheme={colorScheme}
              mutedColor={mutedColor}
              progression={set}
              teamColors={teamColors}
              teams={teams}
              trackColor={trackColor}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

type SetLineChartProps = {
  progression: ScoreboardSetProgression;
  teams: ScoreboardTeam[];
  teamColors: Record<TeamId, string>;
  trackColor: string;
  mutedColor: string;
  colorScheme: 'light' | 'dark';
};

function SetLineChart({
  progression,
  teams,
  teamColors,
  trackColor,
  mutedColor,
  colorScheme,
}: SetLineChartProps) {
  const points =
    progression.points.length > 0
      ? progression.points
      : [{ rally: 0, scores: { sideA: 0, sideB: 0 } }];

  const maxScore = Math.max(
    1,
    ...points.map((point) => Math.max(point.scores.sideA, point.scores.sideB)),
  );
  const lastRally = points[points.length - 1]?.rally ?? 0;
  const domainMaxRally = Math.max(1, lastRally);

  const chartWidth = domainMaxRally * HORIZONTAL_STEP;
  const viewBoxWidth = PADDING.left + chartWidth + PADDING.right;
  const viewBoxHeight = PADDING.top + CHART_HEIGHT + PADDING.bottom;
  const chartLeft = PADDING.left;
  const chartRight = viewBoxWidth - PADDING.right;
  const chartTop = PADDING.top;
  const chartBottom = chartTop + CHART_HEIGHT;

  const xForRally = (rally: number) =>
    lastRally === 0
      ? (chartLeft + chartRight) / 2
      : chartLeft + (rally / domainMaxRally) * (chartRight - chartLeft);
  const yForScore = (score: number) =>
    maxScore === 0 ? chartBottom : chartBottom - (score / maxScore) * CHART_HEIGHT;

  const yTickStep = Math.max(1, Math.ceil(maxScore / 5));
  const yTicks: number[] = [];
  for (let value = 0; value <= maxScore; value += yTickStep) {
    yTicks.push(value);
  }
  if (yTicks[yTicks.length - 1] !== maxScore) {
    yTicks.push(maxScore);
  }

  const xTickStep = Math.max(1, Math.ceil(lastRally / 5));
  const xTicks: number[] = [];
  for (let rally = 0; rally <= lastRally; rally += xTickStep) {
    xTicks.push(rally);
  }
  if (xTicks[xTicks.length - 1] !== lastRally) {
    xTicks.push(lastRally);
  }

  const teamSeries = teams.map((team) => ({
    teamId: team.id,
    coordinates: points.map((point) => ({
      rally: point.rally,
      score: point.scores[team.id],
      x: xForRally(point.rally),
      y: yForScore(point.scores[team.id]),
    })),
  }));

  return (
    <View style={styles.svgWrapper}>
      <Svg width="100%" height={viewBoxHeight} viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}>
        <Line x1={chartLeft} y1={chartTop} x2={chartLeft} y2={chartBottom} stroke={trackColor} strokeWidth={1} />
        <Line x1={chartLeft} y1={chartBottom} x2={chartRight} y2={chartBottom} stroke={trackColor} strokeWidth={1} />

        {yTicks.map((tick) => {
          const y = yForScore(tick);
          const isBaseline = tick === 0;

          return (
            <Fragment key={`y-${tick}`}>
              <Line
                x1={chartLeft}
                y1={y}
                x2={chartRight}
                y2={y}
                stroke={trackColor}
                strokeWidth={1}
                opacity={isBaseline ? 1 : 0.28}
                strokeDasharray={isBaseline ? undefined : '4 6'}
              />
              <SvgText
                x={chartLeft - 10}
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

        {xTicks.map((tick) => {
          const x = xForRally(tick);
          const isOrigin = tick === 0;

          return (
            <Fragment key={`x-${tick}`}>
              <Line
                x1={x}
                y1={chartTop}
                x2={x}
                y2={chartBottom}
                stroke={trackColor}
                strokeWidth={1}
                opacity={isOrigin ? 1 : 0.18}
                strokeDasharray={isOrigin ? undefined : '4 6'}
              />
              <SvgText
                x={x}
                y={chartBottom + 22}
                fontSize={11}
                fill={mutedColor}
                textAnchor="middle"
              >
                {tick}
              </SvgText>
            </Fragment>
          );
        })}

        {teamSeries.map((series) => (
          <Fragment key={`series-${series.teamId}`}>
            {series.coordinates.length > 1 && (
              <Polyline
                points={series.coordinates.map((coordinate) => `${coordinate.x},${coordinate.y}`).join(' ')}
                fill="none"
                stroke={teamColors[series.teamId]}
                strokeWidth={3}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}

            {series.coordinates
              .filter((coordinate) => coordinate.rally > 0)
              .map((coordinate) => (
                <Circle
                  key={`point-${series.teamId}-${coordinate.rally}`}
                  cx={coordinate.x}
                  cy={coordinate.y}
                  r={5.5}
                  stroke={colorScheme === 'light' ? '#ffffff' : '#020617'}
                  strokeWidth={2}
                  fill={teamColors[series.teamId]}
                />
              ))}
          </Fragment>
        ))}

        <SvgText
          x={chartLeft - 24}
          y={chartTop - 8}
          fontSize={11}
          fill={mutedColor}
          textAnchor="start"
        >
          Points
        </SvgText>

        <SvgText
          x={(chartLeft + chartRight) / 2}
          y={viewBoxHeight - 8}
          fontSize={11}
          fill={mutedColor}
          textAnchor="middle"
        >
          Rally Count
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
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
  setList: {
    gap: 24,
  },
  setItem: {
    gap: 12,
  },
  setItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  setStatus: {
    fontSize: 13,
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
