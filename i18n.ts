import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

// Define the supported locales
export const locales = ['en', 'fr'] as const;
export type Locale = (typeof locales)[number];

// @ts-ignore
export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming locale is supported
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Load the messages for the requested locale
  const messages = (await import(`./messages/${locale}.json`)).default;

  return {
    messages
  };
});
