'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Edit, Eye, EyeOff, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function ArticlesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);

  // Fetch articles
  const { data: articles, isLoading, error } = useQuery({
    queryKey: ['articles'],
    queryFn: () => api.articles.getAll().then(res => res.data),
  });

  // Delete article mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.articles.delete(id).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success('Article deleted successfully');
      setDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete article');
    }
  });

  // Toggle article published status
  const togglePublishMutation = useMutation({
    mutationFn: ({ id, published }: { id: number; published: boolean }) => 
      api.articles.update(id, { published }).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success('Article status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update article status');
    }
  });

  // Handle delete confirmation
  const confirmDelete = (article: Article) => {
    setArticleToDelete(article);
    setDeleteDialogOpen(true);
  };

  // Handle delete action
  const handleDelete = () => {
    if (articleToDelete) {
      deleteMutation.mutate(articleToDelete.id);
    }
  };

  // Handle toggle publish
  const handleTogglePublish = (article: Article) => {
    togglePublishMutation.mutate({
      id: article.id,
      published: !article.published
    });
  };

  // Filter articles by search term
  const filteredArticles = articles?.filter(article => 
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <h2 className="text-2xl font-bold mb-4">Failed to load articles</h2>
        <p className="text-muted-foreground mb-6">
          {(error as any).message || 'An unknown error occurred'}
        </p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['articles'] })}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Articles</h1>
        <Button onClick={() => router.push('/dashboard/articles/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Article
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Articles</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredArticles?.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                {searchTerm ? 'No articles match your search' : 'No articles found'}
              </p>
              <Button onClick={() => router.push('/dashboard/articles/new')} className="mt-4">
                Create Your First Article
              </Button>
            </div>
          ) : (
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
                {filteredArticles?.map((article) => (
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
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTogglePublish(article)}
                          disabled={togglePublishMutation.isPending}
                        >
                          {article.published ? 'Unpublish' : 'Publish'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/articles/${article.id}`)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => confirmDelete(article)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the article "{articleToDelete?.title}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
