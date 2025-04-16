
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import { allArticles } from 'markdownlayer/generated';

export default function Articles() {
  const t = useTranslations('Articles');
  const locale = useLocale();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Filter articles by language and published state and get the latest 3
  const articles = allArticles
    .filter(article => article.locale === locale && article.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section id="articles" className="py-24 bg-luxury-dark relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-luxury-silver/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-luxury-silver/20 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="max-w-6xl mx-auto"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="inline-block text-sm font-medium bg-luxury-accent/20 text-luxury-accent px-3 py-1 rounded-sm mb-4">
              {t('title')}
            </h2>
            <h3 className="text-3xl md:text-4xl font-display font-bold mb-6">
              {t('title')}
            </h3>
            <p className="text-lg text-luxury-silver max-w-3xl mx-auto">
              {t('title', { defaultValue: 'Thoughts and insights on blockchain technology, DeFi, and protocol design.' })}
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-8">
            {articles.map((article) => (
              <article key={article.slug} className="glass-card rounded-lg overflow-hidden hover:translate-y-[-5px] transition-transform duration-300">
                {article.image && (
                  <Link href={article.slug} className="block relative h-48">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover"
                    />
                  </Link>
                )}

                <div className="p-6">
                  <span className="text-sm text-luxury-silver mb-2 block">
                    {format(new Date(article.date), 'MMM d, yyyy')}
                  </span>

                  <Link href={article.slug}>
                    <h4 className="text-xl font-display font-semibold mb-3 hover:text-luxury-accent transition-colors">
                      {article.title}
                    </h4>
                  </Link>

                  <p className="text-luxury-silver mb-4 line-clamp-3">
                    {article.description}
                  </p>

                  <Link
                    href={article.slug}
                    className="inline-flex items-center gap-1 text-luxury-accent hover:text-luxury-accent/80 transition-colors"
                  >
                    {t('readMore')}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-12 text-center"
          >
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-8 py-3 bg-luxury-accent/10 text-luxury-accent border border-luxury-accent/30 rounded-md hover:bg-luxury-accent/20 transition-colors"
            >
              {t('viewAll')}
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}