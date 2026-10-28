'use client';

/**
 * Search Context Page
 * 
 * Dedicated page for defining search parameters and context
 */

import React from 'react';
import { SimpleLayout } from '@/components/layout/SimpleLayout';
import { useDashboardState } from '@/hooks/use-dashboard-state';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClientOnlySelect } from '@/components/ClientOnlySelect';
import { Sparkles, ArrowRight, Info } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

const PRESETS = [
    {
        label: 'Emploi Tech',
        icon: '💼',
        domain: 'Jobs',
        criteria: 'Senior Fullstack TypeScript/React, Remote ou Paris, > 65k€',
        context: 'Priorité à la flexibilité, stack moderne (Next.js, Tailwind), ambiance collaborative et autonomie.'
    },
    {
        label: 'Immobilier',
        icon: '🏡',
        domain: 'Real Estate',
        criteria: 'Appartement 3 pièces, > 60m², Budget max 450 000€, balcon',
        context: 'Quartier calme, proche écoles et transports, lumineux avec bonne isolation thermique et phonique.'
    },
    {
        label: 'Matériel Tech',
        icon: '💻',
        domain: 'Hardware',
        criteria: 'PC Portable 14-16 pouces, 32 Go RAM, SSD 1 To, autonomie > 10h, sous 1800€',
        context: 'Développement web et inférence IA locale, écran haute fidélité, silencieux et châssis léger.'
    }
];

export default function SearchContextPage() {
    const dashboardState = useDashboardState();

    const applyPreset = (preset: typeof PRESETS[number]) => {
        dashboardState.setDomain(preset.domain);
        dashboardState.setExplicitCriteria(preset.criteria);
        dashboardState.setImplicitContext(preset.context);
    };

    return (
        <SimpleLayout
            title="Search Context"
            description="Define your search parameters and preferences"
            maxWidth="5xl"
        >
            <div className="space-y-6">
                {/* Info Banner */}
                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-6">
                        <div className="flex gap-3">
                            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Define your search context</p>
                                <p className="text-xs text-muted-foreground">
                                    These parameters will guide the AI to understand what you&apos;re looking for
                                    and how to rank the offers based on your preferences.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Search Context Form */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="text-primary" size={20} />
                            Search Parameters
                        </CardTitle>
                        <CardDescription>
                            Customize your search criteria and context
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* 1-Click Quick Presets */}
                        <div className="p-3.5 rounded-lg border bg-muted/30 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Exemples Rapides (1-Clic)
                                </span>
                                <span className="text-xs text-muted-foreground">Cliquez pour préremplir</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {PRESETS.map((p) => (
                                    <button
                                        key={p.label}
                                        type="button"
                                        onClick={() => applyPreset(p)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-background hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all cursor-pointer"
                                    >
                                        <span>{p.icon}</span>
                                        <span>{p.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Domain and Limit Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Domain</Label>
                                <Input 
                                    value={dashboardState.domain} 
                                    onChange={(e) => dashboardState.setDomain(e.target.value)} 
                                    placeholder="e.g. Jobs, Real Estate, Products" 
                                />
                                <p className="text-xs text-muted-foreground">
                                    The type of offers you want to analyze
                                </p>
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Recommendation Limit</Label>
                                <ClientOnlySelect>
                                    <Select value={dashboardState.limit} onValueChange={dashboardState.setLimit}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select limit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="3">Top 3</SelectItem>
                                            <SelectItem value="5">Top 5</SelectItem>
                                            <SelectItem value="10">Top 10</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </ClientOnlySelect>
                                <p className="text-xs text-muted-foreground">
                                    Number of top offers to recommend
                                </p>
                            </div>
                        </div>

                        {/* Explicit Criteria */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Label>Explicit Criteria</Label>
                                <Badge variant="secondary" className="text-xs">Required</Badge>
                            </div>
                            <Input 
                                value={dashboardState.explicitCriteria} 
                                onChange={(e) => dashboardState.setExplicitCriteria(e.target.value)} 
                                placeholder="e.g. Budget under $500k, Location: New York, Remote work" 
                            />
                            <p className="text-xs text-muted-foreground">
                                Hard requirements that offers must meet (comma-separated)
                            </p>
                        </div>

                        {/* Implicit Context */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Label>Implicit Context</Label>
                                <Badge variant="outline" className="text-xs">Preferences</Badge>
                            </div>
                            <Textarea
                                value={dashboardState.implicitContext}
                                onChange={(e) => dashboardState.setImplicitContext(e.target.value)}
                                placeholder="e.g. I value work-life balance, prefer startup culture, looking for growth opportunities..."
                                className="resize-none h-32"
                            />
                            <p className="text-xs text-muted-foreground">
                                Your preferences, priorities, and soft requirements that help AI understand what matters to you
                            </p>
                        </div>

                        {/* Action Buttons - Responsive Mobile-First */}
                        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t">
                            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                                Ready to configure your data source?
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                <Button variant="outline" className="w-full sm:w-auto min-h-[44px]" asChild>
                                    <Link href="/">Cancel</Link>
                                </Button>
                                <Button className="w-full sm:w-auto min-h-[44px]" asChild>
                                    <Link href="/data-source" className="gap-2">
                                        Next: Data Source
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tips Card */}
                <Card className="border-none shadow-sm bg-muted/50">
                    <CardHeader>
                        <CardTitle className="text-base">Tips for Better Results</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex gap-2">
                            <span className="text-primary">•</span>
                            <p>Be specific with explicit criteria - these are hard filters</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-primary">•</span>
                            <p>Use implicit context to describe your priorities and preferences</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-primary">•</span>
                            <p>The AI will rank offers based on both explicit and implicit factors</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </SimpleLayout>
    );
}
