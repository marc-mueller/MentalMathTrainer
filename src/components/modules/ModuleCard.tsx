import { Send } from 'lucide-react';
import { localize } from '../../domain/modules';
import type { TranslationSet } from '../../i18n/copy';
import type { Language, MathModule, ModuleStats } from '../../types';
import { Metric } from '../common/Metric';
import { ModuleIcon } from './ModuleIcon';

type ModuleCardProps = {
  language: Language;
  module: MathModule;
  moduleStats: ModuleStats;
  onSelect: (module: MathModule) => void;
  t: TranslationSet;
};

export function ModuleCard({ language, module, moduleStats, onSelect, t }: ModuleCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(module)}
      className="group rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-soft focus:outline-none focus:ring-4 focus:ring-teal-100"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950">{localize(module.title, language)}</h2>
          <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{localize(module.description, language)}</p>
        </div>
        <ModuleIcon moduleId={module.id} />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
        <Metric label={t.problems} value={module.problems.length} />
        <Metric label={t.practiced} value={moduleStats.practiced} />
        <Metric label={t.accuracy} value={`${moduleStats.accuracy}%`} />
      </div>
      <div className="mt-5 flex items-center gap-2 font-semibold text-teal-700">
        <span>{t.start}</span>
        <Send aria-hidden="true" className="h-4 w-4 transition group-hover:translate-x-1" />
      </div>
    </button>
  );
}
