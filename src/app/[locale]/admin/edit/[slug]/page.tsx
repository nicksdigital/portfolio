'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/navigation';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

interface Article {
  id: number;
  slug: string;
  locale: string;
  title: string;
  description: string | null;
  content: string;
  date: string;
  image: string | null;
  published: boolean;
  tags: string[];
}

export default function EditArticlePage({ params }: { params: { locale: string; slug: string } }) {
  const t = useTranslations('Admin');
  const router = useRouter();
  const { locale, slug } = params;
  
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [published, setPublished] = useState(true);

  useEffect(() => {
    // Fetch the article from the API
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/articles?slug=${slug}&locale=${locale}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch article');
        }
        
        const data = await response.json();
        setArticle(data);
        
        // Set form values
        setTitle(data.title);
        setDescription(data.description || '');
        setContent(data.content);
        setTagsInput(data.tags.join(', '));
        setPublished(data.published);
      } catch (error) {
        console.error('Error fetching article:', error);
        setError('Failed to fetch article');
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticle();
  }, [slug, locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Parse tags
      const tags = tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      // Update the article
      const response = await fetch(`/api/articles?slug=${slug}&locale=${locale}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          content,
          tags,
          published,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update article');
      }
      
      // Redirect to the admin dashboard
      router.push(`/${locale}/admin`);
    } catch (error) {
      console.error('Error updating article:', error);
      setError('Failed to update article');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-16 bg-gradient-to-b from-luxury-black to-luxury-black/90">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link
              href={`/${locale}/admin`}
              className="inline-flex items-center gap-2 text-luxury-silver hover:text-white transition-colors mb-8"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Edit Article
            </h1>
            
            {loading ? (
              <div className="text-center py-8">
                <p>Loading article...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500">{error}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glass-card p-8 rounded-lg">
                <div className="mb-6">
                  <label htmlFor="title" className="block text-sm font-medium mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 bg-luxury-black/50 border border-luxury-silver/30 rounded focus:outline-none focus:border-luxury-accent"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="description" className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 bg-luxury-black/50 border border-luxury-silver/30 rounded focus:outline-none focus:border-luxury-accent h-24"
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="content" className="block text-sm font-medium mb-2">
                    Content (Markdown)
                  </label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-4 py-2 bg-luxury-black/50 border border-luxury-silver/30 rounded focus:outline-none focus:border-luxury-accent h-96 font-mono"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="tags" className="block text-sm font-medium mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    id="tags"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full px-4 py-2 bg-luxury-black/50 border border-luxury-silver/30 rounded focus:outline-none focus:border-luxury-accent"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="mr-2"
                    />
                    <span>Published</span>
                  </label>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-luxury-accent text-luxury-black rounded hover:bg-luxury-accent/80 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
