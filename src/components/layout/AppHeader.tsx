import type { Dispatch, SetStateAction } from 'react';
import { Brain, Languages } from 'lucide-react';
import type { TranslationSet } from '../../i18n/copy';
import type { Language } from '../../types';

type AppHeaderProps = {
  language: Language;
  setLanguage: Dispatch<SetStateAction<Language>>;
  t: TranslationSet;
};

export function AppHeader({ language, setLanguage, t }: AppHeaderProps) {
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
