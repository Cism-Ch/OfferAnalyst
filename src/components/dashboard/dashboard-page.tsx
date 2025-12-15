'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSavedOffers } from '@/hooks/use-saved-offers';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from 'next/link';
import {
    Briefcase,
    Home,
    Search,
    Settings,
    TrendingUp,
    User,
    Wallet,
    Loader2,
    CheckCircle2,
    // AlertCircle,
    BarChart3,
    // ExternalLink,
    Bot,
    Sparkles,
    Heart
} from 'lucide-react';
import { analyzeOffersAction } from '@/app/actions/analyze';
import { fetchOffersAction } from '@/app/actions/fetch';
import { AnalysisResponse, Offer, UserProfile } from '@/types';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const DUMMY_OFFERS = [
    {
        id: "1",
        title: "Senior Frontend Dev",
        description: "React, Next.js, $120k, Remote",
        price: 120000,
        location: "Remote",
        category: "Job"
    },
    {
        id: "2",
        title: "Full Stack Engineer",
        description: "Node.js, Vue, $130k, Hybrid NYC",
        price: 130000,
        location: "NYC",
        category: "Job"
    }
];

export function Dashboard() {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [results, setResults] = useState<AnalysisResponse | null>(null);
    const { saveOffer, isSaved } = useSavedOffers();

    // Input States
    const [domain, setDomain] = useState("Jobs");
    const [explicitCriteria, setExplicitCriteria] = useState("Salary > 100k, Remote or Hybrid");
    const [implicitContext, setImplicitContext] = useState("Looking for good work-life balance, startup culture");
    const [offersInput, setOffersInput] = useState(JSON.stringify(DUMMY_OFFERS, null, 2));

    // Orchestration Controls
    const [autoFetch, setAutoFetch] = useState(false);
    const [limit, setLimit] = useState("3");

    const handleAnalyze = async () => {
        setLoading(true);
        setResults(null);

        try {
            let currentOffers: Offer[] = [];

            // Phase 1: Auto-Fetch (if enabled)
            if (autoFetch) {
                setFetching(true);
                try {
                    // Use AI Agent 1 to find offers
                    const fetchedOffers = await fetchOffersAction(domain, explicitCriteria + " " + implicitContext);
                    currentOffers = fetchedOffers;
                    // Update UI with what was found
                    setOffersInput(JSON.stringify(fetchedOffers, null, 2));
                } catch (err) {
                    console.error("Fetch failed", err);
                    alert("Auto-fetch failed. Please check offers input.");
                    setLoading(false);
                    setFetching(false);
                    return;
                }
                setFetching(false);
            } else {
                // Manual Mode: Parse JSON from input
                try {
                    currentOffers = JSON.parse(offersInput);
                } catch {
                    alert("Invalid JSON for offers");
                    setLoading(false);
                    return;
                }
            }

            // Phase 2: Analyze
            const profile: UserProfile = {
                domain,
                explicitCriteria,
                implicitContext
            };

            const data = await analyzeOffersAction(currentOffers, profile, parseInt(limit));
            setResults(data);

        } catch (error) {
            console.error(error);
            alert("Analysis failed. See console.");
        } finally {
            setLoading(false);
            setFetching(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans text-neutral-900">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-white dark:bg-zinc-900 hidden md:flex flex-col">
                <div className="p-6 flex items-center gap-2 font-bold text-xl text-primary">
                    <div className="bg-primary text-primary-foreground p-1 rounded-md">
                        <TrendingUp size={20} />
                    </div>
                    OfferAnalyst
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                    <Button variant="ghost" className="w-full justify-start gap-2 bg-slate-100 dark:bg-zinc-800 text-primary">
                        <Home size={18} /> Dashboard
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-primary">
                        <Briefcase size={18} /> Projects
                    </Button>
                    <Link href="/saved">
                        <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-primary">
                            <Wallet size={18} /> Saved Offers
                        </Button>
                    </Link>
                    <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-primary">
                        <User size={18} /> Profile
                    </Button>
                </nav>

                <div className="p-4 border-t">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                            <p className="font-medium">User Profile</p>
                            <p className="text-xs text-muted-foreground">Pro Plan</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                {/* Header */}
                <header className="h-16 border-b bg-white dark:bg-zinc-900 flex items-center px-6 justify-between">
                    <h1 className="text-lg font-semibold">Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search analysis..."
                                className="w-64 pl-9 rounded-full bg-slate-100 dark:bg-zinc-800 border-none"
                            />
                        </div>
                        <ThemeToggle />
                        <Button variant="ghost" size="icon">
                            <Settings className="h-5 w-5" />
                        </Button>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="flex-1 p-6 overflow-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Input Column */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Analysis Config Card */}
                            <Card className="border-none shadow-sm drop-shadow-sm">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <Sparkles className="text-primary" size={20} />
                                            Configuration
                                        </CardTitle>
                                        <Badge variant="outline" className="gap-1">
                                            <Bot size={12} /> AI Powered
                                        </Badge>
                                    </div>
                                    <CardDescription>Define your context. Enable Auto-Fetch to let AI find offers for you.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Domain</Label>
                                            <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="e.g. Real Estate" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Recommendation Limit</Label>
                                            <Select value={limit} onValueChange={setLimit}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select limit" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="3">Top 3</SelectItem>
                                                    <SelectItem value="5">Top 5</SelectItem>
                                                    <SelectItem value="10">Top 10</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Explicit Criteria</Label>
                                        <Input value={explicitCriteria} onChange={(e) => setExplicitCriteria(e.target.value)} placeholder="Budget, Location..." />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Implicit Context</Label>
                                        <Textarea
                                            value={implicitContext}
                                            onChange={(e) => setImplicitContext(e.target.value)}
                                            placeholder="What matters to you? (e.g., safety, vibe)"
                                            className="resize-none"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg border p-3 bg-slate-50 dark:bg-zinc-900">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Auto-Fetch Offers</Label>
                                            <p className="text-xs text-muted-foreground">AI will search the web for live offers</p>
                                        </div>
                                        <Switch
                                            checked={autoFetch}
                                            onCheckedChange={setAutoFetch}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Offers (JSON) {autoFetch && <span className="text-xs text-muted-foreground">(Will be overwritten by Auto-Fetch)</span>}</Label>
                                        <Textarea
                                            value={offersInput}
                                            onChange={(e) => setOffersInput(e.target.value)}
                                            className="font-mono text-xs h-32"
                                            placeholder="Paste JSON array of offers here, or enable Auto-Fetch"
                                            disabled={autoFetch}
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="justify-end bg-slate-50/50 dark:bg-zinc-900/50 p-4 rounded-b-lg">
                                    <Button onClick={handleAnalyze} disabled={loading} className="w-full sm:w-auto">
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                {fetching ? "Fetching Offers..." : "Analyzing Context..."}
                                            </>
                                        ) : "Start Workflow"}
                                    </Button>
                                </CardFooter>
                            </Card>

                            {/* Visualization / Chart Area - Only show if results exist */}
                            {results && (
                                <Card className="border-none shadow-sm">
                                    <CardHeader>
                                        <CardTitle>Score Distribution</CardTitle>
                                    </CardHeader>
                                    <CardContent className="h-[200px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={results.topOffers}>
                                                <XAxis dataKey="title" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    cursor={{ fill: 'transparent' }}
                                                />
                                                <Bar dataKey="finalScore" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={40} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            )}

                        </div>

                        {/* Recent/Results Column */}
                        <div className="space-y-6">
                            {results ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-lg">Top Recommendations</h3>
                                        <Badge variant="secondary">{results.topOffers.length} Recommended</Badge>
                                    </div>

                                    {results.topOffers.map((offer, i) => (
                                        <Card key={offer.id || i} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow duration-200">
                                            <div className="absolute top-0 right-0 p-3 flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => saveOffer(offer)}
                                                >
                                                    <Heart 
                                                        className={`h-4 w-4 ${isSaved(offer.id) ? 'fill-red-500 text-red-500' : ''}`}
                                                    />
                                                </Button>
                                                <Badge className={offer.finalScore > 80 ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"}>
                                                    {offer.finalScore}
                                                </Badge>
                                            </div>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base truncate pr-20">{offer.rank}. {offer.title}</CardTitle>
                                                <CardDescription className="text-xs">{offer.location} • {offer.price && typeof offer.price === 'number' ? offer.price.toLocaleString() : offer.price}</CardDescription>
                                            </CardHeader>
                                            <CardContent className="pb-3 text-sm space-y-3">
                                                <p className="text-muted-foreground line-clamp-2">{offer.justification}</p>

                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs text-muted-foreground">
                                                        <span>Relevance</span>
                                                        <span>{offer.breakdown.relevance}%</span>
                                                    </div>
                                                    <Progress value={offer.breakdown.relevance} className="h-1.5" />
                                                </div>

                                                {offer.webInsights && offer.webInsights.length > 0 && (
                                                    <div className="bg-slate-50 dark:bg-zinc-800 p-2 rounded text-xs text-muted-foreground mt-2 border">
                                                        <span className="font-semibold flex items-center gap-1 text-primary mb-1">
                                                            <Search size={10} /> Web Insight
                                                        </span>
                                                        {offer.webInsights[0]}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}

                                    <Card className="bg-slate-900 text-white border-none">
                                        <CardHeader>
                                            <CardTitle className="text-sm">Market Summary</CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm text-slate-300">
                                            {results.marketSummary}
                                        </CardContent>
                                    </Card>
                                </div>
                            ) : (
                                <Card className="border-dashed border-2 shadow-none bg-transparent">
                                    <CardContent className="flex flex-col items-center justify-center p-12 text-muted-foreground text-center">
                                        <BarChart3 className="h-12 w-12 mb-4 opacity-50" />
                                        <p className="font-medium">No Analysis Yet</p>
                                        <p className="text-sm">Contextualize your search to see ranked offers here.</p>
                                        <div className="flex items-center gap-2 mt-4 text-xs bg-muted p-2 rounded">
                                            <CheckCircle2 size={14} className="text-green-500" />
                                            <span>AI Fetch Ready</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
