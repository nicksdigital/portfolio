'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DashboardStats } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, LineChart, PieChart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DashboardStatsOverview from '@/components/dashboard/stats-overview';
import RecentArticlesTable from '@/components/dashboard/recent-articles-table';
import PopularTagsChart from '@/components/dashboard/popular-tags-chart';

export default function DashboardPage() {
  const router = useRouter();
  
  // Fetch dashboard stats
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.dashboard.getStats();
      return data;
    },
  });
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Error state
  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold mb-4">Failed to load dashboard data</h2>
        <p className="text-muted-foreground mb-6">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={() => router.push('/dashboard/articles/new')}>
          New Article
        </Button>
      </div>
      
      {/* Stats Overview */}
      <DashboardStatsOverview stats={stats} />
      
      {/* Tabs for different views */}
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>Recent Articles</span>
          </TabsTrigger>
          <TabsTrigger value="popular" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            <span>Most Viewed</span>
          </TabsTrigger>
          <TabsTrigger value="tags" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            <span>Popular Tags</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Articles</CardTitle>
              <CardDescription>
                The latest articles added to your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentArticlesTable />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="popular">
          <Card>
            <CardHeader>
              <CardTitle>Most Viewed Articles</CardTitle>
              <CardDescription>
                Your most popular content by view count
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.articles.mostViewed.length > 0 ? (
                <div className="space-y-6">
                  {stats.articles.mostViewed.map((article) => (
                    <div key={article.id} className="flex items-center justify-between">
                      <div className="flex-1 space-y-1">
                        <h3 className="text-lg font-medium">{article.title}</h3>
                        <p className="text-sm text-muted-foreground">{article.slug}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-semibold">
                          {article.viewCount} {article.viewCount === 1 ? 'view' : 'views'}
                        </span>
                        <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/articles/${article.id}`)}>
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No view data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tags">
          <Card>
            <CardHeader>
              <CardTitle>Popular Tags</CardTitle>
              <CardDescription>
                Distribution of tags across your articles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PopularTagsChart tags={stats.tags.mostUsed} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
