import { getTranslations } from 'next-intl/server';
import BlogListClient from '@/components/BlogListClient';
import { getArticlesByLocale } from '@/lib/db/repositories/articleRepository';

interface PageProps {
  params: {
    locale: string;
  };
}

// Function to estimate reading time based on content length
function estimateReadingTime(content: string): number {
  // Average reading speed: 200-250 words per minute
  const wordsPerMinute = 225;
  const words = content.trim().split(/\s+/).length;
  const readingTime = Math.ceil(words / wordsPerMinute);
  
  // Minimum reading time of 2 minutes
  return Math.max(2, readingTime);
}

// Function to count layers
function countLayers(layers: any): number {
  let count = 0;
  
  // Check each layer for content
  if (layers.headline && layers.headline.content && layers.headline.content.trim()) count++;
  if (layers.context && layers.context.content && layers.context.content.trim()) count++;
  if (layers.detail && layers.detail.content && layers.detail.content.trim()) count++;
  if (layers.discussion && layers.discussion.content && layers.discussion.content.trim()) count++;
  
  return count;
}

export default async function BlogPage({ params }: PageProps) {
  // Use destructuring in an async function to avoid the warning
  const { locale } = params;
  const t = await getTranslations('Blog');

  // Get articles from the database
  const dbArticles = await getArticlesByLocale(locale);
  
  // Transform database articles to the format expected by BlogListClient
  const articles = dbArticles.map(article => {
    // Calculate reading time based on content length
    const allContent = [
      article.layers.headline?.content || '',
      article.layers.context?.content || '',
      article.layers.detail?.content || '',
      article.layers.discussion?.content || ''
    ].join(' ');
    
    const readingTime = estimateReadingTime(allContent);
    
    // Count how many layers have content
    const layerCount = countLayers(article.layers);
    
    return {
      id: article.id,
      slug: article.slug,
      locale: article.locale,
      title: article.title,
      description: article.description || '',
      date: new Date(article.date),
      tags: article.tags || [],
      layerCount,
      readingTime
    };
  });

  return <BlogListClient articles={articles} locale={locale} title={t('title')} />;
}