'use client';

import { Link } from '@/navigation';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { FaLayerGroup } from 'react-icons/fa6';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { format } from 'date-fns';

interface Article {
  id: number;
  slug: string;
  locale: string;
  title: string;
  description: string;
  date: Date;
  tags: string[];
  layerCount: number;
  readingTime: number;
}

interface BlogListClientProps {
  articles: Article[];
  locale: string;
  title: string;
}

export default function BlogListClient({ articles, locale, title }: BlogListClientProps) {
  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-16 bg-gradient-to-b from-luxury-black to-luxury-black/90">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
              {title}
            </h1>
            <p className="text-lg md:text-xl text-luxury-silver max-w-3xl mx-auto">
              Explore our multi-layered articles on blockchain technology, protocol design, and decentralized systems.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <div key={article.id} className="glass-card rounded-lg overflow-hidden hover:translate-y-[-5px] transition-transform duration-300">
                <div className="relative h-48 bg-luxury-gray/50 flex items-center justify-center">
                  <span className="text-luxury-accent text-2xl font-semibold">{article.title.charAt(0)}</span>
                  <div className="absolute top-3 right-3 bg-luxury-black/70 rounded-full p-2">
                    <FaLayerGroup size={16} className="text-luxury-accent" />
                    <span className="absolute -bottom-1 -right-1 bg-luxury-accent text-luxury-black text-xs w-4 h-4 rounded-full flex items-center justify-center">{article.layerCount}</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-luxury-silver mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {format(new Date(article.date), 'MMM d, yyyy')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {article.readingTime} min read
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
                    Read More
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
