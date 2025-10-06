import { act, renderHook } from '@testing-library/react';

import { MatchProvider, useMatch } from './MatchContext';

describe('MatchProvider scoring', () => {
  const singlesConfig = {
    matchType: 'singles' as const,
    playerNames: {
      sideA: ['Alice', ''] as [string, string],
      sideB: ['Bob', ''] as [string, string],
    },
  };

  it('addPoint increments the team score and records a history snapshot', () => {
    const { result } = renderHook(() => useMatch(), { wrapper: MatchProvider });

    act(() => {
      result.current.startMatch(singlesConfig);
    });

    act(() => {
      result.current.addPoint('sideB');
    });

    expect(result.current.matchState.teams.sideB.score).toBe(1);
    expect(result.current.matchState.teams.sideA.score).toBe(0);
    expect(result.current.matchState.history).toHaveLength(1);
    expect(result.current.matchState.history[0]).toMatchObject({
      scores: { sideA: 0, sideB: 0 },
      servingTeam: 'sideA',
    });
  });

  it('prevents scoring updates when the match has ended', () => {
    const { result } = renderHook(() => useMatch(), { wrapper: MatchProvider });

    act(() => {
      result.current.addPoint('sideA');
    });

    expect(result.current.matchState.status).toBe('idle');
    expect(result.current.matchState.teams.sideA.score).toBe(0);
    expect(result.current.matchState.teams.sideB.score).toBe(0);
    expect(result.current.matchState.history).toHaveLength(0);
  });

  it('switches serving side to the team that wins the rally', () => {
    const { result } = renderHook(() => useMatch(), { wrapper: MatchProvider });

    act(() => {
      result.current.startMatch(singlesConfig);
    });

    expect(result.current.matchState.servingTeam).toBe('sideA');

    act(() => {
      result.current.addPoint('sideB');
    });

    expect(result.current.matchState.servingTeam).toBe('sideB');

    act(() => {
      result.current.addPoint('sideA');
    });

    expect(result.current.matchState.servingTeam).toBe('sideA');
    expect(result.current.matchState.history).toHaveLength(2);
  });
});
