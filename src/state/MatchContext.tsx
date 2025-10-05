import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import type { MatchType, TeamId } from '#/types/match';

type MatchStatus = 'idle' | 'in-progress' | 'completed';

type TeamState = {
  id: TeamId;
  label: string;
  players: string[];
  score: number;
};

type CourtOrder = [TeamId, TeamId];

type ScoreSnapshot = {
  scores: Record<TeamId, number>;
  servingTeam: TeamId;
  currentGame: number;
  gamesWon: Record<TeamId, number>;
  status: MatchStatus;
  courtOrder: CourtOrder;
  hasSwitchedMidGame: boolean;
  completedGames: CompletedGame[];
};

type CompletedGame = {
  gameNumber: number;
  scores: Record<TeamId, number>;
  winner: TeamId;
};

type MatchState = {
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
      gamesWon: {
        sideA: 0,
        sideB: 0,
      },
      courtOrder: ['sideA', 'sideB'],
      hasSwitchedMidGame: false,
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
      completedGames: [],
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
        currentGame: current.currentGame,
        gamesWon: {
          sideA: current.gamesWon.sideA,
          sideB: current.gamesWon.sideB,
        },
        status: current.status,
        courtOrder: [...current.courtOrder],
        hasSwitchedMidGame: current.hasSwitchedMidGame,
        completedGames: current.completedGames.map((game) => ({
          gameNumber: game.gameNumber,
          scores: {
            sideA: game.scores.sideA,
            sideB: game.scores.sideB,
          },
          winner: game.winner,
        })),
      };

      const opponentId: TeamId = teamId === 'sideA' ? 'sideB' : 'sideA';

      const updatedScores: Record<TeamId, number> = {
        sideA:
          teamId === 'sideA' ? current.teams.sideA.score + 1 : current.teams.sideA.score,
        sideB:
          teamId === 'sideB' ? current.teams.sideB.score + 1 : current.teams.sideB.score,
      };

      let nextCourtOrder: CourtOrder = current.courtOrder;
      let hasSwitchedMidGame = current.hasSwitchedMidGame;

      if (
        !current.hasSwitchedMidGame &&
        current.currentGame === current.totalGames &&
        (updatedScores.sideA === 11 || updatedScores.sideB === 11)
      ) {
        nextCourtOrder = [current.courtOrder[1], current.courtOrder[0]];
        hasSwitchedMidGame = true;
      }

      const winnerScore = updatedScores[teamId];
      const opponentScore = updatedScores[opponentId];
      const hasTwoPointLead = winnerScore >= 21 && winnerScore - opponentScore >= 2;
      const reachedMaxPoint = winnerScore === 30;
      const gameWon = hasTwoPointLead || reachedMaxPoint;

      let currentGame = current.currentGame;
      let gamesWon = { ...current.gamesWon };
      let servingTeam: TeamId = teamId;
      let status: MatchState['status'] = current.status;
      let completedGames = current.completedGames;
      let teams: Record<TeamId, TeamState> = {
        sideA: {
          ...current.teams.sideA,
          score: updatedScores.sideA,
        },
        sideB: {
          ...current.teams.sideB,
          score: updatedScores.sideB,
        },
      };

      if (gameWon) {
        gamesWon = {
          ...gamesWon,
          [teamId]: gamesWon[teamId] + 1,
        };

        completedGames = [
          ...completedGames,
          {
            gameNumber: current.currentGame,
            scores: {
              sideA: updatedScores.sideA,
              sideB: updatedScores.sideB,
            },
            winner: teamId,
          },
        ];

        const gamesNeededToWin = Math.floor(current.totalGames / 2) + 1;
        const matchWon = gamesWon[teamId] >= gamesNeededToWin;

        if (matchWon) {
          status = 'completed';
        } else {
          currentGame = current.currentGame + 1;
          servingTeam = teamId;
          teams = {
            sideA: {
              ...teams.sideA,
              score: 0,
            },
            sideB: {
              ...teams.sideB,
              score: 0,
            },
          };
          nextCourtOrder = [current.courtOrder[1], current.courtOrder[0]];
          hasSwitchedMidGame = false;
        }
      }

      return {
        ...current,
        teams,
        servingTeam,
        currentGame,
        gamesWon,
        status,
        courtOrder: nextCourtOrder,
        hasSwitchedMidGame,
        history: [...current.history, snapshot],
        completedGames,
      };
    });
  }, []);

  const undoLastPoint = useCallback(() => {
    setMatchState((current) => {
      if (current.history.length === 0) {
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
        currentGame: previousSnapshot.currentGame,
        gamesWon: {
          sideA: previousSnapshot.gamesWon.sideA,
          sideB: previousSnapshot.gamesWon.sideB,
        },
        status: previousSnapshot.status,
        courtOrder: previousSnapshot.courtOrder,
        hasSwitchedMidGame: previousSnapshot.hasSwitchedMidGame,
        history: nextHistory,
        completedGames: previousSnapshot.completedGames.map((game) => ({
          gameNumber: game.gameNumber,
          scores: {
            sideA: game.scores.sideA,
            sideB: game.scores.sideB,
          },
          winner: game.winner,
        })),
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
