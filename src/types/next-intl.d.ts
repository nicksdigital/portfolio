import type { Messages } from 'next-intl';

// Define the structure of your messages
type MessagesStructure = {
  Navbar: {
    home: string;
    about: string;
    experience: string;
    expertise: string;
    projects: string;
    research: string;
    blog: string;
    contact: string;
  };
  Hero: {
    greeting: string;
    title: string;
    subtitle: string;
    description: string;
    cta: string;
    scrollDown?: string;
    contact?: string;
  };
  About: {
    title: string;
    description: string;
    skills: string;
  };
  Experience: {
    title: string;
    viewAll: string;
  };
  Expertise: {
    title: string;
    description: string;
  };
  Projects: {
    title: string;
    viewProject: string;
    viewCode: string;
  };
  Research: {
    title: string;
    viewPaper: string;
  };
  Articles: {
    title: string;
    readMore: string;
    viewAll: string;
  };
  Contact: {
    title: string;
    description: string;
    nameLabel: string;
    emailLabel: string;
    messageLabel: string;
    sendButton: string;
  };
  Footer: {
    copyright: string;
    language: string;
  };
  Blog: {
    title: string;
    readingTime: string;
    publishedOn: string;
    tags: string;
    relatedArticles: string;
  };
};

declare module 'next-intl' {
  // Override the Messages type to use our custom structure
  export function useTranslations<
    NestedKey extends keyof MessagesStructure = undefined
  >(
    namespace?: NestedKey
  ): NestedKey extends keyof MessagesStructure
    ? <K extends keyof MessagesStructure[NestedKey]>(
        key: K,
        params?: Record<string, string | number>,
        options?: { defaultValue?: string }
      ) => string
    : <K extends keyof MessagesStructure>(
        key: K,
        params?: Record<string, string | number>,
        options?: { defaultValue?: string }
      ) => string;
}
