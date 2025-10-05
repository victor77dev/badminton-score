import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import type { MatchType, TeamId } from '#/types/match';

type TeamState = {
  id: TeamId;
  label: string;
  players: string[];
  score: number;
};

type ScoreSnapshot = {
  scores: Record<TeamId, number>;
  servingTeam: TeamId;
};

type MatchState = {
  status: 'idle' | 'in-progress';
  matchTitle: string;
  matchType: MatchType;
  currentGame: number;
  totalGames: number;
  venueName?: string;
  servingTeam: TeamId;
  teams: Record<TeamId, TeamState>;
  history: ScoreSnapshot[];
};

type PlayerNameEntries = Record<TeamId, [string, string]>;

type StartMatchConfig = {
  matchType: MatchType;
  playerNames: PlayerNameEntries;
};

type MatchContextValue = {
  matchState: MatchState;
  startMatch: (config: StartMatchConfig) => void;
  addPoint: (teamId: TeamId) => void;
  undoLastPoint: () => void;
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

const MatchContext = createContext<MatchContextValue | undefined>(undefined);

export function MatchProvider({ children }: { children: ReactNode }) {
  const [matchState, setMatchState] = useState<MatchState>(initialState);

  const startMatch = useCallback(({ matchType, playerNames }: StartMatchConfig) => {
    const sanitizeNames = (names: [string, string]) =>
      names.map((name) => name.trim()).filter((name) => name.length > 0);

    const sideAPlayers =
      matchType === 'singles'
        ? sanitizeNames([playerNames.sideA[0], '']).slice(0, 1)
        : sanitizeNames(playerNames.sideA as [string, string]);

    const sideBPlayers =
      matchType === 'singles'
        ? sanitizeNames([playerNames.sideB[0], '']).slice(0, 1)
        : sanitizeNames(playerNames.sideB as [string, string]);

    setMatchState({
      status: 'in-progress',
      matchTitle: 'Friendly Match',
      matchType,
      currentGame: 1,
      totalGames: 3,
      servingTeam: 'sideA',
      teams: {
        sideA: {
          id: 'sideA',
          label: 'Side A',
          players: sideAPlayers,
          score: 0,
        },
        sideB: {
          id: 'sideB',
          label: 'Side B',
          players: sideBPlayers,
          score: 0,
        },
      },
      history: [],
    });
  }, []);

  const addPoint = useCallback((teamId: TeamId) => {
    setMatchState((current) => {
      if (current.status !== 'in-progress') {
        return current;
      }

      const snapshot: ScoreSnapshot = {
        scores: {
          sideA: current.teams.sideA.score,
          sideB: current.teams.sideB.score,
        },
        servingTeam: current.servingTeam,
      };

      return {
        ...current,
        teams: {
          ...current.teams,
          [teamId]: {
            ...current.teams[teamId],
            score: current.teams[teamId].score + 1,
          },
        },
        servingTeam: teamId,
        history: [...current.history, snapshot],
      };
    });
  }, []);

  const undoLastPoint = useCallback(() => {
    setMatchState((current) => {
      if (current.status !== 'in-progress' || current.history.length === 0) {
        return current;
      }

      const nextHistory = current.history.slice(0, -1);
      const previousSnapshot = current.history[current.history.length - 1];

      return {
        ...current,
        teams: {
          sideA: {
            ...current.teams.sideA,
            score: previousSnapshot.scores.sideA,
          },
          sideB: {
            ...current.teams.sideB,
            score: previousSnapshot.scores.sideB,
          },
        },
        servingTeam: previousSnapshot.servingTeam,
        history: nextHistory,
      };
    });
  }, []);

  const value = useMemo(
    () => ({ matchState, startMatch, addPoint, undoLastPoint }),
    [matchState, startMatch, addPoint, undoLastPoint],
  );

  return <MatchContext.Provider value={value}>{children}</MatchContext.Provider>;
}

export function useMatch() {
  const context = useContext(MatchContext);

  if (!context) {
    throw new Error('useMatch must be used within a MatchProvider');
  }

  return context;
}
