import type { MathModule, ModuleStats, ProblemStats, StatsRecord } from '../types';

const STATS_KEY = 'mentalMathTrainer.stats.v1';
const defaultProblemStats: ProblemStats = { attempts: 0, correct: 0, wrong: 0 };

function isStatsRecord(value: unknown): value is StatsRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function loadStats(): StatsRecord {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STATS_KEY) ?? '{}');
    return isStatsRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function saveStats(stats: StatsRecord): void {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function recordProblemAttempt(stats: StatsRecord, problemId: string, correct: boolean): StatsRecord {
  return {
    ...stats,
    [problemId]: {
      attempts: (stats[problemId]?.attempts ?? 0) + 1,
      correct: (stats[problemId]?.correct ?? 0) + (correct ? 1 : 0),
      wrong: (stats[problemId]?.wrong ?? 0) + (correct ? 0 : 1),
      lastAnsweredAt: new Date().toISOString(),
    },
  };
}

export function resetStatsForModule(stats: StatsRecord, module: MathModule): StatsRecord {
  const nextStats = { ...stats };

  module.problems.forEach((problem) => {
    delete nextStats[problem.id];
  });

  return nextStats;
}

export function getModuleStats(module: MathModule, stats: StatsRecord): ModuleStats {
  const rows = module.problems.map((problem) => ({
    problem,
    stat: stats[problem.id] ?? defaultProblemStats,
  }));
  const attempts = rows.reduce((sum, row) => sum + row.stat.attempts, 0);
  const correct = rows.reduce((sum, row) => sum + row.stat.correct, 0);
  const wrong = rows.reduce((sum, row) => sum + row.stat.wrong, 0);
  const practiced = rows.filter((row) => row.stat.attempts > 0).length;

  return {
    attempts,
    correct,
    wrong,
    practiced,
    accuracy: attempts === 0 ? 0 : Math.round((correct / attempts) * 100),
    missed: rows
      .filter((row) => row.stat.wrong > 0)
      .sort((a, b) => b.stat.wrong - a.stat.wrong || b.stat.attempts - a.stat.attempts)
      .slice(0, 8),
  };
}
