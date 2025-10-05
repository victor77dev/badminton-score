import { createSelector, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import type { MatchType, TeamId } from '#/types/match';
import type { RootState } from './store';

export type TeamState = {
  id: TeamId;
  label: string;
  players: string[];
  score: number;
};

export type ScoreSnapshot = {
  scores: Record<TeamId, number>;
  servingTeam: TeamId;
};

export type PlayerNameEntries = Record<TeamId, [string, string]>;

export type MatchStatus = 'idle' | 'in-progress';

export type MatchState = {
  status: MatchStatus;
  matchTitle: string;
  matchType: MatchType;
  currentGame: number;
  totalGames: number;
  venueName?: string;
  servingTeam: TeamId;
  teams: Record<TeamId, TeamState>;
  history: ScoreSnapshot[];
};

export type StartMatchPayload = {
  matchType: MatchType;
  playerNames: PlayerNameEntries;
};

const defaultTeamState = (id: TeamId, label: string): TeamState => ({
  id,
  label,
  players: [],
  score: 0,
});

const initialState: MatchState = {
  status: 'idle',
  matchTitle: 'Friendly Match',
  matchType: 'singles',
  currentGame: 1,
  totalGames: 3,
  servingTeam: 'sideA',
  teams: {
    sideA: defaultTeamState('sideA', 'Side A'),
    sideB: defaultTeamState('sideB', 'Side B'),
  },
  history: [],
};

const sanitizeNames = (names: [string, string]) =>
  names.map((name) => name.trim()).filter((name) => name.length > 0);

const matchSlice = createSlice({
  name: 'match',
  initialState,
  reducers: {
    startMatch(state, action: PayloadAction<StartMatchPayload>) {
      const { matchType, playerNames } = action.payload;

      const sideAPlayers =
        matchType === 'singles'
          ? sanitizeNames([playerNames.sideA[0], '']).slice(0, 1)
          : sanitizeNames(playerNames.sideA);

      const sideBPlayers =
        matchType === 'singles'
          ? sanitizeNames([playerNames.sideB[0], '']).slice(0, 1)
          : sanitizeNames(playerNames.sideB);

      state.status = 'in-progress';
      state.matchType = matchType;
      state.currentGame = 1;
      state.totalGames = 3;
      state.servingTeam = 'sideA';
      state.history = [];
      state.teams.sideA = {
        id: 'sideA',
        label: 'Side A',
        players: sideAPlayers,
        score: 0,
      };
      state.teams.sideB = {
        id: 'sideB',
        label: 'Side B',
        players: sideBPlayers,
        score: 0,
      };
    },
    addPoint(state, action: PayloadAction<TeamId>) {
      if (state.status !== 'in-progress') {
        return;
      }

      const teamId = action.payload;
      const snapshot: ScoreSnapshot = {
        scores: {
          sideA: state.teams.sideA.score,
          sideB: state.teams.sideB.score,
        },
        servingTeam: state.servingTeam,
      };

      state.history.push(snapshot);
      state.teams[teamId].score += 1;
      state.servingTeam = teamId;
    },
    undoLastPoint(state) {
      if (state.status !== 'in-progress' || state.history.length === 0) {
        return;
      }

      const previousSnapshot = state.history.pop();

      if (!previousSnapshot) {
        return;
      }

      state.teams.sideA.score = previousSnapshot.scores.sideA;
      state.teams.sideB.score = previousSnapshot.scores.sideB;
      state.servingTeam = previousSnapshot.servingTeam;
    },
  },
});

export const { startMatch, addPoint, undoLastPoint } = matchSlice.actions;

export const selectMatch = (state: RootState) => state.match;

export const selectIsMatchInProgress = createSelector(
  selectMatch,
  (match) => match.status === 'in-progress',
);

export const selectCanUndo = createSelector(selectMatch, (match) => match.history.length > 0);

export const selectOrderedTeams = createSelector(selectMatch, (match) =>
  (['sideA', 'sideB'] as TeamId[]).map((id) => match.teams[id]),
);

export default matchSlice.reducer;
