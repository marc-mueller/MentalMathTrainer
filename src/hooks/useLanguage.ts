import { useEffect, useState } from 'react';
import { copy } from '../i18n/copy';
import { getInitialLanguage, persistLanguage } from '../domain/language';
import type { Language } from '../types';

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(() => getInitialLanguage());

  useEffect(() => {
    document.documentElement.lang = language;
    persistLanguage(language);
  }, [language]);

  return {
    language,
    setLanguage,
    t: copy[language],
  };
}
