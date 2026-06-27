import { useMemo, useState } from 'react';
import {
  getModuleStats,
  loadStats,
  recordProblemAttempt,
  resetStatsForModule,
  saveStats,
} from '../domain/stats';
import type { MathModule, StatsRecord } from '../types';

export function useStats() {
  const [stats, setStats] = useState<StatsRecord>(() => loadStats());

  function recordAttempt(problemId: string, correct: boolean): StatsRecord {
    const nextStats = recordProblemAttempt(stats, problemId, correct);
    setStats(nextStats);
    saveStats(nextStats);
    return nextStats;
  }

  function resetModuleStats(module: MathModule): void {
    const nextStats = resetStatsForModule(stats, module);
    setStats(nextStats);
    saveStats(nextStats);
  }

  const getStatsForModule = useMemo(
    () => (module: MathModule) => getModuleStats(module, stats),
    [stats],
  );

  return {
    stats,
    recordAttempt,
    resetModuleStats,
    getStatsForModule,
  };
}
