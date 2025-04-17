'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Article, ArticleFormData, ArticleLayers, Category, Tag } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Save, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import LayerEditor from '@/components/articles/layer-editor';

export default function EditArticlePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const articleId = parseInt(params.id);
  const isNewArticle = params.id === 'new';

  // State for form data
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    slug: '',
    locale: 'en',
    description: '',
    layers: {
      headline: { content: '' },
      context: { content: '' },
      detail: { content: '' },
      discussion: { content: '' }
    },
    published: false,
    featured: false,
    tags: [],
    categories: []
  });

  // State for tag input
  const [tagInput, setTagInput] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState('headline');

  // Fetch article data if editing an existing article
  const { data: article, isLoading: isLoadingArticle } = useQuery({
    queryKey: ['article', articleId],
    queryFn: () => api.articles.getById(articleId).then(res => res.data),
    enabled: !isNewArticle,
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.getAll().then(res => res.data),
  });

  // Update form data when article data is loaded
  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        slug: article.slug,
        locale: article.locale || 'en',
        description: article.description || '',
        layers: article.layers || {
          headline: { content: '' },
          context: { content: '' },
          detail: { content: '' },
          discussion: { content: '' }
        },
        published: article.published,
        featured: article.featured || false,
        tags: article.tags || [],
        categories: article.categories || []
      });
      setSelectedCategories(article.categories || []);
    }
  }, [article]);

  // Create or update article mutation
  const mutation = useMutation({
    mutationFn: (data: ArticleFormData) => {
      if (isNewArticle) {
        return api.articles.create(data).then(res => res.data);
      } else {
        return api.articles.update(articleId, data).then(res => res.data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success(isNewArticle ? 'Article created successfully' : 'Article updated successfully');
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save article');
    }
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle switch changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Handle title change and auto-generate slug
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      title: value,
      // Only auto-generate slug if it's empty or matches the previous auto-generated slug
      slug: !prev.slug || prev.slug === generateSlug(prev.title) 
        ? generateSlug(value) 
        : prev.slug
    }));
  };

  // Handle layer content changes
  const handleLayerChange = (layer: keyof ArticleLayers, content: string) => {
    setFormData(prev => ({
      ...prev,
      layers: {
        ...prev.layers,
        [layer]: { content }
      }
    }));
  };

  // Handle tag input
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  // Handle tag removal
  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag)
    }));
  };

  // Handle category selection
  const handleCategoryChange = (categoryId: number) => {
    const newSelectedCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    
    setSelectedCategories(newSelectedCategories);
    setFormData(prev => ({
      ...prev,
      categories: newSelectedCategories
    }));
  };

  // Loading state
  if (!isNewArticle && isLoadingArticle) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">
            {isNewArticle ? 'Create New Article' : 'Edit Article'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {formData.published ? (
            <Badge className="bg-green-500/20 text-green-500">
              <Eye className="h-3 w-3 mr-1" />
              Published
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              <EyeOff className="h-3 w-3 mr-1" />
              Draft
            </Badge>
          )}
          <Button 
            onClick={handleSubmit} 
            disabled={mutation.isPending}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {mutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Article Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="Article title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="article-slug"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the article"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="locale">Language</Label>
                <Select
                  value={formData.locale}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, locale: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) => handleSwitchChange('published', checked)}
                />
                <Label htmlFor="published">Published</Label>
              </div>
              
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleSwitchChange('featured', checked)}
                />
                <Label htmlFor="featured">Featured</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="headline">Headline</TabsTrigger>
                <TabsTrigger value="context">Context</TabsTrigger>
                <TabsTrigger value="detail">Detail</TabsTrigger>
                <TabsTrigger value="discussion">Discussion</TabsTrigger>
              </TabsList>
              
              <TabsContent value="headline">
                <LayerEditor
                  content={formData.layers.headline.content}
                  onChange={(content) => handleLayerChange('headline', content)}
                  placeholder="Enter headline content..."
                />
              </TabsContent>
              
              <TabsContent value="context">
                <LayerEditor
                  content={formData.layers.context.content}
                  onChange={(content) => handleLayerChange('context', content)}
                  placeholder="Enter context content..."
                />
              </TabsContent>
              
              <TabsContent value="detail">
                <LayerEditor
                  content={formData.layers.detail.content}
                  onChange={(content) => handleLayerChange('detail', content)}
                  placeholder="Enter detail content..."
                />
              </TabsContent>
              
              <TabsContent value="discussion">
                <LayerEditor
                  content={formData.layers.discussion.content}
                  onChange={(content) => handleLayerChange('discussion', content)}
                  placeholder="Enter discussion content..."
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tags & Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tagInput"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTag}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags?.map((tag) => (
                  <Badge key={tag} className="flex items-center gap-1">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Categories</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {categories?.map((category: Category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`category-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryChange(category.id)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
