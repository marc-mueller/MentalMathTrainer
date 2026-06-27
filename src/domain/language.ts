import type { Language } from '../types';

const LANGUAGE_COOKIE = 'mental_math_lang';
const COOKIE_MAX_AGE_SECONDS = 31_536_000;

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1] ?? null;
}

function writeCookie(name: string, value: string): void {
  document.cookie = `${name}=${value}; max-age=${COOKIE_MAX_AGE_SECONDS}; path=/; SameSite=Lax`;
}

export function persistLanguage(language: Language): void {
  writeCookie(LANGUAGE_COOKIE, language);
}

export function getInitialLanguage(): Language {
  const saved = readCookie(LANGUAGE_COOKIE);
  if (saved === 'de' || saved === 'en') return saved;

  const browserLanguage = navigator.language?.toLowerCase().startsWith('de') ? 'de' : 'en';
  persistLanguage(browserLanguage);
  return browserLanguage;
}
