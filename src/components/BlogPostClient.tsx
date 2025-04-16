'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { format } from 'date-fns';
import LayerBlog from '@/components/blog/LayerBlog';
// Define the article type for the client component
interface Article {
  id: number;
  slug: string;
  locale: string;
  title: string;
  description: string | null;
  layers?: {
    headline: { content: string };
    context: { content: string };
    detail: { content: string };
    discussion: { content: string };
  };
  content?: string;
  date: Date;
  image: string | null;
  published: boolean;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface BlogPostClientProps {
  article: Article;
  locale: string;
  userId?: string;
}

export default function BlogPostClient({ article, locale, userId = 'anonymous' }: BlogPostClientProps) {
  const t = useTranslations('Blog');

  // Get reading time in minutes
  const getReadingTime = (text: string = '') => {
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  // Check if we should use the layer blog or the regular blog
  const useLayers = article.layers && Object.keys(article.layers).length > 0;

  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="pt-16 pb-4">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-luxury-silver hover:text-white transition-colors mb-8"
            >
              <ArrowLeft size={16} />
              Back to Blog
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
                {article.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-luxury-silver mb-4">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {t('publishedOn', { date: format(new Date(article.date), 'MMMM d, yyyy') })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {t('readingTime', { minutes: getReadingTime(article.content || '') })}
                </span>
              </div>

              {article.image ? (
                <div className="relative h-64 w-full rounded-lg overflow-hidden mb-4 bg-luxury-gray/50 flex items-center justify-center">
                  <span className="text-luxury-accent text-4xl font-semibold">{article.title.charAt(0)}</span>
                </div>
              ) : (
                <div className="relative h-64 w-full rounded-lg overflow-hidden mb-4 bg-luxury-gray/50 flex items-center justify-center">
                  <span className="text-luxury-accent text-4xl font-semibold">{article.title.charAt(0)}</span>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {useLayers ? (
              <LayerBlog
                articleId={article.id}
                articleSlug={article.slug}
                articleLocale={article.locale}
                layers={article.layers!}
                userId={userId}
              />
            ) : article.content ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="glass-card p-8 rounded-lg mb-8"
              >
                <div className="prose prose-invert prose-lg max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: article.content }} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="glass-card p-8 rounded-lg mb-8"
              >
                <div className="prose prose-invert prose-lg max-w-none">
                  <p>No content available for this article.</p>
                </div>
              </motion.div>
            )}

            {article.tags && article.tags.length > 0 && (
              <div className="mb-16">
                <h3 className="text-xl font-semibold mb-4">{t('tags')}</h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="bg-luxury-accent/10 text-luxury-accent px-3 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
