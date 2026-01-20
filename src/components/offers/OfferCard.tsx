"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Wallet,
  Search,
  Bookmark,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { ScoredOffer } from "@/types";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { WidgetCard } from "@/components/premium/WidgetCard";

/**
 * OfferCard Component Props
 */
interface OfferCardProps {
  /** The scored offer to display */
  offer: ScoredOffer;
  /** Index of the offer in the list */
  index: number;
  /** Function to save the offer */
  onSave: (offer: ScoredOffer) => void;
  /** Whether the offer is already saved */
  isSaved: boolean;
}

/**
 * OfferCard Component
 *
 * Displays a single offer with its AI-generated score, justification,
 * and web insights. Provides functionality to save the offer for later reference.
 *
 * Features:
 * - Score badge with color coding (green for high scores)
 * - Relevance progress bar
 * - Web insights panel
 * - Save/Saved functionality
 * - Responsive design for mobile and desktop
 *
 * @param {OfferCardProps} props - Component props
 * @returns {JSX.Element} The offer card
 */
export function OfferCard({ offer, index, onSave, isSaved }: OfferCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleSave = () => {
    onSave(offer);
    toast.success("Offer saved to collection", {
      description: offer.title,
      action: {
        label: "Undo",
        onClick: () => console.log("Undo not implemented"),
      },
    });
  };

  const scoreColor =
    offer.finalScore >= 70
      ? "text-neon"
      : offer.finalScore >= 50
        ? "text-yellow-500"
        : "text-orange-500";
  const scoreColorHex =
    offer.finalScore >= 70
      ? "var(--neon)"
      : offer.finalScore >= 50
        ? "#eab308"
        : "#f97316";

  return (
    <WidgetCard
      className="group flex flex-col overflow-hidden rounded-3xl border-zinc-200/50 hover:bg-zinc-50/50 dark:border-zinc-800/50 dark:hover:bg-zinc-900/50"
      neonHover
      delay={0.1 * index}
    >
      {/* Card Header with Title and Score */}
      <CardHeader className="flex-shrink-0 px-6 pb-4 pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <Badge
                variant="outline"
                className="rounded-full border-zinc-700/50 bg-zinc-900 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-300 shadow-sm hover:bg-zinc-900"
              >
                Rank #{offer.rank}
              </Badge>
            </div>
            <CardTitle className="line-clamp-2 text-lg font-bold leading-tight tracking-tight transition-colors group-hover:text-neon sm:text-xl">
              {offer.title}
            </CardTitle>
            <CardDescription className="text-muted-foreground/80 mt-1 flex items-center gap-2 text-sm font-medium">
              <span>{offer.location}</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-bold text-foreground">
                <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                {offer.price && typeof offer.price === "number"
                  ? offer.price.toLocaleString()
                  : offer.price}
              </span>
            </CardDescription>
          </div>

          {/* Score and Save Buttons */}
          <div className="flex shrink-0 items-center gap-3">
            {/* Score Circular Badge - Dark Mode Style forced */}
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 shadow-inner">
              <svg className="h-full w-full -rotate-90 p-1">
                <circle
                  className="text-zinc-800"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="transparent"
                  r="22"
                  cx="24"
                  cy="24"
                />
                <motion.circle
                  className={scoreColor}
                  strokeWidth="3"
                  strokeDasharray={138}
                  initial={{ strokeDashoffset: 138 }}
                  animate={{
                    strokeDashoffset: 138 - (138 * offer.finalScore) / 100,
                  }}
                  transition={{ duration: 1.5, delay: 0.5 + 0.1 * index }}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="22"
                  cx="24"
                  cy="24"
                  style={{ filter: `drop-shadow(0 0 2px ${scoreColorHex})` }}
                />
              </svg>
              <span className={cn("absolute text-sm font-black", scoreColor)}>
                {offer.finalScore}
              </span>
            </div>

            {/* Save Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleSave}
              disabled={isSaved}
              className={cn(
                "h-11 w-11 rounded-xl transition-all duration-300",
                isSaved
                  ? "bg-neon/10 border-neon/30 text-neon"
                  : "hover:bg-neon/5 border-zinc-200 hover:border-neon hover:text-neon dark:border-zinc-800",
              )}
            >
              {isSaved ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Card Content with Justification and Breakdown */}
      <CardContent className="flex flex-grow flex-col space-y-5 px-6 pb-6">
        {/* AI Justification - Collapsible */}
        <div className="group-hover:border-neon/50 relative border-l-2 border-zinc-200 pl-5 transition-colors dark:border-zinc-800">
          <motion.div
            initial={false}
            animate={{ height: isExpanded ? "auto" : "3.5rem" }}
            className="relative overflow-hidden"
          >
            <p className="text-sm italic leading-relaxed text-muted-foreground">
              &quot;{offer.justification}&quot;
            </p>
            {!isExpanded && (
              <div className="absolute bottom-0 left-0 h-8 w-full bg-gradient-to-t from-background to-transparent" />
            )}
          </motion.div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-neon hover:underline"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={10} /> Less
              </>
            ) : (
              <>
                <ChevronDown size={10} /> Read reasoning
              </>
            )}
          </button>
        </div>

        <div className="mt-auto space-y-4">
          {/* Relevance Score Breakdown */}
          <div className="grid grid-cols-1 gap-4">
            {/* Simplified for cleaner look, expanded implementation can go here later */}
            <div className="space-y-1">
              <div className="text-muted-foreground/60 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                <span>Relevance Match</span>
                <span>{offer.breakdown.relevance}%</span>
              </div>
              <Progress value={offer.breakdown.relevance} className="h-1.5" />
            </div>
          </div>

          {/* Web Insights - Dark Container */}
          {offer.webInsights && offer.webInsights.length > 0 && (
            <div className="group/insight relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-950 p-4">
              <div className="absolute right-0 top-0 p-2 opacity-10 transition-opacity group-hover/insight:opacity-20">
                <Search className="h-12 w-12 text-white" />
              </div>
              <span className="relative z-10 mb-1.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neon">
                <Search size={12} /> Intelligence Insight
              </span>
              <p className="relative z-10 text-xs font-medium leading-relaxed text-zinc-300">
                {offer.webInsights[0]}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </WidgetCard>
  );
}
