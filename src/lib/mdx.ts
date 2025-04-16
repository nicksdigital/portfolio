// Mark this file as server-only to prevent it from being imported in client components
'use server';

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { compileMDX } from 'next-mdx-remote/rsc';

// Define the content directory
const contentDirectory = path.join(process.cwd(), 'content');

// Define the article type
export interface Article {
  slug: string;
  locale: string;
  title: string;
  description: string;
  date: string;
  image?: string;
  tags?: string[];
  published: boolean;
  content: string;
}

// Get all article files for a specific locale
export async function getArticlesByLocale(locale: string): Promise<Article[]> {
  const articlesDirectory = path.join(contentDirectory, 'articles', locale);

  // Check if directory exists
  if (!fs.existsSync(articlesDirectory)) {
    return [];
  }

  const files = fs.readdirSync(articlesDirectory);

  const articles = await Promise.all(
    files.map(async (file) => {
      const slug = file.replace(/\.mdx$/, '');
      return await getArticleBySlug(slug, locale);
    })
  );

  // Filter out unpublished articles and sort by date
  return articles
    .filter((article) => article.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Get a specific article by slug and locale
export async function getArticleBySlug(slug: string, locale: string): Promise<Article> {
  const filePath = path.join(contentDirectory, 'articles', locale, `${slug}.mdx`);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`Article not found: ${slug} (${locale})`);
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContent);

  return {
    slug,
    locale,
    title: data.title || '',
    description: data.description || '',
    date: data.date || new Date().toISOString(),
    image: data.image,
    tags: data.tags,
    published: data.published !== false, // Default to true if not specified
    content,
  };
}

// Get all article slugs for a specific locale
export async function getArticleSlugs(locale: string): Promise<string[]> {
  const articlesDirectory = path.join(contentDirectory, 'articles', locale);

  // Check if directory exists
  if (!fs.existsSync(articlesDirectory)) {
    console.warn(`Articles directory for locale '${locale}' does not exist: ${articlesDirectory}`);
    return [];
  }

  const files = fs.readdirSync(articlesDirectory);
  return files
    .filter(file => file.endsWith('.mdx'))
    .map(file => file.replace(/\.mdx$/, ''));
}

// Render MDX content with components
export async function renderMDX(content: string) {
  const { content: renderedContent } = await compileMDX({
    source: content,
    options: { parseFrontmatter: true },
  });

  return renderedContent;
}

// Get reading time in minutes
export async function getReadingTime(text: string): Promise<number> {
  const wordsPerMinute = 200;
  const words = text.split(/\\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}
