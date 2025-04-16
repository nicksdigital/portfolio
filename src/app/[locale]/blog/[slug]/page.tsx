import { notFound } from 'next/navigation';
import BlogPostClient from '@/components/BlogPostClient';
import { getArticleBySlug } from '@/lib/db/repositories/articleRepository';

interface PageProps {
  params: {
    slug: string;
    locale: string;
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { locale, slug } = params;
  
  try {
    // Fetch the article from the database
    const article = await getArticleBySlug(slug, locale);
    
    // Mock user ID for demonstration purposes
    const userId = 'user-123';

    return (
      <BlogPostClient
        article={article}
        locale={locale}
        userId={userId}
      />
    );
  } catch (error) {
    // If article is not found, return 404
    return notFound();
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = params;
  
  try {
    const article = await getArticleBySlug(slug, locale);
    
    return {
      title: article.title,
      description: article.description || '',
      openGraph: {
        title: article.title,
        description: article.description || '',
        type: 'article',
        publishedTime: article.date.toString(),
        authors: ['Nicolas C.'],
        tags: article.tags,
      },
    };
  } catch (error) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.',
    };
  }
}
