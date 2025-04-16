import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getReadingTime(text: string) {
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// Add locale parameter for localized formatting
export function formatDateByLocale(date: string | Date, locale: 'en' | 'fr') {
  const d = new Date(date);
  return d.toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}