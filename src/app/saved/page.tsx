'use client';

import React, { useState } from 'react';
import { SimpleLayout } from '@/components/layout/SimpleLayout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, BrainCircuit, Trash2, CalendarDays, Layers, GitCompare } from 'lucide-react';
import { useSavedOffers } from '@/hooks/use-saved-offers';
import { useTemporaryApiKeys } from '@/hooks/use-temporary-api-keys';
import { useLanguage } from '@/contexts/LanguageContext';
import { organizeOffersAction, OrganizedOffers } from '@/app/actions/organize';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast";

export default function SavedOffersPage() {
    const router = useRouter();
    const { error: toastError } = useToast();
    const { savedOffers, removeOffer } = useSavedOffers();
    const tempKeys = useTemporaryApiKeys();
    const { t } = useLanguage();
    const sp = t.savedPage;
    const [organizing, setOrganizing] = useState(false);
    const [organizedData, setOrganizedData] = useState<OrganizedOffers | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const handleOrganize = async () => {
        if (savedOffers.length === 0) return;
        setOrganizing(true);
        try {
            const clientApiKey = tempKeys.getKey('openrouter') || undefined;
            const data = await organizeOffersAction(savedOffers, clientApiKey);
            setOrganizedData(data);
        } catch (error) {
            console.error(error);
            toastError(sp.toastOrganizeFailed, sp.toastConnectionError);
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
            return;
        }
        const ids = Array.from(selectedIds).join(',');
        router.push(`/compare?ids=${ids}`);
    };

    return (
        <SimpleLayout
            title={sp.title}
            description={sp.description}
            maxWidth="6xl"
        >
            <div className="space-y-6">
                {/* Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-card text-card-foreground p-4 rounded-xl border shadow-xs">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-sm px-3 py-1">
                            {savedOffers.length} {savedOffers.length === 1 ? sp.itemSingular : sp.itemPlural}
                        </Badge>
                        {selectedIds.size > 0 && (
                            <Badge variant="secondary" className="text-sm px-3 py-1">
                                {selectedIds.size} {selectedIds.size > 1 ? sp.selectedPlural : sp.selectedSingular}
                            </Badge>
                        )}
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row gap-2">
                        <Button
                            onClick={handleCompare}
                            disabled={selectedIds.size < 2}
                            variant="outline"
                            className="gap-2 w-full sm:w-auto min-h-[44px] sm:min-h-0 touch-manipulation"
                        >
                            <GitCompare className="h-4 w-4" />
                            {sp.btnCompare} ({selectedIds.size}/3)
                        </Button>
                        <Button
                            onClick={handleOrganize}
                            disabled={savedOffers.length === 0 || organizing}
                            className="gap-2 w-full sm:w-auto min-h-[44px] sm:min-h-0 touch-manipulation"
                        >
                            {organizing ? <Loader2 className="animate-spin h-4 w-4" /> : <BrainCircuit className="h-4 w-4" />}
                            {organizing ? sp.btnOrganizing : sp.btnSmartOrganize}
                        </Button>
                    </div>
                </div>

                {savedOffers.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground space-y-3">
                        <p className="text-lg font-medium text-foreground">{sp.emptyTitle}</p>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">{sp.emptyDesc}</p>
                        <div className="pt-2">
                            <Button asChild variant="outline">
                                <Link href="/">{sp.btnDiscover}</Link>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Tabs defaultValue="list" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 max-w-md mb-6">
                            <TabsTrigger value="list">{sp.tabAll}</TabsTrigger>
                            <TabsTrigger value="categories" disabled={!organizedData} className="gap-2">
                                <Layers className="h-3 w-3" /> {sp.tabClusters}
                            </TabsTrigger>
                            <TabsTrigger value="timeline" disabled={!organizedData} className="gap-2">
                                <CalendarDays className="h-3 w-3" /> {sp.tabTimeline}
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
                                        <div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
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
                                                <Card key={offer.id} className="bg-card text-card-foreground border shadow-sm">
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
                                        <div className="absolute -left-1.25 top-1 h-2.5 w-2.5 rounded-full bg-primary" />
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
            </div>
        </SimpleLayout>
    );
}
