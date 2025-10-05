import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { TeamId } from '#/types/match';

type MatchPlayers = Record<TeamId, string[]>;
type MatchScores = Record<TeamId, number>;

type ScoreSnapshot = {
  scores: MatchScores;
  serverSide: TeamId;
  currentGame: number;
};

type StartMatchPayload = {
  players: MatchPlayers;
  startingServer?: TeamId;
  startingGame?: number;
};

type AddPointPayload = {
  teamId: TeamId;
};

type EndGamePayload = {
  nextServer?: TeamId;
};

type MatchState = {
  players: MatchPlayers;
  scores: MatchScores;
  serverSide: TeamId;
  currentGame: number;
  history: ScoreSnapshot[];
};

const createInitialState = (): MatchState => ({
  players: {
    sideA: [],
    sideB: [],
  },
  scores: {
    sideA: 0,
    sideB: 0,
  },
  serverSide: 'sideA',
  currentGame: 1,
  history: [],
});

const initialState: MatchState = createInitialState();

const createScoresSnapshot = (state: MatchState): ScoreSnapshot => ({
  scores: {
    sideA: state.scores.sideA,
    sideB: state.scores.sideB,
  },
  serverSide: state.serverSide,
  currentGame: state.currentGame,
});

export const matchSlice = createSlice({
  name: 'match',
  initialState,
  reducers: {
    startMatch(state, action: PayloadAction<StartMatchPayload>) {
      const { players, startingServer, startingGame } = action.payload;

      state.players = {
        sideA: [...players.sideA],
        sideB: [...players.sideB],
      };
      state.scores = {
        sideA: 0,
        sideB: 0,
      };
      state.serverSide = startingServer ?? 'sideA';
      state.currentGame = startingGame ?? 1;
      state.history = [];
    },
    addPoint(state, action: PayloadAction<AddPointPayload>) {
      const { teamId } = action.payload;

      state.history.push(createScoresSnapshot(state));
      state.scores[teamId] += 1;
      state.serverSide = teamId;
    },
    undoPoint(state) {
      const snapshot = state.history.pop();

      if (!snapshot) {
        return;
      }

      state.scores = {
        sideA: snapshot.scores.sideA,
        sideB: snapshot.scores.sideB,
      };
      state.serverSide = snapshot.serverSide;
      state.currentGame = snapshot.currentGame;
    },
    endGame(state, action: PayloadAction<EndGamePayload | undefined>) {
      const nextServer = action.payload?.nextServer;

      state.currentGame += 1;
      state.scores = {
        sideA: 0,
        sideB: 0,
      };
      state.serverSide = nextServer ?? state.serverSide;
      state.history = [];
    },
    resetMatch() {
      return createInitialState();
    },
  },
});

export const { startMatch, addPoint, undoPoint, endGame, resetMatch } = matchSlice.actions;

export default matchSlice.reducer;
