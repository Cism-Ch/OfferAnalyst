'use client';

/**
 * Analytics Dashboard Component
 * Displays user analytics and engagement metrics
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PremiumCard } from '@/components/ui/premium-card';
import { BarChart3, TrendingUp, Search, Save, FolderOpen, Zap } from 'lucide-react';

interface AnalyticsData {
  period: string;
  searches: number;
  savedOffers: number;
  projects: number;
  apiCallsUsed: number;
}

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
  trend?: number;
}

function MetricCard({ title, value, icon, description, trend }: MetricCardProps) {
  return (
    <PremiumCard className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {trend !== undefined && (
            <div className={`flex items-center text-xs ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {trend >= 0 ? '+' : ''}{trend}% vs last period
            </div>
          )}
        </div>
        <div className="text-muted-foreground opacity-50">
          {icon}
        </div>
      </div>
    </PremiumCard>
  );
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // For now, load from localStorage saved data
      // In production, this would call an API endpoint
      const searches = JSON.parse(localStorage.getItem('searchHistory') || '[]').length;
      const savedOffers = JSON.parse(localStorage.getItem('savedOffers') || '[]').length;
      const projects = JSON.parse(localStorage.getItem('projects') || '[]').length;

      setAnalytics({
        period: '30 days',
        searches,
        savedOffers,
        projects,
        apiCallsUsed: searches * 2, // Estimate: fetch + analyze
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-20" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics Unavailable</CardTitle>
          <CardDescription>Unable to load analytics data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Your Analytics</h2>
        <p className="text-muted-foreground">
          Activity overview for the last {analytics.period}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Searches"
          value={analytics.searches}
          icon={<Search className="h-8 w-8" />}
          description="Total searches performed"
        />
        <MetricCard
          title="Saved Offers"
          value={analytics.savedOffers}
          icon={<Save className="h-8 w-8" />}
          description="Offers saved for later"
        />
        <MetricCard
          title="Projects"
          value={analytics.projects}
          icon={<FolderOpen className="h-8 w-8" />}
          description="Active projects"
        />
        <MetricCard
          title="API Calls"
          value={analytics.apiCallsUsed}
          icon={<Zap className="h-8 w-8" />}
          description="Estimated API usage"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Engagement Insights
          </CardTitle>
          <CardDescription>
            Your platform usage patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Searches</span>
              <span className="font-medium">{analytics.searches}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-all"
                style={{ width: `${Math.min((analytics.searches / 10) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Saved Offers</span>
              <span className="font-medium">{analytics.savedOffers}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-green-500 rounded-full h-2 transition-all"
                style={{ width: `${Math.min((analytics.savedOffers / 20) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Projects</span>
              <span className="font-medium">{analytics.projects}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-blue-500 rounded-full h-2 transition-all"
                style={{ width: `${Math.min((analytics.projects / 5) * 100, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
