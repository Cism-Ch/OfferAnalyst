'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ClientOnlySelect } from '@/components/ClientOnlySelect';
import { Loader2, Sparkles, Bot } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * ConfigurationCard Component Props
 */
interface ConfigurationCardProps {
    /** Current domain value */
    domain: string;
    /** Domain change handler */
    setDomain: (domain: string) => void;
    /** Explicit criteria value */
    explicitCriteria: string;
    /** Explicit criteria change handler */
    setExplicitCriteria: (criteria: string) => void;
    /** Implicit context value */
    implicitContext: string;
    /** Implicit context change handler */
    setImplicitContext: (context: string) => void;
    /** Offers input JSON value */
    offersInput: string;
    /** Offers input change handler */
    setOffersInput: (input: string) => void;
    /** Auto-fetch toggle state */
    autoFetch: boolean;
    /** Auto-fetch change handler */
    setAutoFetch: (autoFetch: boolean) => void;
    /** Result limit value */
    limit: string;
    /** Limit change handler */
    setLimit: (limit: string) => void;
    /** Loading state */
    loading: boolean;
    /** Fetching state */
    fetching: boolean;
    /** Analysis start handler */
    onAnalyze: () => void;
}

/**
 * ConfigurationCard Component
 * 
 * Main configuration interface for setting up offer analysis parameters.
 * Allows users to define their search criteria and preferences before
 * initiating the AI-powered analysis workflow.
 * 
 * Features:
 * - Domain selection for offer categorization
 * - Explicit criteria input (hard requirements)
 * - Implicit context input (soft preferences)
 * - Auto-fetch toggle for AI web scraping
 * - Manual JSON offer input
 * - Result limit selection
 * - Workflow initiation button
 * 
 * @param {ConfigurationCardProps} props - Component props
 * @returns {JSX.Element} The configuration card
 */
export function ConfigurationCard({
    domain,
    setDomain,
    explicitCriteria,
    setExplicitCriteria,
    implicitContext,
    setImplicitContext,
    offersInput,
    setOffersInput,
    autoFetch,
    setAutoFetch,
    limit,
    setLimit,
    loading,
    fetching,
    onAnalyze
}: ConfigurationCardProps) {
    const [isClient, setIsClient] = useState(false);
    
    useEffect(() => {
        setIsClient(true);
    }, []);
    return (
        <Card className="border-none shadow-sm drop-shadow-sm">
            {/* Card Header */}
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
                <CardDescription>
                    Define your context. Enable Auto-Fetch to let AI find offers for you.
                </CardDescription>
            </CardHeader>

            {/* Card Content - Form Fields */}
            <CardContent className="space-y-4">
                {/* Domain and Limit Row */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Domain Input */}
                    <div className="space-y-2">
                        <Label>Domain</Label>
                        <Input 
                            value={domain} 
                            onChange={(e) => setDomain(e.target.value)} 
                            placeholder="e.g. Real Estate" 
                        />
                    </div>
                    
                    {/* Limit Selection */}
                    <div className="space-y-2">
                        <Label>Recommendation Limit</Label>
                        <ClientOnlySelect>
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
                        </ClientOnlySelect>
                    </div>
                </div>

                {/* Explicit Criteria Input */}
                <div className="space-y-2">
                    <Label>Explicit Criteria</Label>
                    <Input 
                        value={explicitCriteria} 
                        onChange={(e) => setExplicitCriteria(e.target.value)} 
                        placeholder="Budget, Location..." 
                    />
                </div>

                {/* Implicit Context Textarea */}
                <div className="space-y-2">
                    <Label>Implicit Context</Label>
                    <Textarea
                        value={implicitContext}
                        onChange={(e) => setImplicitContext(e.target.value)}
                        placeholder="What matters to you? (e.g., safety, vibe)"
                        className="resize-none"
                    />
                </div>

                {/* Auto-Fetch Toggle */}
                <div className="flex items-center justify-between rounded-lg border p-3 bg-slate-50 dark:bg-zinc-900">
                    <div className="space-y-0.5">
                        <Label className="text-base">Auto-Fetch Offers</Label>
                        <p className="text-xs text-muted-foreground">
                            AI will search the web for live offers
                        </p>
                    </div>
                    <Switch
                        checked={autoFetch}
                        onCheckedChange={setAutoFetch}
                    />
                </div>

{/* Offers JSON Input */}
                <div className="space-y-2">
                    <Label>
                        Offers (JSON) {isClient && autoFetch && (
                            <span className="text-xs text-muted-foreground">
                                (Will be overwritten by Auto-Fetch)
                            </span>
                        )}
                    </Label>
                    <Textarea
                        value={offersInput}
                        onChange={(e) => setOffersInput(e.target.value)}
                        className="font-mono text-xs h-32"
                        placeholder="Paste JSON array of offers here, or enable Auto-Fetch"
                        disabled={autoFetch}
                    />
                </div>
            </CardContent>

            {/* Card Footer - Action Button */}
            <CardFooter className="justify-end bg-slate-50/50 dark:bg-zinc-900/50 p-4 rounded-b-lg">
                <Button 
                    onClick={onAnalyze} 
                    disabled={loading} 
                    className="w-full sm:w-auto"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {fetching ? "Fetching Offers..." : "Analyzing Context..."}
                        </>
                    ) : "Start Workflow"}
                </Button>
            </CardFooter>
        </Card>
    );
}
