import { ar } from './locales/ar';
import { en } from './locales/en';
import { ms } from './locales/ms';
import { ur } from './locales/ur';
import { id } from './locales/id';
import { fr } from './locales/fr';

export const locales = {
  ar,
  en,
  ms,
  ur,
  id,
  fr,
};

export type LocaleKey = keyof typeof locales;

export interface Language {
  code: LocaleKey;
  name: string;
  nativeName: string;
  dir: 'rtl' | 'ltr';
}

export const languages: Language[] = [
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'ms', name: 'Malay', nativeName: 'Melayu', dir: 'ltr' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', dir: 'rtl' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr' },
];

export const getLanguageByCode = (code: LocaleKey): Language => {
  return languages.find(lang => lang.code === code) || languages[0];
};

export const getTranslations = (code: LocaleKey) => {
  return locales[code] || locales.ar;
};
