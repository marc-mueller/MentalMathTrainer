import { useState } from 'react';
import { ArrowLeft, BarChart3, BookOpen } from 'lucide-react';
import { SegmentedButton } from './components/common/SegmentedButton';
import { AppHeader } from './components/layout/AppHeader';
import { ModuleSelectionView } from './components/modules/ModuleSelectionView';
import { StatsView } from './components/stats/StatsView';
import { TrainingView } from './components/training/TrainingView';
import { mathModules, localize } from './domain/modules';
import { useLanguage } from './hooks/useLanguage';
import { useStats } from './hooks/useStats';
import { useTrainer } from './hooks/useTrainer';
import type { MathModule, View } from './types';

function App() {
  const { language, setLanguage, t } = useLanguage();
  const { stats, recordAttempt, resetModuleStats, getStatsForModule } = useStats();
  const trainer = useTrainer({ stats, recordAttempt });
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [view, setView] = useState<View>('train');

  const selectedModule = mathModules.find((module) => module.id === selectedModuleId);

  function selectModule(module: MathModule): void {
    setSelectedModuleId(module.id);
    setView('train');
    trainer.startModule(module);
  }

  function returnToModules(): void {
    setSelectedModuleId(null);
  }

  function resetSelectedModuleStats(): void {
    if (!selectedModule || !window.confirm(t.resetConfirm)) return;
    resetModuleStats(selectedModule);
  }

  if (!selectedModule) {
    return (
      <main className="min-h-screen bg-[#f7f4ed] text-slate-950">
        <AppHeader language={language} setLanguage={setLanguage} t={t} />
        <ModuleSelectionView
          getStatsForModule={getStatsForModule}
          language={language}
          modules={mathModules}
          onSelectModule={selectModule}
          t={t}
        />
      </main>
    );
  }

  const selectedModuleStats = getStatsForModule(selectedModule);

  return (
    <main className="min-h-screen bg-[#f7f4ed] text-slate-950">
      <AppHeader language={language} setLanguage={setLanguage} t={t} />
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-4 sm:px-6 md:py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={returnToModules}
              className="grid h-11 w-11 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-100"
              aria-label={t.allModules}
            >
              <ArrowLeft aria-hidden="true" className="h-5 w-5" />
            </button>
            <div>
              <p className="text-sm font-semibold text-teal-700">{localize(selectedModule.shortTitle, language)}</p>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{localize(selectedModule.title, language)}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SegmentedButton
              active={view === 'train'}
              icon={BookOpen}
              label={t.training}
              onClick={() => setView('train')}
            />
            <SegmentedButton
              active={view === 'stats'}
              icon={BarChart3}
              label={t.statistics}
              onClick={() => setView('stats')}
            />
          </div>
        </div>

        {view === 'train' ? (
          <TrainingView
            answer={trainer.answer}
            feedback={trainer.feedback}
            focusMode={trainer.focusMode}
            inputRef={trainer.inputRef}
            module={selectedModule}
            moduleStats={selectedModuleStats}
            problem={trainer.currentProblem}
            session={trainer.session}
            setAnswer={trainer.setAnswer}
            setFocusMode={trainer.setFocusMode}
            submitAnswer={(event) => trainer.submitAnswer(event, selectedModule)}
            t={t}
          />
        ) : (
          <StatsView
            language={language}
            module={selectedModule}
            moduleStats={selectedModuleStats}
            resetModuleStats={resetSelectedModuleStats}
            t={t}
          />
        )}
      </div>
    </main>
  );
}

export default App;
