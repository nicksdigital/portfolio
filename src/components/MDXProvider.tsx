'use client';

import { useTranslations } from 'next-intl';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { ReactNode } from 'react';

// Define custom components that can access translations
const components = {
  // Example of a custom component that uses translations
  TranslatedHeading: ({ children }: { children: ReactNode }) => {
    const t = useTranslations('Blog');
    return <h2 className="text-2xl font-bold mb-4">{String(children)}</h2>;
  },
  // Add more custom components as needed
};

export default function MDXProvider({ source }: { source: string }) {
  return <MDXRemote source={source} components={components} />;
}
