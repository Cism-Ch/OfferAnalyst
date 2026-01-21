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
import { fadeInUp } from "@/lib/animations";

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
      className="group flex flex-col overflow-hidden hover:bg-accent/30"
      neonHover
      delay={0.1 * index}
      variants={fadeInUp}
    >
      {/* Card Header with Title and Score */}
      <CardHeader className="flex-shrink-0 space-y-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <Badge
                variant="outline"
                className="rounded-full border-muted bg-muted/50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
              >
                Rank #{offer.rank}
              </Badge>
            </div>
            <CardTitle className="line-clamp-2 text-lg font-bold leading-tight transition-colors group-hover:text-neon sm:text-xl">
              {offer.title}
            </CardTitle>
            <CardDescription className="mt-2 flex items-center gap-2 text-sm font-medium">
              <span>{offer.location}</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <Wallet className="size-3.5 text-muted-foreground" />
                {offer.price && typeof offer.price === "number"
                  ? offer.price.toLocaleString()
                  : offer.price}
              </span>
            </CardDescription>
          </div>

          {/* Score and Save Buttons */}
          <div className="flex shrink-0 items-center gap-3">
            {/* Score Circular Badge */}
            <div className="relative flex size-14 items-center justify-center rounded-full border-2 border-border bg-card shadow-sm">
              <svg className="size-full -rotate-90 p-1">
                <circle
                  className="text-muted"
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
              <span className={cn("absolute text-sm font-bold", scoreColor)}>
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
                "size-11 transition-all",
                isSaved
                  ? "border-neon/30 bg-neon/10 text-neon"
                  : "hover:border-neon/50 hover:bg-neon/5 hover:text-neon",
              )}
            >
              {isSaved ? (
                <CheckCircle2 className="size-5" />
              ) : (
                <Bookmark className="size-5" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Card Content with Justification and Breakdown */}
      <CardContent className="flex flex-grow flex-col space-y-4">
        {/* AI Justification - Collapsible */}
        <div className="relative border-l-2 border-border pl-4 transition-colors group-hover:border-neon/30">
          <motion.div
            initial={false}
            animate={{ height: isExpanded ? "auto" : "3.5rem" }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden"
          >
            <p className="text-sm italic leading-relaxed text-muted-foreground">
              &quot;{offer.justification}&quot;
            </p>
            {!isExpanded && (
              <div className="absolute bottom-0 left-0 h-8 w-full bg-gradient-to-t from-card to-transparent" />
            )}
          </motion.div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-neon transition-opacity hover:opacity-70"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="size-3" /> Less
              </>
            ) : (
              <>
                <ChevronDown className="size-3" /> Read reasoning
              </>
            )}
          </button>
        </div>

        <div className="mt-auto space-y-3">
          {/* Relevance Score Breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              <span>Relevance Match</span>
              <span>{offer.breakdown.relevance}%</span>
            </div>
            <Progress value={offer.breakdown.relevance} className="h-1.5" />
          </div>

          {/* Web Insights */}
          {offer.webInsights && offer.webInsights.length > 0 && (
            <div className="group/insight relative overflow-hidden rounded-lg border bg-card/50 p-4 backdrop-blur-sm">
              <div className="absolute right-2 top-2 opacity-5 transition-opacity group-hover/insight:opacity-10">
                <Search className="size-10" />
              </div>
              <span className="relative z-10 mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-neon">
                <Search className="size-3" /> Intelligence Insight
              </span>
              <p className="relative z-10 text-xs leading-relaxed text-muted-foreground">
                {offer.webInsights[0]}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </WidgetCard>
  );
}
