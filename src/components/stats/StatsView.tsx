import { RotateCcw, Trophy } from 'lucide-react';
import { displayProblem } from '../../domain/math';
import { localize } from '../../domain/modules';
import type { TranslationSet } from '../../i18n/copy';
import type { Language, MathModule, ModuleStats } from '../../types';
import { Metric } from '../common/Metric';

type StatsViewProps = {
  language: Language;
  module: MathModule;
  moduleStats: ModuleStats;
  resetModuleStats: () => void;
  t: TranslationSet;
};

export function StatsView({ language, module, moduleStats, resetModuleStats, t }: StatsViewProps) {
  return (
    <section className="safe-bottom grid gap-5 lg:grid-cols-[1fr_360px]">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t.statistics}</h2>
            <p className="mt-1 text-sm text-slate-500">{localize(module.description, language)}</p>
          </div>
          <Trophy aria-hidden="true" className="h-8 w-8 text-amber-600" />
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <Metric label={t.total} value={module.problems.length} />
          <Metric label={t.practiced} value={moduleStats.practiced} />
          <Metric label={t.attempts} value={moduleStats.attempts} />
          <Metric label={t.accuracy} value={`${moduleStats.accuracy}%`} />
        </div>

        <div className="mt-7">
          <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">{t.mostMissed}</h3>
          {moduleStats.missed.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-slate-300 p-5 text-sm font-medium text-slate-500">{t.emptyWrong}</p>
          ) : (
            <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
              {moduleStats.missed.map(({ problem, stat }) => (
                <div key={problem.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0">
                  <div className="min-w-0">
                    <div className="truncate text-lg font-bold">{displayProblem(module, problem)} = {problem.answer}</div>
                    <div className="text-xs font-medium text-slate-500">{t.group} {problem.group}</div>
                  </div>
                  <Metric label={t.mistakes} value={stat.wrong} />
                  <Metric label={t.attempts} value={stat.attempts} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <aside className="grid gap-3 content-start">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">{t.source}</h3>
          <p className="mt-3 text-sm font-medium leading-6 text-slate-700">{module.source ?? localize(module.description, language)}</p>
        </div>
        <button
          type="button"
          onClick={resetModuleStats}
          className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-50 focus:outline-none focus:ring-4 focus:ring-rose-100"
        >
          <RotateCcw aria-hidden="true" className="h-4 w-4" />
          <span>{t.resetStats}</span>
        </button>
      </aside>
    </section>
  );
}
