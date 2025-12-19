'use client';

import React from 'react';
import { useSearchHistory } from '@/hooks/use-search-history';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from 'next/link';
import {
    Clock,
    Pin,
    Trash2,
    ArrowLeft,
    Calendar,
    ArrowRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function HistoryPage() {
    const { history, togglePin, deleteItem } = useSearchHistory();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-6 font-sans text-neutral-900 dark:text-zinc-100">
            <header className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Search History</h1>
                        <p className="text-muted-foreground">Recent analysis and pinned research</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                </div>
            </header>



            <main className="max-w-6xl mx-auto space-y-8">

                {history.length === 0 ? (
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
                        {history.map((item) => (
                            <Card key={item.id} className={`flex flex-col relative transition-all duration-200 border-none shadow-sm hover:shadow-md ${item.pinned ? 'ring-2 ring-primary/20 bg-amber-50/50 dark:bg-amber-900/10' : 'bg-white dark:bg-zinc-900'}`}>
                                <div className="absolute top-3 right-3 flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-background/80"
                                        onClick={() => togglePin(item.id)}
                                    >
                                        {item.pinned ? <Pin className="h-4 w-4 fill-primary text-primary" /> : <Pin className="h-4 w-4 text-muted-foreground" />}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => deleteItem(item.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                        <Calendar className="h-3 w-3" />
                                        <span>{formatDistanceToNow(item.timestamp, { addSuffix: true })}</span>
                                    </div>
                                    <CardTitle className="text-lg line-clamp-1 pr-16">{item.inputs.domain}</CardTitle>
                                    <CardDescription className="line-clamp-2 min-h-[40px]">
                                        {item.inputs.criteria}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="flex-1 pb-2">
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <Badge variant="secondary" className="text-xs">
                                            {item.inputs.context.split(' ').slice(0, 3).join(' ')}...
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                            {item.results.topOffers.length} Results
                                        </Badge>
                                    </div>

                                    <ScrollArea className="h-32 rounded-md border bg-slate-50 dark:bg-zinc-950 p-3 text-sm">
                                        <ul className="space-y-2">
                                            {item.results.topOffers.slice(0, 3).map((offer, idx) => (
                                                <li key={idx} className="flex justify-between items-start gap-2 text-xs">
                                                    <span className="truncate flex-1 font-medium">{offer.title}</span>
                                                    <span className={`font-bold ${offer.finalScore > 80 ? 'text-green-600' : 'text-blue-600'}`}>{offer.finalScore}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </ScrollArea>
                                </CardContent>

                                <CardFooter className="pt-2">
                                    <Button variant="ghost" className="w-full justify-between text-xs group" disabled>
                                        View Details <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
