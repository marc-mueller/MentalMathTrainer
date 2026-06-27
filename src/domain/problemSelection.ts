import type { Problem, StatsRecord } from '../types';

export function chooseProblem(
  problems: Problem[],
  stats: StatsRecord,
  focusMode: boolean,
  previousId?: string,
): Problem {
  const candidates = problems.length > 1 ? problems.filter((problem) => problem.id !== previousId) : problems;
  const hasMissedProblems = candidates.some((problem) => (stats[problem.id]?.wrong ?? 0) > 0);

  if (!focusMode || !hasMissedProblems) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  const weighted = candidates.map((problem) => ({
    problem,
    weight: 1 + (stats[problem.id]?.wrong ?? 0) * 7,
  }));
  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
  let pick = Math.random() * totalWeight;

  for (const item of weighted) {
    pick -= item.weight;
    if (pick <= 0) return item.problem;
  }

  return weighted[weighted.length - 1].problem;
}
