import { createSelector, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import type { MatchType, TeamId } from '#/types/match';
import type { RootState } from './store';

export type CourtOrder = [TeamId, TeamId];

export type TeamState = {
  id: TeamId;
  label: string;
  players: string[];
  score: number;
};

export type ScoreboardTeam = {
  id: TeamId;
  label: string;
  score: number;
  isServing: boolean;
  playerLabel: string;
};

export type CompletedGame = {
  gameNumber: number;
  scores: Record<TeamId, number>;
  winner: TeamId;
};

export type ScoreboardSetScore = {
  gameNumber: number;
  scores: Record<TeamId, number>;
  isComplete: boolean;
  isCurrent: boolean;
};

export type ScoreboardViewModel = {
  matchInProgress: boolean;
  matchTitle: string;
  matchTypeLabel: 'Singles' | 'Doubles';
  currentGame: number;
  totalGames: number;
  venueName?: string;
  canUndo: boolean;
  teams: ScoreboardTeam[];
  setScores: ScoreboardSetScore[];
};

export type ScoreSnapshot = {
  scores: Record<TeamId, number>;
  servingTeam: TeamId;
  currentGame: number;
  gamesWon: Record<TeamId, number>;
  status: MatchStatus;
  courtOrder: CourtOrder;
  hasSwitchedMidGame: boolean;
  completedGames: CompletedGame[];
};

export type PlayerNameEntries = Record<TeamId, [string, string]>;

export type MatchStatus = 'idle' | 'in-progress' | 'completed';

export type MatchState = {
  status: MatchStatus;
  matchTitle: string;
  matchType: MatchType;
  currentGame: number;
  totalGames: number;
  venueName?: string;
  servingTeam: TeamId;
  gamesWon: Record<TeamId, number>;
  courtOrder: CourtOrder;
  hasSwitchedMidGame: boolean;
  teams: Record<TeamId, TeamState>;
  history: ScoreSnapshot[];
  completedGames: CompletedGame[];
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
  gamesWon: {
    sideA: 0,
    sideB: 0,
  },
  courtOrder: ['sideA', 'sideB'],
  hasSwitchedMidGame: false,
  teams: {
    sideA: defaultTeamState('sideA', 'Side A'),
    sideB: defaultTeamState('sideB', 'Side B'),
  },
  history: [],
  completedGames: [],
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
      state.gamesWon = {
        sideA: 0,
        sideB: 0,
      };
      state.courtOrder = ['sideA', 'sideB'];
      state.servingTeam = state.courtOrder[0];
      state.hasSwitchedMidGame = false;
      state.history = [];
      state.completedGames = [];
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
      const opponentId: TeamId = teamId === 'sideA' ? 'sideB' : 'sideA';
      const snapshot: ScoreSnapshot = {
        scores: {
          sideA: state.teams.sideA.score,
          sideB: state.teams.sideB.score,
        },
        servingTeam: state.servingTeam,
        currentGame: state.currentGame,
        gamesWon: {
          sideA: state.gamesWon.sideA,
          sideB: state.gamesWon.sideB,
        },
        status: state.status,
        courtOrder: [state.courtOrder[0], state.courtOrder[1]] as CourtOrder,
        hasSwitchedMidGame: state.hasSwitchedMidGame,
        completedGames: state.completedGames.map((game) => ({
          gameNumber: game.gameNumber,
          scores: {
            sideA: game.scores.sideA,
            sideB: game.scores.sideB,
          },
          winner: game.winner,
        })),
      };

      state.history.push(snapshot);
      state.teams[teamId].score += 1;

      const updatedScores: Record<TeamId, number> = {
        sideA: state.teams.sideA.score,
        sideB: state.teams.sideB.score,
      };

      let nextCourtOrder: CourtOrder = state.courtOrder;
      let hasSwitchedMidGame = state.hasSwitchedMidGame;

      if (
        !state.hasSwitchedMidGame &&
        state.currentGame === state.totalGames &&
        (updatedScores.sideA === 11 || updatedScores.sideB === 11)
      ) {
        nextCourtOrder = [state.courtOrder[1], state.courtOrder[0]] as CourtOrder;
        hasSwitchedMidGame = true;
      }

      const winnerScore = updatedScores[teamId];
      const opponentScore = updatedScores[opponentId];
      const hasTwoPointLead = winnerScore >= 21 && winnerScore - opponentScore >= 2;
      const reachedMaxPoint = winnerScore === 30;
      const gameWon = hasTwoPointLead || reachedMaxPoint;

      let servingTeam: TeamId = teamId;

      if (gameWon) {
        state.gamesWon[teamId] += 1;

        state.completedGames.push({
          gameNumber: state.currentGame,
          scores: {
            sideA: updatedScores.sideA,
            sideB: updatedScores.sideB,
          },
          winner: teamId,
        });

        const gamesNeededToWin = Math.floor(state.totalGames / 2) + 1;
        const matchWon = state.gamesWon[teamId] >= gamesNeededToWin;

        if (matchWon) {
          state.status = 'completed';
        } else {
          state.currentGame += 1;
          state.teams.sideA.score = 0;
          state.teams.sideB.score = 0;
          servingTeam = teamId;
          nextCourtOrder = [state.courtOrder[1], state.courtOrder[0]] as CourtOrder;
          hasSwitchedMidGame = false;
        }
      }

      state.servingTeam = servingTeam;
      state.courtOrder = nextCourtOrder;
      state.hasSwitchedMidGame = hasSwitchedMidGame;
    },
    undoLastPoint(state) {
      if (state.history.length === 0) {
        return;
      }

      const previousSnapshot = state.history.pop();

      if (!previousSnapshot) {
        return;
      }

      state.teams.sideA.score = previousSnapshot.scores.sideA;
      state.teams.sideB.score = previousSnapshot.scores.sideB;
      state.servingTeam = previousSnapshot.servingTeam;
      state.currentGame = previousSnapshot.currentGame;
      state.gamesWon.sideA = previousSnapshot.gamesWon.sideA;
      state.gamesWon.sideB = previousSnapshot.gamesWon.sideB;
      state.status = previousSnapshot.status;
      state.courtOrder = previousSnapshot.courtOrder;
      state.hasSwitchedMidGame = previousSnapshot.hasSwitchedMidGame;
      state.completedGames = previousSnapshot.completedGames.map((game) => ({
        gameNumber: game.gameNumber,
        scores: {
          sideA: game.scores.sideA,
          sideB: game.scores.sideB,
        },
        winner: game.winner,
      }));
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

const selectScoreboardTeams = createSelector([selectOrderedTeams, selectMatch], (teams, match): ScoreboardTeam[] =>
  teams.map((team) => ({
    id: team.id,
    label: team.label,
    score: team.score,
    isServing: match.servingTeam === team.id,
    playerLabel: team.players.length > 0 ? team.players.join(' & ') : 'Ready to Play',
  })),
);

const selectScoreboardSetScores = createSelector(selectMatch, (match): ScoreboardSetScore[] => {
  const completedByGame = new Map(match.completedGames.map((game) => [game.gameNumber, game]));
  const setScores: ScoreboardSetScore[] = [];

  for (let gameNumber = 1; gameNumber <= match.totalGames; gameNumber += 1) {
    const completed = completedByGame.get(gameNumber);

    if (completed) {
      setScores.push({
        gameNumber,
        scores: {
          sideA: completed.scores.sideA,
          sideB: completed.scores.sideB,
        },
        isComplete: true,
        isCurrent: false,
      });
      continue;
    }

    const isCurrent = match.status !== 'completed' && gameNumber === match.currentGame;

    setScores.push({
      gameNumber,
      scores: isCurrent
        ? {
            sideA: match.teams.sideA.score,
            sideB: match.teams.sideB.score,
          }
        : {
            sideA: 0,
            sideB: 0,
          },
      isComplete: false,
      isCurrent,
    });
  }

  return setScores;
});

export const selectScoreboardViewModel = createSelector(
  [selectMatch, selectScoreboardTeams, selectScoreboardSetScores],
  (match, teams, setScores): ScoreboardViewModel => ({
    matchInProgress: match.status === 'in-progress',
    matchTitle: match.matchTitle,
    matchTypeLabel: match.matchType === 'singles' ? 'Singles' : 'Doubles',
    currentGame: match.currentGame,
    totalGames: match.totalGames,
    venueName: match.venueName,
    canUndo: match.history.length > 0,
    teams,
    setScores,
  }),
);

export default matchSlice.reducer;
