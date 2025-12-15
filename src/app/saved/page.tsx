'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, BrainCircuit, Trash2, CalendarDays, Layers, GitCompare } from 'lucide-react';
import { useSavedOffers } from '@/hooks/use-saved-offers';
import { organizeOffersAction, OrganizedOffers } from '@/app/actions/organize';
import { ThemeToggle } from "@/components/theme-toggle";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Checkbox } from "@/components/ui/checkbox";

export default function SavedOffersPage() {
    const router = useRouter();
    const { savedOffers, removeOffer } = useSavedOffers();
    const [organizing, setOrganizing] = useState(false);
    const [organizedData, setOrganizedData] = useState<OrganizedOffers | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const handleOrganize = async () => {
        if (savedOffers.length === 0) return;
        setOrganizing(true);
        try {
            const data = await organizeOffersAction(savedOffers);
            setOrganizedData(data);
        } catch (error) {
            console.error(error);
            alert("Failed to organize offers.");
        } finally {
            setOrganizing(false);
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                if (newSet.size < 3) {
                    newSet.add(id);
                }
            }
            return newSet;
        });
    };

    const handleCompare = () => {
        if (selectedIds.size < 2) {
            alert("Please select at least 2 offers to compare");
            return;
        }
        const ids = Array.from(selectedIds).join(',');
        router.push(`/compare?ids=${ids}`);
    };

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
                        <h1 className="text-2xl font-bold">Saved Offers</h1>
                        <p className="text-muted-foreground">Your personal collection</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                </div>
            </header>

            <main className="max-w-6xl mx-auto space-y-6">

                {/* Actions */}
                <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-lg border shadow-sm">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-base px-3 py-1">
                            {savedOffers.length} {savedOffers.length === 1 ? 'Item' : 'Items'}
                        </Badge>
                        {selectedIds.size > 0 && (
                            <Badge variant="secondary" className="text-base px-3 py-1">
                                {selectedIds.size} Selected
                            </Badge>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleCompare}
                            disabled={selectedIds.size < 2}
                            variant="outline"
                            className="gap-2"
                        >
                            <GitCompare className="h-4 w-4" />
                            Compare ({selectedIds.size}/3)
                        </Button>
                        <Button
                            onClick={handleOrganize}
                            disabled={savedOffers.length === 0 || organizing}
                            className="gap-2"
                        >
                            {organizing ? <Loader2 className="animate-spin h-4 w-4" /> : <BrainCircuit className="h-4 w-4" />}
                            Smart Organize
                        </Button>
                    </div>
                </div>

                {savedOffers.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        <p>No offers saved yet.</p>
                        <Link href="/" className="text-primary hover:underline">Go to Dashboard</Link>
                    </div>
                ) : (
                    <Tabs defaultValue="list" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 max-w-md mb-6">
                            <TabsTrigger value="list">List View</TabsTrigger>
                            <TabsTrigger value="categories" disabled={!organizedData} className="gap-2">
                                <Layers className="h-3 w-3" /> Categories
                            </TabsTrigger>
                            <TabsTrigger value="timeline" disabled={!organizedData} className="gap-2">
                                <CalendarDays className="h-3 w-3" /> Timeline
                            </TabsTrigger>
                        </TabsList>

                        {/* RAW LIST VIEW */}
                        <TabsContent value="list" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {savedOffers.map((offer) => (
                                    <Card 
                                        key={offer.id} 
                                        className={`relative group cursor-pointer transition-all ${
                                            selectedIds.has(offer.id) 
                                                ? 'border-primary border-2 shadow-lg' 
                                                : 'border'
                                        }`}
                                        onClick={() => toggleSelection(offer.id)}
                                    >
                                        <div className="absolute top-2 left-2 z-10">
                                            <Checkbox 
                                                checked={selectedIds.has(offer.id)}
                                                onCheckedChange={() => toggleSelection(offer.id)}
                                                disabled={!selectedIds.has(offer.id) && selectedIds.size >= 3}
                                            />
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 z-10"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeOffer(offer.id);
                                                setSelectedIds(prev => {
                                                    const newSet = new Set(prev);
                                                    newSet.delete(offer.id);
                                                    return newSet;
                                                });
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        <CardHeader className="pb-2 pl-10">
                                            <CardTitle className="text-base truncate pr-8">{offer.title}</CardTitle>
                                            <CardDescription>{offer.location}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{offer.description}</p>
                                            <Badge variant="secondary">{offer.category || "Offer"}</Badge>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        {/* CATEGORIES VIEW */}
                        <TabsContent value="categories">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {organizedData?.categories.map((cat, i) => (
                                    <div key={i} className="flex flex-col gap-3">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            {cat.name} <Badge className="ml-auto">{cat.offers.length}</Badge>
                                        </h3>
                                        <div className="space-y-3">
                                            {cat.offers.map(offer => (
                                                <Card key={offer.id} className="bg-slate-50 dark:bg-zinc-900 border-none shadow-sm">
                                                    <CardHeader className="p-4 pb-2">
                                                        <CardTitle className="text-sm">{offer.title}</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-4 pt-0">
                                                        <p className="text-xs text-muted-foreground">{offer.price}</p>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        {/* TIMELINE VIEW */}
                        <TabsContent value="timeline">
                            <div className="relative border-l border-muted ml-4 space-y-8 py-4">
                                {organizedData?.timeline.map((item, i) => (
                                    <div key={i} className="pl-6 relative">
                                        <div className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                                        <h3 className="text-lg font-semibold mb-2">{item.date}</h3>
                                        <div className="grid grid-cols-1 gap-3">
                                            {item.offers.map(offer => (
                                                <Card key={offer.id} className="border-l-4 border-l-primary">
                                                    <CardHeader className="p-3">
                                                        <CardTitle className="text-sm">{offer.title}</CardTitle>
                                                        <CardDescription className="text-xs">{offer.description}</CardDescription>
                                                    </CardHeader>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                )}
            </main>
        </div>
    );
}
