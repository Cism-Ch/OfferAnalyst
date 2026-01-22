'use client';

/**
 * Help Center Page
 * FAQ and troubleshooting guides
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, HelpCircle, BookOpen, Zap, Key, Settings, AlertCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'api' | 'troubleshooting' | 'features';
}

const faqs: FAQItem[] = [
  // General
  {
    category: 'general',
    question: 'Is OfferAnalyst free to use?',
    answer: 'Yes! OfferAnalyst is free forever. You can use our shared AI models with rate limits, or bring your own API key (BYOK) for unlimited usage.',
  },
  {
    category: 'general',
    question: 'What AI models are supported?',
    answer: 'We support all OpenRouter models including GPT-4, Claude 3.5, Gemini 2.0, Llama 3, and many more. Check the model selector in the dashboard for the full list.',
  },
  {
    category: 'general',
    question: 'How is my data stored?',
    answer: 'Your data is stored locally in your browser (localStorage) by default. When you create an account, data is synced to our secure MongoDB database with encryption.',
  },
  {
    category: 'general',
    question: 'Is my data private?',
    answer: 'Absolutely! We follow privacy-first principles. No external analytics SaaS. All tracking is internal, anonymous, and GDPR compliant. We never sell your data.',
  },

  // API Keys
  {
    category: 'api',
    question: 'Do I need an API key?',
    answer: 'No, but it\'s recommended. Without your own key, you\'ll use our shared AI models with rate limits. With your own OpenRouter key, you get unlimited usage.',
  },
  {
    category: 'api',
    question: 'How do I get an OpenRouter API key?',
    answer: 'Visit https://openrouter.ai/keys, sign up or log in, create a new API key, and add it in Settings → API Keys. OpenRouter gives you access to 100+ AI models.',
  },
  {
    category: 'api',
    question: 'Are my API keys secure?',
    answer: 'Yes. Keys are encrypted (bcrypt) before storage and never exposed in client-side code. We use industry-standard security practices.',
  },
  {
    category: 'api',
    question: 'Can I use multiple API keys?',
    answer: 'Yes! You can add multiple keys for different providers (OpenRouter, Google, Anthropic) and switch between them as needed.',
  },

  // Troubleshooting
  {
    category: 'troubleshooting',
    question: 'I\'m getting "Rate limit exceeded" errors',
    answer: 'You\'ve hit the rate limit for shared models. Solutions: 1) Wait a few minutes before trying again, or 2) Add your own API key in Settings for unlimited usage.',
  },
  {
    category: 'troubleshooting',
    question: 'Search returns no results',
    answer: 'Try: 1) Broadening your search criteria, 2) Checking domain spelling, 3) Ensuring the domain has searchable content, 4) Using a different AI model (try Gemini 2.0 Flash).',
  },
  {
    category: 'troubleshooting',
    question: 'Offers are not loading',
    answer: 'Check: 1) Internet connection, 2) API key validity (if using BYOK), 3) Browser console for errors, 4) Try refreshing the page or clearing cache.',
  },
  {
    category: 'troubleshooting',
    question: 'Theme is not persisting',
    answer: 'Enable cookies and localStorage in your browser settings. Some privacy extensions may block localStorage.',
  },

  // Features
  {
    category: 'features',
    question: 'How does auto-fetch work?',
    answer: 'When enabled, auto-fetch automatically searches the web for offers before analysis. When disabled, you can paste JSON offers manually.',
  },
  {
    category: 'features',
    question: 'What is Smart Organize?',
    answer: 'Smart Organize uses AI to categorize your saved offers into timelines (e.g., urgent, consideration, long-term) based on your criteria.',
  },
  {
    category: 'features',
    question: 'How do I compare offers?',
    answer: 'Go to Saved Offers, select 2-3 offers using checkboxes, then click &quot;Compare Selected&quot;. You\'ll see a side-by-side comparison with scores.',
  },
  {
    category: 'features',
    question: 'What are Projects?',
    answer: 'Projects let you organize multi-source research. Create a project, add different search sources, and track everything in one place.',
  },
];

const categories = [
  { id: 'all', label: 'All Topics', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'general', label: 'General', icon: <HelpCircle className="h-4 w-4" /> },
  { id: 'api', label: 'API Keys', icon: <Key className="h-4 w-4" /> },
  { id: 'features', label: 'Features', icon: <Zap className="h-4 w-4" /> },
  { id: 'troubleshooting', label: 'Troubleshooting', icon: <AlertCircle className="h-4 w-4" /> },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <HelpCircle className="h-8 w-8 text-primary" />
          Help Center
        </h1>
        <p className="text-muted-foreground text-lg">
          Find answers to common questions and troubleshooting guides
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 py-6 text-lg"
          />
        </div>
      </div>

      {/* Categories */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
        <TabsList className="grid grid-cols-5 w-full">
          {categories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id} className="flex items-center gap-2">
              {cat.icon}
              <span className="hidden sm:inline">{cat.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* FAQs */}
      <div className="space-y-4">
        {filteredFaqs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">
                No results found for &quot;{searchQuery}&quot;
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your search or browse by category
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredFaqs.map((faq, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Additional Resources */}
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Documentation
            </CardTitle>
            <CardDescription>
              Comprehensive guides and API documentation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="https://github.com/Cism-Ch/OfferAnalyst/tree/main/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View Documentation →
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              GitHub Issues
            </CardTitle>
            <CardDescription>
              Report bugs or request features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="https://github.com/Cism-Ch/OfferAnalyst/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Open an Issue →
            </a>
          </CardContent>
        </Card>
      </div>

      {/* Contact Support */}
      <Card className="mt-8 bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>Still need help?</CardTitle>
          <CardDescription>
            Can&apos;t find what you&apos;re looking for? We&apos;re here to help!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            📧 Email:{' '}
            <a href="mailto:support@offeranalyst.com" className="text-primary hover:underline">
              support@offeranalyst.com
            </a>
          </p>
          <p className="text-sm">
            💬 GitHub Discussions:{' '}
            <a
              href="https://github.com/Cism-Ch/OfferAnalyst/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Join the conversation
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
