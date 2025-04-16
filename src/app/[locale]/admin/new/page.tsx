'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/navigation';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

export default function NewArticlePage({ params }: { params: { locale: string } }) {
  const t = useTranslations('Admin');
  const router = useRouter();
  const { locale } = params;
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [published, setPublished] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Parse tags
      const tags = tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      // Create the article
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug,
          locale,
          title,
          description,
          content,
          tags,
          published,
          date: new Date().toISOString(),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create article');
      }
      
      // Redirect to the admin dashboard
      router.push(`/${locale}/admin`);
    } catch (error) {
      console.error('Error creating article:', error);
      setError('Failed to create article');
    } finally {
      setSaving(false);
    }
  };

  // Generate a slug from the title
  const handleTitleChange = (value: string) => {
    setTitle(value);
    
    // Only auto-generate slug if it hasn't been manually edited
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(value));
    }
  };

  // Generate a slug from a string
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
      .trim();
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
              New Article
            </h1>
            
            <form onSubmit={handleSubmit} className="glass-card p-8 rounded-lg">
              {error && (
                <div className="mb-6 p-4 bg-red-500/20 text-red-400 rounded">
                  {error}
                </div>
              )}
              
              <div className="mb-6">
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-2 bg-luxury-black/50 border border-luxury-silver/30 rounded focus:outline-none focus:border-luxury-accent"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="slug" className="block text-sm font-medium mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-4 py-2 bg-luxury-black/50 border border-luxury-silver/30 rounded focus:outline-none focus:border-luxury-accent"
                  required
                />
                <p className="text-xs text-luxury-silver mt-1">
                  The URL-friendly version of the title. Will be auto-generated from the title.
                </p>
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
                  {saving ? 'Creating...' : 'Create Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
