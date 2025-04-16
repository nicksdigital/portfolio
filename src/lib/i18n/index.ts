import { en } from './en';
import { fr } from './fr';

export const translations = {
  en,
  fr
};

export type Locale = 'en' | 'fr';
export type Translations = typeof en;