'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Article } from '@/types';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Edit, Eye, EyeOff } from 'lucide-react';

export default function RecentArticlesTable() {
  const router = useRouter();

  // TEMPORARY: Mock recent articles for development
  const mockArticles: Article[] = [
    {
      id: 1,
      title: 'Getting Started with React',
      slug: 'getting-started-with-react',
      locale: 'en',
      description: 'Learn the basics of React and build your first component',
      layers: {
        headline: { content: '' },
        context: { content: '' },
        detail: { content: '' },
        discussion: { content: '' }
      },
      date: new Date().toISOString(),
      published: true,
      viewCount: 450,
      createdAt: new Date().toISOString(),
      tags: ['React', 'JavaScript', 'Frontend']
    },
    {
      id: 2,
      title: 'Advanced TypeScript Patterns',
      slug: 'advanced-typescript-patterns',
      locale: 'en',
      description: 'Explore advanced TypeScript patterns for better type safety',
      layers: {
        headline: { content: '' },
        context: { content: '' },
        detail: { content: '' },
        discussion: { content: '' }
      },
      date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      published: true,
      viewCount: 320,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      tags: ['TypeScript', 'JavaScript']
    },
    {
      id: 3,
      title: 'Building a Blog with Next.js',
      slug: 'building-blog-nextjs',
      locale: 'en',
      description: 'Step-by-step guide to building a blog with Next.js',
      layers: {
        headline: { content: '' },
        context: { content: '' },
        detail: { content: '' },
        discussion: { content: '' }
      },
      date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      published: true,
      viewCount: 280,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      tags: ['Next.js', 'React']
    },
    {
      id: 4,
      title: 'CSS Grid Layout Mastery',
      slug: 'css-grid-layout-mastery',
      locale: 'en',
      description: 'Master CSS Grid Layout for modern web design',
      layers: {
        headline: { content: '' },
        context: { content: '' },
        detail: { content: '' },
        discussion: { content: '' }
      },
      date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      published: false,
      viewCount: 0,
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      tags: ['CSS', 'Web Design']
    },
  ];

  // Mock loading and error states
  const isLoading = false;
  const error = null;
  const articles = mockArticles;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state
  if (error || !articles) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">
          Failed to load recent articles
        </p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  // Empty state
  if (articles.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">
          No articles found
        </p>
        <Button onClick={() => router.push('/dashboard/articles/new')} className="mt-4">
          Create Your First Article
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Views</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {articles.map((article) => (
          <TableRow key={article.id}>
            <TableCell className="font-medium">
              <div className="truncate max-w-[250px]">
                {article.title}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {article.slug}
              </div>
            </TableCell>
            <TableCell>{format(new Date(article.date), 'MMM d, yyyy')}</TableCell>
            <TableCell>
              {article.published ? (
                <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">
                  <Eye className="h-3 w-3 mr-1" />
                  Published
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  <EyeOff className="h-3 w-3 mr-1" />
                  Draft
                </Badge>
              )}
            </TableCell>
            <TableCell>{article.viewCount || 0}</TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/dashboard/articles/${article.id}`)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
