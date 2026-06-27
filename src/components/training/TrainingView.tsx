import type { Dispatch, FormEvent, RefObject, SetStateAction } from 'react';
import { Send, Shuffle, Target } from 'lucide-react';
import { displayProblem } from '../../domain/math';
import type { TranslationSet } from '../../i18n/copy';
import type { FeedbackState, MathModule, ModuleStats, Problem, SessionStats } from '../../types';
import { Metric } from '../common/Metric';
import { Feedback } from './Feedback';

type TrainingViewProps = {
  answer: string;
  feedback: FeedbackState;
  focusMode: boolean;
  inputRef: RefObject<HTMLInputElement>;
  module: MathModule;
  moduleStats: ModuleStats;
  problem: Problem | null;
  session: SessionStats;
  setAnswer: Dispatch<SetStateAction<string>>;
  setFocusMode: Dispatch<SetStateAction<boolean>>;
  submitAnswer: (event: FormEvent<HTMLFormElement>) => void;
  t: TranslationSet;
};

export function TrainingView({
  answer,
  feedback,
  focusMode,
  inputRef,
  module,
  moduleStats,
  problem,
  session,
  setAnswer,
  setFocusMode,
  submitAnswer,
  t,
}: TrainingViewProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <section className="math-grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/85 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <Shuffle aria-hidden="true" className="h-4 w-4 text-teal-700" />
            <span>{focusMode ? t.activeFocus : t.inactiveFocus}</span>
          </div>
          <button
            type="button"
            onClick={() => setFocusMode((current) => !current)}
            className={`flex min-h-10 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-teal-100 ${
              focusMode ? 'bg-teal-700 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:border-teal-300'
            }`}
          >
            <Target aria-hidden="true" className="h-4 w-4" />
            <span>{focusMode ? t.focusMode : t.randomMode}</span>
          </button>
        </div>

        <div className="flex min-h-[520px] flex-col justify-center px-4 py-8 sm:px-8 lg:px-12">
          {problem && (
            <div className="mx-auto w-full max-w-2xl">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-slate-500">
                <span>{t.group} {problem.group}</span>
                <span>{module.problems.length} {t.problems}</span>
              </div>
              <div className="rounded-lg border border-slate-200 bg-[#fbfaf6] p-5 shadow-sm sm:p-8">
                <div className="text-center text-5xl font-bold tracking-normal text-slate-950 sm:text-7xl">
                  {displayProblem(module, problem)}
                </div>
                <form onSubmit={submitAnswer} className="mx-auto mt-8 flex max-w-md flex-col gap-3">
                  <label className="text-sm font-semibold text-slate-600" htmlFor="answer-input">
                    {t.answer}
                  </label>
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      id="answer-input"
                      value={answer}
                      onChange={(event) => setAnswer(event.target.value)}
                      inputMode="decimal"
                      pattern="[0-9]*[.,]?[0-9]*"
                      autoComplete="off"
                      autoCorrect="off"
                      className={`min-h-14 min-w-0 flex-1 rounded-lg border bg-white px-4 text-2xl font-bold shadow-sm outline-none transition focus:ring-4 ${
                        feedback === 'wrong'
                          ? 'border-rose-400 focus:ring-rose-100'
                          : feedback === 'correct'
                            ? 'border-emerald-400 focus:ring-emerald-100'
                            : 'border-slate-300 focus:border-teal-500 focus:ring-teal-100'
                      }`}
                    />
                    <button
                      type="submit"
                      className="grid min-h-14 w-16 place-items-center rounded-lg bg-slate-950 text-white transition hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={!answer.trim() || feedback === 'correct'}
                      aria-label={t.check}
                    >
                      <Send aria-hidden="true" className="h-5 w-5" />
                    </button>
                  </div>
                  <Feedback feedback={feedback} t={t} />
                </form>
              </div>
            </div>
          )}
        </div>
      </section>

      <aside className="grid gap-3 lg:content-start">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">{t.doneToday}</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Metric label={t.correct} value={session.correct} />
            <Metric label={t.mistakes} value={session.wrong} />
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">{t.statistics}</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Metric label={t.practiced} value={`${moduleStats.practiced}/${module.problems.length}`} />
            <Metric label={t.accuracy} value={`${moduleStats.accuracy}%`} />
            <Metric label={t.attempts} value={moduleStats.attempts} />
            <Metric label={t.mistakes} value={moduleStats.wrong} />
          </div>
        </div>
      </aside>
    </div>
  );
}
