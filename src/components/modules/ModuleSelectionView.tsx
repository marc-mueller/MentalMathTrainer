import type { TranslationSet } from '../../i18n/copy';
import type { Language, MathModule, ModuleStats } from '../../types';
import { ModuleCard } from './ModuleCard';

type ModuleSelectionViewProps = {
  getStatsForModule: (module: MathModule) => ModuleStats;
  language: Language;
  modules: MathModule[];
  onSelectModule: (module: MathModule) => void;
  t: TranslationSet;
};

export function ModuleSelectionView({
  getStatsForModule,
  language,
  modules,
  onSelectModule,
  t,
}: ModuleSelectionViewProps) {
  return (
    <>
      <section className="math-grid border-y border-slate-200/80 bg-[#fbfaf6]">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 md:py-12">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">{t.appName}</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">{t.chooseModule}</h1>
            <p className="mt-4 max-w-xl text-lg text-slate-600">{t.chooseModuleSub}</p>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-6 sm:px-6 md:grid-cols-3 md:py-8">
        {modules.map((module) => (
          <ModuleCard
            key={module.id}
            language={language}
            module={module}
            moduleStats={getStatsForModule(module)}
            onSelect={onSelectModule}
            t={t}
          />
        ))}
      </section>
    </>
  );
}
