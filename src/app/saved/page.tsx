"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2,
  BrainCircuit,
  Trash2,
  CalendarDays,
  Layers,
  GitCompare,
  Filter,
  Search as SearchIcon,
} from "lucide-react";
import { useSavedOffers } from "@/hooks/use-saved-offers";
import { organizeOffersAction, OrganizedOffers } from "@/app/actions/organize";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { WidgetCard } from "@/components/premium/WidgetCard";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

export default function SavedOffersPage() {
  const router = useRouter();
  const { savedOffers, removeOffer, isLoading } = useSavedOffers();
  const [organizing, setOrganizing] = useState(false);
  const [organizedData, setOrganizedData] = useState<OrganizedOffers | null>(
    null,
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const handleOrganize = async () => {
    if (savedOffers.length === 0) return;
    setOrganizing(true);
    try {
      const data = await organizeOffersAction(savedOffers);
      setOrganizedData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setOrganizing(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
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
    if (selectedIds.size >= 2) {
      const ids = Array.from(selectedIds).join(",");
      router.push(`/compare?ids=${ids}`);
    }
  };

  const filteredOffers = savedOffers.filter(
    (offer) =>
      offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.category?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex min-h-screen overflow-hidden bg-zinc-50 font-sans text-neutral-900 dark:bg-zinc-950">
      <Sidebar />
      <main className="flex h-screen flex-1 flex-col overflow-hidden">
        <Header selectedModel="gpt-4o" onModelChange={() => {}} />

        <div className="custom-scrollbar flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-[1600px] space-y-8">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <h1 className="mb-2 text-3xl font-black tracking-tighter">
                  Saved Collection
                </h1>
                <p className="font-medium text-muted-foreground">
                  Manage and analyze your curated opportunities.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="group relative">
                  <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-neon" />
                  <Input
                    placeholder="Filter collection..."
                    className="focus:ring-neon/20 h-10 w-64 rounded-xl border-none bg-white pl-10 font-medium shadow-sm transition-all focus:ring-2 dark:bg-zinc-900"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleCompare}
                  disabled={selectedIds.size < 2}
                  variant="outline"
                  className="h-10 gap-2 rounded-xl border-dashed px-4 transition-all hover:border-neon hover:text-neon"
                >
                  <GitCompare className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wide">
                    Compare ({selectedIds.size})
                  </span>
                </Button>
                <Button
                  onClick={handleOrganize}
                  disabled={savedOffers.length === 0 || organizing}
                  className="h-10 gap-2 rounded-xl bg-neon px-6 text-xs font-bold uppercase tracking-wide text-neon-foreground shadow-neon transition-all hover:scale-105"
                >
                  {organizing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <BrainCircuit className="h-4 w-4" />
                  )}
                  AI Organize
                </Button>
              </div>
            </div>

            {savedOffers.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900">
                  <Filter className="text-muted-foreground/50 h-10 w-10" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Collection Empty</h3>
                <p className="mx-auto mb-6 max-w-sm text-muted-foreground">
                  Start your research to find and save opportunities to your
                  specialized collection.
                </p>
                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                  className="rounded-xl font-bold"
                >
                  Return to Research
                </Button>
              </div>
            ) : (
              <Tabs defaultValue="list" className="w-full">
                <TabsList className="mb-6 inline-flex rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-900">
                  <TabsTrigger
                    value="list"
                    className="rounded-lg px-4 py-2 font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-800"
                  >
                    Grid View
                  </TabsTrigger>
                  <TabsTrigger
                    value="categories"
                    disabled={!organizedData}
                    className="gap-2 rounded-lg px-4 py-2 font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-800"
                  >
                    <Layers className="h-3 w-3" /> Categories
                  </TabsTrigger>
                  <TabsTrigger
                    value="timeline"
                    disabled={!organizedData}
                    className="gap-2 rounded-lg px-4 py-2 font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-800"
                  >
                    <CalendarDays className="h-3 w-3" /> Timeline
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="mt-0">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <AnimatePresence>
                      {filteredOffers.map((offer, i) => (
                        <motion.div
                          key={offer.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ delay: i * 0.05 }}
                          layout
                        >
                          <WidgetCard
                            className={`group h-full cursor-pointer transition-all duration-300 ${
                              selectedIds.has(offer.id)
                                ? "shadow-[0_0_20px_rgba(var(--neon-rgb),0.3)] ring-2 ring-neon"
                                : "hover:border-neon/50"
                            }`}
                            neonEffect
                            onClick={() => toggleSelection(offer.id)}
                          >
                            <div className="flex h-full flex-col">
                              <div className="mb-4 flex items-start justify-between">
                                <Badge
                                  variant="secondary"
                                  className="rounded-lg bg-zinc-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider dark:bg-zinc-800"
                                >
                                  {offer.category || "General"}
                                </Badge>
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    checked={selectedIds.has(offer.id)}
                                    onCheckedChange={() =>
                                      toggleSelection(offer.id)
                                    }
                                    className="h-5 w-5 rounded-md border-zinc-300 transition-all data-[state=checked]:bg-neon data-[state=checked]:text-neon-foreground dark:border-zinc-700"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              </div>

                              <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-tight transition-colors group-hover:text-neon">
                                {offer.title}
                              </h3>

                              <div className="mt-auto space-y-4 pt-4">
                                <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                                  <span>{offer.location}</span>
                                  <span className="font-bold text-foreground">
                                    {offer.price}
                                  </span>
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    className="h-9 flex-1 rounded-lg bg-zinc-100 text-xs font-bold uppercase tracking-wide text-foreground shadow-none hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(offer.link, "_blank");
                                    }}
                                  >
                                    View Source
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-9 w-9 rounded-lg text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeOffer(offer.id);
                                      if (selectedIds.has(offer.id))
                                        toggleSelection(offer.id);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </WidgetCard>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </TabsContent>
                {/* Categories and Timeline tabs can be kept simplistic or updated similarly if data structure allows */}
              </Tabs>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
