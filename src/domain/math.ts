import type { MathModule, Problem } from '../types';

export function displayProblem(module: MathModule, problem: Problem): string {
  return `${problem.left} ${module.symbol} ${problem.right}`;
}

export function parseAnswer(value: string): number {
  const normalized = value.trim().replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return Number.NaN;
  return Number(normalized);
}

export function isCorrectAnswer(value: string, answer: string): boolean {
  const submitted = parseAnswer(value);
  const expected = Number(answer);

  if (!Number.isFinite(submitted)) return false;
  return Math.abs(submitted - expected) < 0.000000001;
}
