'use client';

/**
 * Changelog Page
 * Displays version history and feature updates
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Sparkles, Shield, Zap, TrendingUp } from 'lucide-react';

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  type: 'major' | 'minor' | 'patch';
  changes: {
    category: 'features' | 'improvements' | 'fixes' | 'security';
    items: string[];
  }[];
}

const changelog: ChangelogEntry[] = [
  {
    version: '1.0.0',
    date: 'January 22, 2026',
    title: 'Analytics & Production Ready',
    type: 'major',
    changes: [
      {
        category: 'features',
        items: [
          'Privacy-first analytics system',
          'Web Vitals tracking and monitoring',
          'Analytics dashboard with engagement metrics',
          'CI/CD pipeline with GitHub Actions',
          'Comprehensive deployment documentation',
        ],
      },
      {
        category: 'improvements',
        items: [
          'Enhanced performance monitoring',
          'Optimized database queries',
          'Improved caching strategies',
          'Better error handling and logging',
        ],
      },
    ],
  },
  {
    version: '0.9.0',
    date: 'January 11, 2026',
    title: 'Phase 7 & 8: UI/UX Polish & Security',
    type: 'minor',
    changes: [
      {
        category: 'features',
        items: [
          '8 premium themes with smooth transitions',
          'Framer Motion animation library',
          'Premium skeleton loading states',
          'Toast notification system',
          'WCAG 2.1 AA accessibility compliance',
        ],
      },
      {
        category: 'security',
        items: [
          'Enhanced security with Better-Auth',
          'GDPR compliance implementation',
          'Cookie consent management',
          'Secure session handling',
        ],
      },
    ],
  },
  {
    version: '0.8.0',
    date: 'December 2025',
    title: 'Authentication & Database',
    type: 'minor',
    changes: [
      {
        category: 'features',
        items: [
          'Better-Auth integration',
          'MongoDB database with Prisma',
          'User profiles and preferences',
          'Projects feature for multi-source research',
          'Search history tracking',
        ],
      },
      {
        category: 'improvements',
        items: [
          'Multi-model AI support',
          'Enhanced state management',
          'Improved data persistence',
        ],
      },
    ],
  },
  {
    version: '0.7.0',
    date: 'November 2025',
    title: 'Core Features',
    type: 'minor',
    changes: [
      {
        category: 'features',
        items: [
          'AI-powered offer analysis',
          'Smart offer organization',
          'Side-by-side comparison',
          'Offer saving and tagging',
          'Dark/Light theme toggle',
        ],
      },
    ],
  },
];

const categoryIcons = {
  features: <Sparkles className="h-4 w-4" />,
  improvements: <TrendingUp className="h-4 w-4" />,
  fixes: <CheckCircle2 className="h-4 w-4" />,
  security: <Shield className="h-4 w-4" />,
};

const categoryColors = {
  features: 'bg-blue-500/10 text-blue-500',
  improvements: 'bg-green-500/10 text-green-500',
  fixes: 'bg-yellow-500/10 text-yellow-500',
  security: 'bg-red-500/10 text-red-500',
};

const typeColors = {
  major: 'bg-purple-500 text-white',
  minor: 'bg-blue-500 text-white',
  patch: 'bg-gray-500 text-white',
};

export default function ChangelogPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <Zap className="h-8 w-8 text-primary" />
          Changelog
        </h1>
        <p className="text-muted-foreground text-lg">
          Track new features, improvements, and bug fixes
        </p>
      </div>

      <div className="space-y-6">
        {changelog.map((entry) => (
          <Card key={entry.version} className="overflow-hidden">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-2xl">
                      v{entry.version}
                    </CardTitle>
                    <Badge className={typeColors[entry.type]}>
                      {entry.type.toUpperCase()}
                    </Badge>
                  </div>
                  <CardDescription className="text-base">
                    {entry.title}
                  </CardDescription>
                </div>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {entry.date}
                </span>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="space-y-6">
                {entry.changes.map((change, idx) => (
                  <div key={idx}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`p-1.5 rounded ${categoryColors[change.category]}`}>
                        {categoryIcons[change.category]}
                      </div>
                      <h3 className="font-semibold capitalize">
                        {change.category}
                      </h3>
                    </div>
                    <ul className="space-y-2 ml-8">
                      {change.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-6 bg-muted/30 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Stay Updated</h2>
        <p className="text-sm text-muted-foreground">
          Follow our{' '}
          <a
            href="https://github.com/Cism-Ch/OfferAnalyst"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            GitHub repository
          </a>{' '}
          for the latest updates and release notes.
        </p>
      </div>
    </div>
  );
}
