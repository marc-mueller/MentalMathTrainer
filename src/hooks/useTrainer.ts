import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { isCorrectAnswer } from '../domain/math';
import { chooseProblem } from '../domain/problemSelection';
import type { FeedbackState, MathModule, Problem, SessionStats, StatsRecord } from '../types';

type UseTrainerOptions = {
  stats: StatsRecord;
  recordAttempt: (problemId: string, correct: boolean) => StatsRecord;
};

export function useTrainer({ stats, recordAttempt }: UseTrainerOptions) {
  const [focusMode, setFocusMode] = useState(false);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [session, setSession] = useState<SessionStats>({ correct: 0, wrong: 0 });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  function startModule(module: MathModule): void {
    if (timerRef.current) clearTimeout(timerRef.current);

    setFeedback(null);
    setAnswer('');
    setSession({ correct: 0, wrong: 0 });
    setCurrentProblem(chooseProblem(module.problems, stats, focusMode));
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function submitAnswer(event: FormEvent<HTMLFormElement>, module: MathModule): void {
    event.preventDefault();
    if (!currentProblem || feedback === 'correct') return;

    const correct = isCorrectAnswer(answer, currentProblem.answer);
    const nextStats = recordAttempt(currentProblem.id, correct);

    if (!correct) {
      setFeedback('wrong');
      setSession((current) => ({ ...current, wrong: current.wrong + 1 }));
      setTimeout(() => inputRef.current?.select(), 25);
      return;
    }

    setFeedback('correct');
    setSession((current) => ({ ...current, correct: current.correct + 1 }));
    timerRef.current = setTimeout(() => {
      setCurrentProblem(chooseProblem(module.problems, nextStats, focusMode, currentProblem.id));
      setAnswer('');
      setFeedback(null);
      inputRef.current?.focus();
    }, 650);
  }

  return {
    answer,
    currentProblem,
    feedback,
    focusMode,
    inputRef,
    session,
    setAnswer,
    setFocusMode,
    startModule,
    submitAnswer,
  };
}
