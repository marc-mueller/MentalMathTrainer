import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  ComponentType,
  Dispatch,
  FormEvent,
  ReactNode,
  RefObject,
  SetStateAction,
  SVGProps,
} from 'react';
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Brain,
  Calculator,
  Check,
  Languages,
  RotateCcw,
  Send,
  Shuffle,
  Target,
  Trophy,
  X,
} from 'lucide-react';
import moduleData from './data/modules.json';

const LANG_COOKIE = 'mental_math_lang';
const STATS_KEY = 'mentalMathTrainer.stats.v1';

type Language = 'en' | 'de';
type View = 'train' | 'stats';
type FeedbackState = 'correct' | 'wrong' | null;
type LocalizedText = Record<Language, string>;
type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

type Problem = {
  id: string;
  group: number;
  left: string;
  right: string;
  answer: string;
};

type RawModule = {
  id: string;
  kind: 'explicit' | 'multiplication-grid';
  title: LocalizedText;
  shortTitle: LocalizedText;
  description: LocalizedText;
  source?: string;
  symbol: string;
  problems?: Problem[];
  range?: {
    from: number;
    to: number;
  };
};

type MathModule = Omit<RawModule, 'problems' | 'range'> & {
  problems: Problem[];
  range?: RawModule['range'];
};

type ProblemStats = {
  attempts: number;
  correct: number;
  wrong: number;
  lastAnsweredAt?: string;
};

type StatsRecord = Record<string, ProblemStats>;

type ModuleStats = {
  attempts: number;
  correct: number;
  wrong: number;
  practiced: number;
  accuracy: number;
  missed: Array<{
    problem: Problem;
    stat: ProblemStats;
  }>;
};

type SessionStats = {
  correct: number;
  wrong: number;
};

const copy = {
  en: {
    appName: 'Mental Math Trainer',
    chooseModule: 'Choose a module',
    chooseModuleSub: 'Pick one exercise set and practice one problem at a time.',
    problems: 'Problems',
    practiced: 'Practiced',
    accuracy: 'Accuracy',
    attempts: 'Attempts',
    mistakes: 'Mistakes',
    correct: 'Correct',
    start: 'Start',
    training: 'Training',
    statistics: 'Statistics',
    focusMode: 'Focus weak spots',
    randomMode: 'Random practice',
    answer: 'Answer',
    check: 'Check',
    right: 'Correct',
    wrong: 'Try again',
    nextComing: 'Next problem',
    group: 'Set',
    allModules: 'Modules',
    noStats: 'No answers yet.',
    mostMissed: 'Most missed',
    resetStats: 'Reset module stats',
    resetConfirm: 'Reset statistics for this module?',
    doneToday: 'Session',
    activeFocus: 'Weighted toward mistakes',
    inactiveFocus: 'Uniform random choice',
    language: 'Language',
    emptyWrong: 'No weak spots yet.',
    source: 'Source',
    total: 'Total',
  },
  de: {
    appName: 'Kopfrechen-Trainer',
    chooseModule: 'Modul auswählen',
    chooseModuleSub: 'Wähle eine Übungsreihe und löse eine Aufgabe nach der anderen.',
    problems: 'Aufgaben',
    practiced: 'Geübt',
    accuracy: 'Trefferquote',
    attempts: 'Versuche',
    mistakes: 'Fehler',
    correct: 'Richtig',
    start: 'Start',
    training: 'Training',
    statistics: 'Statistik',
    focusMode: 'Schwierige Aufgaben',
    randomMode: 'Zufällig üben',
    answer: 'Antwort',
    check: 'Prüfen',
    right: 'Richtig',
    wrong: 'Noch einmal',
    nextComing: 'Nächste Aufgabe',
    group: 'Serie',
    allModules: 'Module',
    noStats: 'Noch keine Antworten.',
    mostMissed: 'Häufigste Fehler',
    resetStats: 'Modulstatistik löschen',
    resetConfirm: 'Statistik für dieses Modul löschen?',
    doneToday: 'Runde',
    activeFocus: 'Gewichtet nach Fehlern',
    inactiveFocus: 'Gleichmässig zufällig',
    language: 'Sprache',
    emptyWrong: 'Noch keine schwierigen Aufgaben.',
    source: 'Quelle',
    total: 'Total',
  },
} satisfies Record<Language, Record<string, string>>;

const defaultProblemStats: ProblemStats = { attempts: 0, correct: 0, wrong: 0 };

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1] ?? null;
}

function writeCookie(name: string, value: string): void {
  document.cookie = `${name}=${value}; max-age=31536000; path=/; SameSite=Lax`;
}

function initialLanguage(): Language {
  const saved = readCookie(LANG_COOKIE);
  if (saved === 'de' || saved === 'en') return saved;
  const browserLanguage = navigator.language?.toLowerCase().startsWith('de') ? 'de' : 'en';
  writeCookie(LANG_COOKIE, browserLanguage);
  return browserLanguage;
}

