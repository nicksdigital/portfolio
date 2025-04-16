'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

interface Article {
  id: number;
  slug: string;
  locale: string;
  title: string;
  published: boolean;
  date: string;
}

export default function AdminPage({ params }: { params: { locale: string } }) {
  const t = useTranslations('Admin');
  const locale = params.locale;
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch articles from the API
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/articles?locale=${locale}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }
        
        const data = await response.json();
        setArticles(data);
      } catch (error) {
        console.error('Error fetching articles:', error);
        setError('Failed to fetch articles');
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticles();
  }, [locale]);

  const handleDeleteArticle = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this article?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/articles?slug=${slug}&locale=${locale}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete article');
      }
      
      // Remove the article from the list
      setArticles(articles.filter(article => article.slug !== slug));
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Failed to delete article');
    }
  };

  const handleTogglePublished = async (slug: string, published: boolean) => {
    try {
      const response = await fetch(`/api/articles?slug=${slug}&locale=${locale}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ published: !published }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update article');
      }
      
      // Update the article in the list
      setArticles(articles.map(article => {
        if (article.slug === slug) {
          return { ...article, published: !published };
        }
        return article;
      }));
    } catch (error) {
      console.error('Error updating article:', error);
      alert('Failed to update article');
    }
  };

  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-16 bg-gradient-to-b from-luxury-black to-luxury-black/90">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Admin Dashboard
            </h1>
            
            <div className="flex justify-between items-center mb-8">
              <p className="text-lg text-luxury-silver">
                Manage your articles
              </p>
              
              <Link
                href="/admin/new"
                className="px-4 py-2 bg-luxury-accent text-luxury-black rounded hover:bg-luxury-accent/80 transition-colors"
              >
                New Article
              </Link>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <p>Loading articles...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500">{error}</p>
              </div>
            ) : (
              <div className="glass-card rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-luxury-silver/20">
                      <th className="px-4 py-3 text-left">Title</th>
                      <th className="px-4 py-3 text-left">Slug</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-luxury-silver">
                          No articles found
                        </td>
                      </tr>
                    ) : (
                      articles.map((article) => (
                        <tr key={article.id} className="border-b border-luxury-silver/10 hover:bg-luxury-black/30">
                          <td className="px-4 py-3">{article.title}</td>
                          <td className="px-4 py-3">{article.slug}</td>
                          <td className="px-4 py-3">{new Date(article.date).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs ${
                                article.published
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {article.published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleTogglePublished(article.slug, article.published)}
                                className="px-2 py-1 text-xs bg-luxury-gray/50 rounded hover:bg-luxury-gray/80 transition-colors"
                              >
                                {article.published ? 'Unpublish' : 'Publish'}
                              </button>
                              <Link
                                href={`/admin/edit/${article.slug}`}
                                className="px-2 py-1 text-xs bg-luxury-accent/20 text-luxury-accent rounded hover:bg-luxury-accent/30 transition-colors"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => handleDeleteArticle(article.slug)}
                                className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
