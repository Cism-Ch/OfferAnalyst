"use client";

import React, { useState, useMemo } from "react";
import { useSearchHistory } from "@/hooks/use-search-history";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  Pin,
  Trash2,
  Calendar,
  ArrowRight,
  Search,
  Eraser,
  RotateCcw,
  Zap,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { SearchHistoryItem } from "@/types";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { WidgetCard } from "@/components/premium/WidgetCard";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function HistoryPage() {
  const { history, togglePin, deleteItem, clearHistory, isLoading } =
    useSearchHistory();
  const router = useRouter();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [showClearDialog, setShowClearDialog] = useState(false);

  // Filter history based on search query
  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;

    const query = searchQuery.toLowerCase();
    return history.filter(
      (item) =>
        item.inputs.domain.toLowerCase().includes(query) ||
        item.inputs.criteria.toLowerCase().includes(query) ||
        item.inputs.context.toLowerCase().includes(query) ||
        (item.results?.topOffers &&
          item.results.topOffers.some((offer) =>
            offer.title.toLowerCase().includes(query),
          )),
    );
  }, [history, searchQuery]);

  // Count pinned and unpinned items
  const pinnedCount = history.filter((item) => item.pinned).length;
  const unpinnedCount = history.length - pinnedCount;

  // Handle restore search - navigate to home page with query params
  const handleRestoreSearch = (item: SearchHistoryItem) => {
    const params = new URLSearchParams({
      restore: "true",
      domain: item.inputs.domain,
      criteria: item.inputs.criteria,
      context: item.inputs.context,
    });
    router.push(`/?${params.toString()}`);
  };

  // Handle clear all unpinned
  const handleClearUnpinned = () => {
    clearHistory();
    setShowClearDialog(false);
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-zinc-50 font-sans text-neutral-900 dark:bg-zinc-950">
      <Sidebar />
      <main className="flex h-screen flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-200 bg-white/50 px-8 py-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
          <Header selectedModel="gpt-4o" onModelChange={() => {}} />
          <ThemeToggle />
        </div>

        <ScrollArea className="flex-1 px-8">
          <div className="mx-auto max-w-[1600px] space-y-8 py-8">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <h1 className="mb-2 text-3xl font-black tracking-tighter">
                  Search History
                </h1>
                <p className="flex items-center gap-2 font-medium text-muted-foreground">
                  {pinnedCount > 0 && (
                    <span className="font-bold text-neon">
                      {pinnedCount} pinned •{" "}
                    </span>
                  )}
                  <Zap className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  {unpinnedCount} recent analyses
                </p>
              </div>

              {history.length > 0 && (
                <div className="flex w-full items-center gap-3 md:w-auto">
                  <div className="group relative flex-1 md:flex-none">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-neon" />
                    <Input
                      placeholder="Search past analyses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="focus:ring-neon/20 h-10 w-full rounded-xl border-none bg-white pl-10 font-medium shadow-sm transition-all focus:ring-2 md:w-64 dark:bg-zinc-900"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowClearDialog(true)}
                    disabled={unpinnedCount === 0}
                    className="h-10 gap-2 rounded-xl border-dashed px-4 transition-all hover:border-red-500 hover:text-red-500"
                  >
                    <Eraser className="h-4 w-4" />
                    <span className="hidden text-xs font-bold uppercase tracking-wide sm:inline">
                      Clear Unpinned
                    </span>
                  </Button>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Clock className="text-muted-foreground/50 mb-4 h-10 w-10 animate-pulse" />
                <p className="text-lg font-bold text-muted-foreground">
                  Retrieving timeline...
                </p>
              </div>
            ) : filteredHistory.length === 0 && history.length > 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Search className="text-muted-foreground/30 mb-4 h-12 w-12" />
                <h3 className="mb-2 text-xl font-bold">No matches found</h3>
                <Button
                  variant="link"
                  onClick={() => setSearchQuery("")}
                  className="text-neon"
                >
                  Clear search filter
                </Button>
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900">
                  <Clock className="text-muted-foreground/50 h-10 w-10" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Timeline Empty</h3>
                <p className="mx-auto mb-6 max-w-sm text-muted-foreground">
                  Your research history will appear here correctly organized for
                  quick access.
                </p>
                <Link href="/" passHref>
                  <Button className="hover:bg-neon/90 rounded-xl bg-neon font-bold text-neon-foreground">
                    Start New Analysis
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <AnimatePresence>
                  {filteredHistory.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: i * 0.05 }}
                      layout
                    >
                      <WidgetCard
                        className={`group flex h-full flex-col ${
                          item.pinned
                            ? "bg-gradient-to-br from-zinc-50 to-zinc-100 shadow-[0_0_20px_rgba(var(--neon-rgb),0.15)] ring-2 ring-neon dark:from-zinc-900 dark:to-zinc-900/50"
                            : ""
                        }`}
                        neonEffect={item.pinned}
                      >
                        <div className="absolute right-3 top-3 z-10 flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 rounded-lg ${item.pinned ? "bg-neon/10 text-neon" : "hover:bg-zinc-200 dark:hover:bg-zinc-800"}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePin(item.id);
                            }}
                          >
                            <Pin
                              className="h-4 w-4"
                              fill={item.pinned ? "currentColor" : "none"}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-red-500/10 hover:text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteItem(item.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex-1 p-1">
                          <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {formatDistanceToNow(item.timestamp, {
                                addSuffix: true,
                              })}
                            </span>
                          </div>

                          <h3 className="mb-2 pr-8 text-lg font-bold leading-tight transition-colors group-hover:text-neon">
                            {item.inputs.domain}
                          </h3>

                          <p className="mb-4 line-clamp-2 text-sm font-medium text-muted-foreground">
                            {item.inputs.criteria}
                          </p>

                          <div className="mb-4 flex flex-wrap gap-2">
                            {item.inputs.context && (
                              <Badge
                                variant="secondary"
                                className="rounded-md bg-zinc-100 text-[10px] font-bold uppercase tracking-wide dark:bg-zinc-800"
                              >
                                {item.inputs.context
                                  .split(" ")
                                  .slice(0, 2)
                                  .join(" ")}
                                ...
                              </Badge>
                            )}
                            <Badge
                              variant="outline"
                              className="rounded-md text-[10px] font-bold uppercase tracking-wide"
                            >
                              {item.results.topOffers.length} Results
                            </Badge>
                          </div>
                        </div>

                        <div className="mt-auto px-1 pb-1">
                          <Button
                            variant="ghost"
                            className="group/btn h-10 w-full justify-between rounded-xl bg-zinc-100 px-3 text-xs font-bold uppercase tracking-wide transition-all group-hover:bg-neon group-hover:text-neon-foreground dark:bg-zinc-800"
                            onClick={() => handleRestoreSearch(item)}
                          >
                            <span className="flex items-center gap-2">
                              <RotateCcw className="h-3 w-3" />
                              Replay Search
                            </span>
                            <ArrowRight className="h-3 w-3 -translate-x-2 opacity-0 transition-all duration-300 group-hover/btn:translate-x-0 group-hover/btn:opacity-100" />
                          </Button>
                        </div>
                      </WidgetCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Clear Confirmation Dialog */}
        <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <DialogContent className="rounded-2xl border-none bg-white shadow-2xl sm:max-w-md dark:bg-zinc-900">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <Eraser className="h-5 w-5 text-red-500" />
                Clear History
              </DialogTitle>
              <DialogDescription className="font-medium text-muted-foreground">
                This will permanently remove {unpinnedCount} unpinned searches.
                Pinned items will be saved.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowClearDialog(false)}
                className="rounded-xl font-bold"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleClearUnpinned}
                className="rounded-xl font-bold"
              >
                Confirm Clear
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