function isStatsRecord(value: unknown): value is StatsRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function loadStats(): StatsRecord {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STATS_KEY) ?? '{}');
    return isStatsRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function saveStats(stats: StatsRecord): void {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function expandModules(modules: RawModule[]): MathModule[] {
  return modules.map((module) => {
    if (module.kind === 'multiplication-grid') {
      if (!module.range) {
        throw new Error(`Module ${module.id} is missing a multiplication range`);
      }
      const problems: Problem[] = [];
      for (let left = module.range.from; left <= module.range.to; left += 1) {
        for (let right = module.range.from; right <= module.range.to; right += 1) {
          problems.push({
            id: `${module.id}-${left}-${right}`,
            group: left,
            left: String(left),
            right: String(right),
            answer: String(left * right),
          });
        }
      }
      return { ...module, problems };
    }
    if (!module.problems) {
      throw new Error(`Module ${module.id} is missing problems`);
    }
    return { ...module, problems: module.problems };
  });
}

function localize(value: LocalizedText | string, language: Language): string {
  if (typeof value === 'string') return value;
  return value?.[language] ?? value?.en ?? '';
}

function displayProblem(module: MathModule, problem: Problem): string {
  return `${problem.left} ${module.symbol} ${problem.right}`;
}

function parseAnswer(value: string): number {
  const normalized = value.trim().replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return Number.NaN;
  return Number(normalized);
}

function isCorrectAnswer(value: string, answer: string): boolean {
  const submitted = parseAnswer(value);
  const expected = Number(answer);
  if (!Number.isFinite(submitted)) return false;
  return Math.abs(submitted - expected) < 0.000000001;
}

function chooseRandom(problems: Problem[], stats: StatsRecord, focusMode: boolean, previousId?: string): Problem {
  const candidates = problems.length > 1 ? problems.filter((problem) => problem.id !== previousId) : problems;
  const missedBefore = candidates.some((problem) => (stats[problem.id]?.wrong ?? 0) > 0);

  if (!focusMode || !missedBefore) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  const weighted = candidates.map((problem) => {
    const wrong = stats[problem.id]?.wrong ?? 0;
    return { problem, weight: 1 + wrong * 7 };
  });
  const total = weighted.reduce((sum, item) => sum + item.weight, 0);
  let pick = Math.random() * total;

  for (const item of weighted) {
    pick -= item.weight;
    if (pick <= 0) return item.problem;
  }
  return weighted[weighted.length - 1].problem;
}

function getModuleStats(module: MathModule, stats: StatsRecord): ModuleStats {
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

function App() {
  const modules = useMemo(() => expandModules(moduleData as RawModule[]), []);
  const [language, setLanguage] = useState<Language>(() => initialLanguage());
  const [stats, setStats] = useState<StatsRecord>(() => loadStats());
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [view, setView] = useState<View>('train');
  const [focusMode, setFocusMode] = useState(false);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [session, setSession] = useState<SessionStats>({ correct: 0, wrong: 0 });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const t = copy[language];
  const selectedModule = modules.find((module) => module.id === selectedModuleId);

  useEffect(() => {
    document.documentElement.lang = language;
    writeCookie(LANG_COOKIE, language);
  }, [language]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  function selectModule(module: MathModule): void {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSelectedModuleId(module.id);
    setView('train');
    setFeedback(null);
    setAnswer('');
    setSession({ correct: 0, wrong: 0 });
    setCurrentProblem(chooseRandom(module.problems, stats, focusMode));
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function updateProblemStats(problemId: string, correct: boolean): StatsRecord {
    const nextStats = {
      ...stats,
      [problemId]: {
        attempts: (stats[problemId]?.attempts ?? 0) + 1,
        correct: (stats[problemId]?.correct ?? 0) + (correct ? 1 : 0),
        wrong: (stats[problemId]?.wrong ?? 0) + (correct ? 0 : 1),
        lastAnsweredAt: new Date().toISOString(),
      },
    };
    setStats(nextStats);
    saveStats(nextStats);
    return nextStats;
  }

  function submitAnswer(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!selectedModule || !currentProblem || feedback === 'correct') return;

    const correct = isCorrectAnswer(answer, currentProblem.answer);
    const nextStats = updateProblemStats(currentProblem.id, correct);

    if (!correct) {
      setFeedback('wrong');
      setSession((current) => ({ ...current, wrong: current.wrong + 1 }));
      setTimeout(() => inputRef.current?.select(), 25);
      return;
    }

    setFeedback('correct');
    setSession((current) => ({ ...current, correct: current.correct + 1 }));
    timerRef.current = setTimeout(() => {
      setCurrentProblem(chooseRandom(selectedModule.problems, nextStats, focusMode, currentProblem.id));
      setAnswer('');
      setFeedback(null);
      inputRef.current?.focus();
    }, 650);
  }

  function resetModuleStats(): void {
    if (!selectedModule || !window.confirm(t.resetConfirm)) return;
    const nextStats = { ...stats };
    selectedModule.problems.forEach((problem) => {
      delete nextStats[problem.id];
    });
    setStats(nextStats);
    saveStats(nextStats);
  }

  if (!selectedModule) {
    return (
      <main className="min-h-screen bg-[#f7f4ed] text-slate-950">
        <AppHeader language={language} setLanguage={setLanguage} t={t} />
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
          {modules.map((module) => {
            const statsForModule = getModuleStats(module, stats);
            return (
              <button
                key={module.id}
                type="button"
                onClick={() => selectModule(module)}
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
                  <Metric label={t.practiced} value={statsForModule.practiced} />
                  <Metric label={t.accuracy} value={`${statsForModule.accuracy}%`} />
                </div>
                <div className="mt-5 flex items-center gap-2 font-semibold text-teal-700">
                  <span>{t.start}</span>
                  <Send aria-hidden="true" className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </section>
      </main>
    );
  }

  const selectedModuleStats = getModuleStats(selectedModule, stats);

  return (
    <main className="min-h-screen bg-[#f7f4ed] text-slate-950">
      <AppHeader language={language} setLanguage={setLanguage} t={t} />
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-4 sm:px-6 md:py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedModuleId(null)}
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
            t={t}
            module={selectedModule}
            problem={currentProblem}
            answer={answer}
            setAnswer={setAnswer}
            feedback={feedback}
            focusMode={focusMode}
            setFocusMode={setFocusMode}
            inputRef={inputRef}
            moduleStats={selectedModuleStats}
            session={session}
            submitAnswer={submitAnswer}
          />
        ) : (
          <StatsView
            t={t}
            language={language}
            module={selectedModule}
            moduleStats={selectedModuleStats}
            resetModuleStats={resetModuleStats}
          />
        )}
      </div>
    </main>
  );
}

type AppHeaderProps = {
  language: Language;
  setLanguage: Dispatch<SetStateAction<Language>>;
  t: typeof copy[Language];
};

function AppHeader({ language, setLanguage, t }: AppHeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-[#f7f4ed]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 text-white">
            <Brain aria-hidden="true" className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">{t.appName}</span>
        </div>
        <div className="flex items-center gap-2" aria-label={t.language}>
          <Languages aria-hidden="true" className="hidden h-4 w-4 text-slate-500 sm:block" />
          {(['de', 'en'] as Language[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setLanguage(option)}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-teal-100 ${
                language === option ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-white hover:text-slate-950'
              }`}
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

function ModuleIcon({ moduleId }: { moduleId: string }) {
  const Icon = moduleId === 'times-1-10' ? Calculator : HashIcon;
  const color = moduleId === 'k12' ? 'bg-cyan-50 text-cyan-700' : moduleId === 'k11' ? 'bg-amber-50 text-amber-700' : 'bg-teal-50 text-teal-700';
  return (
    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg ${color}`}>
      <Icon aria-hidden="true" className="h-6 w-6" />
    </span>
  );
}

function HashIcon(props: SVGProps<SVGSVGElement>) {
  return <Calculator {...props} />;
}

function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-md bg-slate-50 px-3 py-2">
      <div className="text-base font-bold text-slate-950">{value}</div>
      <div className="mt-0.5 text-xs font-medium text-slate-500">{label}</div>
    </div>
  );
}

function SegmentedButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: IconComponent;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-10 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-teal-100 ${
        active ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:text-teal-700'
      }`}
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}

type TrainingViewProps = {
  t: typeof copy[Language];
  module: MathModule;
  problem: Problem | null;
  answer: string;
  setAnswer: Dispatch<SetStateAction<string>>;
  feedback: FeedbackState;
  focusMode: boolean;
  setFocusMode: Dispatch<SetStateAction<boolean>>;
  inputRef: RefObject<HTMLInputElement>;
  moduleStats: ModuleStats;
  session: SessionStats;
  submitAnswer: (event: FormEvent<HTMLFormElement>) => void;
};

function TrainingView({
  t,
  module,
  problem,
  answer,
  setAnswer,
  feedback,
  focusMode,
  setFocusMode,
  inputRef,
  moduleStats,
  session,
  submitAnswer,
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

function Feedback({ feedback, t }: { feedback: FeedbackState; t: typeof copy[Language] }) {
  if (!feedback) {
    return <div className="min-h-8 text-sm font-medium text-slate-500">&nbsp;</div>;
  }

  const isCorrect = feedback === 'correct';
  return (
    <div className={`flex min-h-8 items-center gap-2 text-sm font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
      {isCorrect ? <Check aria-hidden="true" className="h-5 w-5" /> : <X aria-hidden="true" className="h-5 w-5" />}
      <span>{isCorrect ? `${t.right}. ${t.nextComing}.` : t.wrong}</span>
    </div>
  );
}

type StatsViewProps = {
  t: typeof copy[Language];
  language: Language;
  module: MathModule;
  moduleStats: ModuleStats;
  resetModuleStats: () => void;
};

function StatsView({ t, language, module, moduleStats, resetModuleStats }: StatsViewProps) {
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

export default App;
