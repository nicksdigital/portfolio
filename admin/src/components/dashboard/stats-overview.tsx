'use client';

import { DashboardStats } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Eye, Tag, Users } from 'lucide-react';

interface StatsOverviewProps {
  stats: DashboardStats;
}

export default function DashboardStatsOverview({ stats }: StatsOverviewProps) {
  const statCards = [
    {
      title: 'Total Articles',
      value: stats.articles.total,
      description: `${stats.articles.published} published`,
      icon: FileText,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Views',
      value: stats.articles.views,
      description: 'Across all articles',
      icon: Eye,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Tags Used',
      value: stats.tags.total,
      description: 'Unique content tags',
      icon: Tag,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Users',
      value: stats.users.total,
      description: 'Admin & authors',
      icon: Users,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">{card.title}</CardTitle>
            <div className={`p-2 rounded-full ${card.bgColor}`}>
              <card.icon className={`h-5 w-5 ${card.iconColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{card.value.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
