'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { format } from 'date-fns';
// Define the article type for the client component
interface Article {
  id: number;
  slug: string;
  locale: string;
  title: string;
  description: string | null;
  content: string;
  date: Date;
  image: string | null;
  published: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface BlogClientProps {
  articles: Article[];
  locale: string;
}

export default function BlogClient({ articles, locale }: BlogClientProps) {
  const t = useTranslations('Blog');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  // Get reading time in minutes
  const getReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-luxury-black to-luxury-black/90">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
              {t('title')}
            </h1>
            <p className="text-lg md:text-xl text-luxury-silver max-w-3xl mx-auto">
              {t('subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Articles List */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {articles.map((article) => (
              <motion.article
                key={article.slug}
                variants={itemVariants}
                className="glass-card rounded-lg overflow-hidden hover:translate-y-[-5px] transition-transform duration-300"
              >
                <div className="relative h-48 bg-luxury-gray/50 flex items-center justify-center">
                  <span className="text-luxury-accent text-2xl font-semibold">{article.title.charAt(0)}</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-luxury-silver mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {format(new Date(article.date), 'MMM d, yyyy')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {getReadingTime(article.content)} {t('minuteRead')}
                    </span>
                  </div>

                  <h2 className="text-xl font-display font-semibold mb-3">
                    {article.title}
                  </h2>

                  <p className="text-luxury-silver mb-4 line-clamp-3">
                    {article.description}
                  </p>

                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-luxury-accent/10 text-luxury-accent px-2 py-1 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <Link
                    href={`/blog/${article.slug}`}
                    className="inline-flex items-center gap-1 text-luxury-accent hover:text-luxury-accent/80 transition-colors"
                  >
                    {t('readMore')}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
