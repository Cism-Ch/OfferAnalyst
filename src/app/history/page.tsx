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
                                <div className="absolute top-3 right-3 flex gap-1">
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
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                        <Calendar className="h-3 w-3" />
                                        <span>{formatDistanceToNow(item.timestamp, { addSuffix: true })}</span>
                                        {!isAuthenticated && item.expiresAt && (
                                            <span className="text-[10px] text-amber-600 font-medium">
                                                • Exp in {Math.max(1, Math.ceil((item.expiresAt - now) / (24 * 3600 * 1000)))}d
                                            </span>
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
                                        {item.results?.modelUsed && (
                                            <Badge variant="outline" className="text-[10px] opacity-70">
                                                {item.results.modelUsed}
                                            </Badge>
                                        )}
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
                                            <span className="mt-1 opacity-70">Click restore to rerun or reload offers</span>
                                        </div>
                                    )}
                                </CardContent>

                                <CardFooter className="pt-2">
                                    <Button 
                                        variant="ghost" 
                                        className="w-full justify-between text-xs group"
                                        onClick={() => handleRestoreSearch(item)}
                                    >
                                        <span className="flex items-center gap-1">
                                            <RotateCcw className="h-3 w-3" />
                                            Restore Search
                                        </span>
                                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
                </div>

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
