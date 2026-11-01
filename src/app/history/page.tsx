'use client';

import React, { useState, useMemo } from 'react';
import { SimpleLayout } from '@/components/layout/SimpleLayout';
import { useSearchHistory } from '@/hooks/use-search-history';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Clock,
    Pin,
    Trash2,
    Calendar,
    ArrowRight,
    Search,
    Eraser,
    RotateCcw,
    Cloud,
    HardDrive,
    Info,
    Sparkles,
    KeyRound,
    Eye,
    ExternalLink,
    BarChart3,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { SearchHistoryItem } from '@/types';

export default function HistoryPage() {
    const { history, togglePin, deleteItem, clearHistory, isLoading, isAuthenticated, isCloudSync } = useSearchHistory();
    const router = useRouter();
    
    // Stable timestamp for TTL display
    const [now] = useState(() => Date.now());

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [showClearDialog, setShowClearDialog] = useState(false);
    const [selectedDetailItem, setSelectedDetailItem] = useState<SearchHistoryItem | null>(null);
    
    // Filter history based on search query
    const filteredHistory = useMemo(() => {
        if (!searchQuery.trim()) return history;
        
        const query = searchQuery.toLowerCase();
        return history.filter(item => {
            const domain = item.inputs?.domain?.toLowerCase() || '';
            const criteria = item.inputs?.criteria?.toLowerCase() || '';
            const context = item.inputs?.context?.toLowerCase() || '';
            const offersMatch = item.results?.topOffers?.some(offer => 
                offer.title?.toLowerCase().includes(query)
            );
            return domain.includes(query) || criteria.includes(query) || context.includes(query) || !!offersMatch;
        });
    }, [history, searchQuery]);
    
    // Count pinned and unpinned items
    const pinnedCount = history.filter(item => item.pinned).length;
    const unpinnedCount = history.length - pinnedCount;
    
    // Handle restore search - navigate to home page with query params
    const handleRestoreSearch = (item: SearchHistoryItem) => {
        sessionStorage.setItem('restore_search', JSON.stringify(item));
        router.push('/');
    };
    
    // Handle clear all unpinned
    const handleClearUnpinned = () => {
        clearHistory();
        setShowClearDialog(false);
    };

    return (
        <SimpleLayout
            title="Search History"
            description={`${pinnedCount > 0 ? `${pinnedCount} pinned • ` : ''}${unpinnedCount} recent searches`}
            maxWidth="6xl"
        >
            <div className="space-y-6">
                {/* Dual Storage Status Banner */}
                {isCloudSync ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-lg border border-primary/20 bg-primary/5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Cloud className="h-4 w-4 text-primary shrink-0" />
                            <span><strong>Cloud Sync Active:</strong> Your searches are securely retained in MongoDB Atlas (retention: 90 days for unpinned, permanent for pinned).</span>
                        </div>
                        <Badge variant="outline" className="border-primary/40 text-primary bg-background shrink-0 self-start sm:self-auto">
                            Cloud DB
                        </Badge>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <HardDrive className="h-4 w-4 text-amber-600 shrink-0" />
                            <span><strong>Guest Mode (7-day TTL):</strong> Searches are stored locally in your browser for 7 days. Sign in to sync and keep your searches permanently in the cloud.</span>
                        </div>
                        <Link href="/auth/login?from=/history" className="shrink-0 w-full sm:w-auto">
                            <Button size="sm" variant="outline" className="h-8 sm:h-7 w-full sm:w-auto text-xs border-amber-500/30 text-amber-700 hover:bg-amber-500/10">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Sign in to Sync
                            </Button>
                        </Link>
                    </div>
                )}

                {/* Search and Actions Bar */}
                {history.length > 0 && (
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by domain, criteria, or results..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-11 md:h-9"
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setShowClearDialog(true)}
                            disabled={unpinnedCount === 0}
                            className="gap-2 shrink-0 h-11 md:h-9 w-full sm:w-auto"
                        >
                            <Eraser className="h-4 w-4" />
                            Clear Unpinned
                        </Button>
                    </div>
                )}

                <div className="space-y-6">
                {isLoading ? (
                    <div className="text-center py-20 text-muted-foreground">
                        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
                        <p className="text-lg font-medium">Loading history...</p>
                    </div>
                ) : filteredHistory.length === 0 && history.length > 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No results found</p>
                        <p className="mb-4">Try adjusting your search query.</p>
                        <Button variant="outline" onClick={() => setSearchQuery('')}>
                            Clear Search
                        </Button>
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No history yet</p>
                        <p className="mb-4">Your recent searches will appear here.</p>
                        <Link href="/">
                            <Button>Start a New Search</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredHistory.map((item) => (
                            <Card key={item.id} className={`flex flex-col relative transition-all duration-200 border shadow-sm hover:shadow-md ${item.pinned ? 'ring-2 ring-primary/30 bg-primary/5' : 'bg-card text-card-foreground'}`}>
                                <div className="absolute top-3 right-3 flex gap-1 z-10">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-background/80"
                                        onClick={() => togglePin(item.id)}
                                        title={item.pinned ? "Unpin search" : "Pin search (prevent deletion)"}
                                    >
                                        {item.pinned ? <Pin className="h-4 w-4 fill-primary text-primary" /> : <Pin className="h-4 w-4 text-muted-foreground" />}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => deleteItem(item.id)}
                                        title="Delete search"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 pr-16">
                                        <Calendar className="h-3 w-3" />
                                        <span>{formatDistanceToNow(item.timestamp, { addSuffix: true })}</span>
                                        {!isAuthenticated && item.expiresAt && (
                                            <span className="text-[10px] text-amber-600 font-medium">
                                                • Exp in {Math.max(1, Math.ceil((item.expiresAt - now) / (24 * 3600 * 1000)))}d
                                            </span>
                                        )}
                                    </div>

                                    {/* BYOK / Free Key & Model Indicators */}
                                    <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
                                        {item.isByok || item.keyType === 'byok' ? (
                                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[11px] font-semibold gap-1">
                                                <KeyRound className="h-3 w-3" />
                                                BYOK
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20 text-[11px] font-medium gap-1">
                                                <Sparkles className="h-3 w-3" />
                                                Free Key
                                            </Badge>
                                        )}
                                        {item.results?.modelUsed && (
                                            <Badge variant="outline" className="text-[10px] opacity-75">
                                                {item.results.modelUsed}
                                            </Badge>
                                        )}
                                    </div>

                                    <CardTitle className="text-lg line-clamp-1 pr-16">{item.inputs.domain}</CardTitle>
                                    <CardDescription className="line-clamp-2 min-h-10">
                                        {item.inputs.criteria}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="flex-1 pb-2">
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {item.inputs.context ? (
                                            <Badge variant="secondary" className="text-xs">
                                                {item.inputs.context.split(' ').slice(0, 3).join(' ')}...
                                            </Badge>
                                        ) : null}
                                        <Badge variant="outline" className="text-xs">
                                            {item.results?.topOffers?.length ?? item.results?.totalAnalyzed ?? 0} Results
                                        </Badge>
                                    </div>

                                    {item.results?.topOffers && item.results.topOffers.length > 0 ? (
                                        <ScrollArea className="min-h-[110px] max-h-36 rounded-md border border-border bg-muted/40 p-3 text-sm">
                                            <ul className="space-y-2">
                                                {item.results.topOffers.slice(0, 3).map((offer, idx) => (
                                                    <li key={idx} className="flex justify-between items-start gap-2 text-xs">
                                                        <span className="truncate flex-1 font-medium">{offer.title}</span>
                                                        <span className={`font-bold ${offer.finalScore > 80 ? 'text-green-600' : 'text-blue-600'}`}>{offer.finalScore}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </ScrollArea>
                                    ) : (
                                        <div className="min-h-[110px] max-h-36 rounded-md border border-border bg-muted/20 p-3 text-xs text-muted-foreground flex flex-col justify-center items-center text-center">
                                            <Info className="h-4 w-4 mb-1 opacity-50" />
                                            <span>Search archived in cloud</span>
                                            <span className="mt-1 opacity-70">Click details to inspect or restore</span>
                                        </div>
                                    )}
                                </CardContent>

                                <CardFooter className="pt-2 gap-2 flex items-center justify-between">
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="flex-1 text-xs gap-1.5 h-8"
                                        onClick={() => setSelectedDetailItem(item)}
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                        Détails
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="flex-1 text-xs gap-1.5 h-8 group"
                                        onClick={() => handleRestoreSearch(item)}
                                    >
                                        <RotateCcw className="h-3.5 w-3.5" />
                                        <span>Restaurer</span>
                                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
                </div>

                {/* Large Search Details Modal */}
                <Dialog open={!!selectedDetailItem} onOpenChange={(open) => !open && setSelectedDetailItem(null)}>
                    <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                        {selectedDetailItem && (
                            <div className="space-y-6">
                                <DialogHeader>
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        {selectedDetailItem.isByok || selectedDetailItem.keyType === 'byok' ? (
                                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-xs font-semibold gap-1">
                                                <KeyRound className="h-3.5 w-3.5" />
                                                Mode Clé BYOK
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20 text-xs font-semibold gap-1">
                                                <Sparkles className="h-3.5 w-3.5" />
                                                Clé Gratuite / Free Key
                                            </Badge>
                                        )}
                                        <Badge variant="outline" className="text-xs">
                                            {selectedDetailItem.results?.modelUsed || selectedDetailItem.model || 'Modèle par défaut'}
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs">
                                            {selectedDetailItem.results?.topOffers?.length || selectedDetailItem.results?.totalAnalyzed || 0} résultats
                                        </Badge>
                                        <span className="text-xs text-muted-foreground ml-auto">
                                            {formatDistanceToNow(selectedDetailItem.timestamp, { addSuffix: true })}
                                        </span>
                                    </div>
                                    <DialogTitle className="text-2xl font-bold tracking-tight">
                                        {selectedDetailItem.inputs.domain}
                                    </DialogTitle>
                                    <DialogDescription className="text-sm text-muted-foreground">
                                        Détails complets de l&apos;analyse sémantique, critères de recherche et justification des scores.
                                    </DialogDescription>
                                </DialogHeader>

                                {/* Criteria section */}
                                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                            Critères de Recherche
                                        </div>
                                        <p className="text-sm font-medium leading-relaxed">
                                            {selectedDetailItem.inputs.criteria}
                                        </p>
                                    </div>
                                    {selectedDetailItem.inputs.context && (
                                        <div>
                                            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                                Contexte Implicite
                                            </div>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                {selectedDetailItem.inputs.context}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Market Summary */}
                                {selectedDetailItem.results?.marketSummary && (
                                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                                            <BarChart3 className="h-4 w-4" />
                                            Synthèse du Marché
                                        </div>
                                        <p className="text-sm text-foreground/90 leading-relaxed">
                                            {selectedDetailItem.results.marketSummary}
                                        </p>
                                    </div>
                                )}

                                {/* Offers List */}
                                <div className="space-y-3">
                                    <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                        Offres Analysées & Classées ({selectedDetailItem.results?.topOffers?.length || 0})
                                    </div>

                                    {selectedDetailItem.results?.topOffers && selectedDetailItem.results.topOffers.length > 0 ? (
                                        <div className="space-y-3">
                                            {selectedDetailItem.results.topOffers.map((offer, idx) => (
                                                <div key={idx} className="rounded-lg border bg-card p-4 space-y-3 shadow-xs">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="h-6 w-6 rounded-full p-0 flex items-center justify-center font-bold text-xs bg-muted">
                                                                #{idx + 1}
                                                            </Badge>
                                                            <span className="font-semibold text-base line-clamp-1">{offer.title}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 self-start sm:self-auto">
                                                            <Badge className={`font-bold text-xs ${offer.finalScore >= 80 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                                                Score : {offer.finalScore}/100
                                                            </Badge>
                                                            {offer.url && (
                                                                <a href={offer.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                                                                    Voir <ExternalLink className="h-3 w-3" />
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Multi-axis score breakdown */}
                                                    {offer.scoreBreakdown && (
                                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 rounded-md bg-muted/40 text-xs">
                                                            <div>
                                                                <span className="text-muted-foreground">Adéquation critères : </span>
                                                                <span className="font-semibold">{offer.scoreBreakdown.criteriaMatch}/100</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-muted-foreground">Rapport prix/valeur : </span>
                                                                <span className="font-semibold">{offer.scoreBreakdown.priceScore}/100</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-muted-foreground">Crédibilité & pertinence : </span>
                                                                <span className="font-semibold">{offer.scoreBreakdown.credibilityScore}/100</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Justification */}
                                                    {offer.justification && (
                                                        <p className="text-xs text-muted-foreground leading-relaxed pl-2 border-l-2 border-primary/30">
                                                            {offer.justification}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                                            Aucune offre détaillée n&apos;est stockée pour cette recherche archivée. Cliquez sur &quot;Restaurer la Recherche&quot; pour relancer l&apos;analyse.
                                        </div>
                                    )}
                                </div>

                                <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
                                    <Button variant="outline" onClick={() => setSelectedDetailItem(null)}>
                                        Fermer
                                    </Button>
                                    <Button onClick={() => {
                                        handleRestoreSearch(selectedDetailItem);
                                        setSelectedDetailItem(null);
                                    }} className="gap-2">
                                        <RotateCcw className="h-4 w-4" />
                                        Restaurer cette Recherche
                                    </Button>
                                </DialogFooter>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Clear Confirmation Dialog */}
                <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Clear Unpinned History?</DialogTitle>
                            <DialogDescription>
                                This will remove all {unpinnedCount} unpinned search{unpinnedCount !== 1 ? 'es' : ''} from your history. 
                                Pinned items will be preserved. This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowClearDialog(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleClearUnpinned}>
                                <Eraser className="h-4 w-4 mr-2" />
                                Clear {unpinnedCount} Item{unpinnedCount !== 1 ? 's' : ''}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </SimpleLayout>
    );
}
