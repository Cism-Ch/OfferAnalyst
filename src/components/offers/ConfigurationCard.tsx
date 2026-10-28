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
import { ClientOnlySwitch } from '@/components/ClientOnlySwitch';
import { Loader2, Sparkles, Bot } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

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
    const { t } = useLanguage();

    return (
        <Card className="border-none shadow-sm drop-shadow-sm">
            {/* Card Header */}
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="text-primary" size={20} />
                        {t.config.title}
                    </CardTitle>
                    <Badge variant="outline" className="gap-1">
                        <Bot size={12} /> {t.config.badgeAI}
                    </Badge>
                </div>
                <CardDescription>
                    {t.config.description}
                </CardDescription>
            </CardHeader>

            {/* Card Content - Form Fields */}
            <CardContent className="space-y-4">
                {/* Domain and Limit Row - Mobile-First Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Domain Input */}
                    <div className="space-y-2">
                        <Label>{t.config.domainLabel}</Label>
                        <Input 
                            value={domain} 
                            onChange={(e) => setDomain(e.target.value)} 
                            placeholder={t.config.domainPlaceholder} 
                        />
                    </div>
                    
                    {/* Limit Selection */}
                    <div className="space-y-2">
                        <Label>{t.config.limitLabel}</Label>
                        <ClientOnlySelect>
                            <Select value={limit} onValueChange={setLimit}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t.config.selectLimit} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="3">{t.config.top} 3</SelectItem>
                                    <SelectItem value="5">{t.config.top} 5</SelectItem>
                                    <SelectItem value="10">{t.config.top} 10</SelectItem>
                                </SelectContent>
                            </Select>
                        </ClientOnlySelect>
                    </div>
                </div>

                {/* Explicit Criteria Input */}
                <div className="space-y-2">
                    <Label>{t.config.explicitCriteriaLabel}</Label>
                    <Input 
                        value={explicitCriteria} 
                        onChange={(e) => setExplicitCriteria(e.target.value)} 
                        placeholder={t.config.explicitCriteriaPlaceholder} 
                    />
                </div>

                {/* Implicit Context Textarea */}
                <div className="space-y-2">
                    <Label>{t.config.implicitContextLabel}</Label>
                    <Textarea
                        value={implicitContext}
                        onChange={(e) => setImplicitContext(e.target.value)}
                        placeholder={t.config.implicitContextPlaceholder}
                        className="resize-none"
                    />
                </div>

                {/* Auto-Fetch Toggle */}
                <div className="flex items-center justify-between rounded-xl border p-3.5 bg-muted/40">
                    <div className="space-y-0.5">
                        <Label className="text-sm sm:text-base font-semibold">{t.config.autoFetchLabel}</Label>
                        <p className="text-xs text-muted-foreground">
                            {t.config.autoFetchDesc}
                        </p>
                    </div>
                    <ClientOnlySwitch>
                        <Switch
                            checked={autoFetch}
                            onCheckedChange={setAutoFetch}
                        />
                    </ClientOnlySwitch>
                </div>

                {/* Offers JSON Input */}
                <div className="space-y-2">
                    <Label>
                        {t.config.offersLabel} {autoFetch && (
                            <span className="text-xs text-muted-foreground">
                                {t.config.offersOverwritten}
                            </span>
                        )}
                    </Label>
                    <Textarea
                        value={offersInput}
                        onChange={(e) => setOffersInput(e.target.value)}
                        className="font-mono text-xs h-32"
                        placeholder={t.config.offersPlaceholder}
                        disabled={autoFetch}
                    />
                </div>
            </CardContent>

            {/* Card Footer - Action Button */}
            <CardFooter className="justify-end bg-muted/20 border-t p-4 rounded-b-xl">
                <Button 
                    onClick={onAnalyze} 
                    disabled={loading} 
                    className="w-full sm:w-auto min-h-[44px]"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {fetching ? t.config.btnSearching : t.config.btnAnalyzing}
                        </>
                    ) : t.config.btnRun}
                </Button>
            </CardFooter>
        </Card>
    );
}
