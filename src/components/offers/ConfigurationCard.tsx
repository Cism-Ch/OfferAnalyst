"use client";

import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ClientOnlySelect } from "@/components/ClientOnlySelect";
import { ClientOnlySwitch } from "@/components/ClientOnlySwitch";
import React from "react";
import {
  Loader2,
  Sparkles,
  Bot,
  Activity,
  Settings2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeInUp } from "@/lib/animations";

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

import { WidgetCard } from "@/components/premium/WidgetCard";

/**
 * ConfigurationCard Component
 *
 * Main configuration interface for setting up offer analysis parameters.
 * Allows users to define their search criteria and preferences before
 * initiating the AI-powered analysis workflow.
 *
 * Features:
 * - Domain selection for offer categorization
 * - Explicit criteria input (hard requirements)
 * - Implicit context input (soft preferences)
 * - Auto-fetch toggle for AI web scraping
 * - Manual JSON offer input
 * - Result limit selection
 * - Workflow initiation button
 *
 * @param {ConfigurationCardProps} props - Component props
 * @returns {JSX.Element} The configuration card
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
  onAnalyze,
}: ConfigurationCardProps) {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  return (
    <WidgetCard
      className="border-border/50 shadow-lg"
      neonHover
      delay={0.1}
    >
      {/* Card Header */}
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="rounded-lg bg-neon/10 p-2 text-neon">
              <Sparkles className="size-6" />
            </div>
            Configuration
          </CardTitle>
          <Badge
            variant="outline"
            className="gap-2 border-neon/30 bg-neon/5 text-[10px] font-bold uppercase tracking-wider text-neon"
          >
            <Bot className="size-3.5" /> AI Context Engine
          </Badge>
        </div>
        <CardDescription className="text-base text-muted-foreground">
          Define your parameters. Enable Auto-Fetch for autonomous research.
        </CardDescription>
      </CardHeader>

      {/* Card Content - Form Fields */}
      <CardContent className="space-y-6">
        {/* Domain and Limit Row */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Domain Input */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Domain
            </Label>
            <Input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. Real Estate"
              className="h-11 transition-colors focus:border-neon/50 focus:ring-neon/20"
            />
          </div>

          {/* Limit Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Limit
            </Label>
            <ClientOnlySelect>
              <Select value={limit} onValueChange={setLimit}>
                <SelectTrigger className="h-11 transition-colors focus:border-neon/50 focus:ring-neon/20">
                  <SelectValue placeholder="Select limit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">Top 3 Results</SelectItem>
                  <SelectItem value="5">Top 5 Results</SelectItem>
                  <SelectItem value="10">Top 10 Results</SelectItem>
                </SelectContent>
              </Select>
            </ClientOnlySelect>
          </div>
        </div>

        {/* Criteria Row */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Explicit Criteria
            </Label>
            <Input
              value={explicitCriteria}
              onChange={(e) => setExplicitCriteria(e.target.value)}
              placeholder="Budget range, essential technical requirements..."
              className="h-11 transition-colors focus:border-neon/50 focus:ring-neon/20"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Implicit Context
            </Label>
            <Textarea
              value={implicitContext}
              onChange={(e) => setImplicitContext(e.target.value)}
              placeholder="What are your hidden preferences? (e.g., safety, aesthetic, reputation)"
              className="min-h-[100px] resize-none transition-colors focus:border-neon/50 focus:ring-neon/20"
            />
          </div>
        </div>

        {/* Advanced Settings Toggle */}
        <div className="border-t pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex w-full items-center gap-2 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
          >
            <Settings2 className="size-4" />
            Advanced Configuration
            {showAdvanced ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="space-y-4 pt-4">
                  {/* Auto-Fetch Toggle Widget */}
                  <div className="group flex items-center justify-between rounded-lg border bg-card/50 p-4 backdrop-blur-sm transition-colors hover:border-neon/30">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2 text-base font-semibold">
                        Autonomous Fetching
                        {autoFetch && (
                          <motion.div
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="size-2 rounded-full bg-neon shadow-neon"
                          />
                        )}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Let AI engines crawl and extract live data
                        automatically.
                      </p>
                    </div>
                    <ClientOnlySwitch>
                      <Switch
                        checked={autoFetch}
                        onCheckedChange={setAutoFetch}
                        className="data-[state=checked]:bg-neon"
                      />
                    </ClientOnlySwitch>
                  </div>

                  {/* JSON Input with dynamic height */}
                  <div className="space-y-2">
                    <Label className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Raw Source Data (JSON)
                      {autoFetch && (
                        <Badge
                          variant="secondary"
                          className="text-[10px]"
                        >
                          Dynamic Managed
                        </Badge>
                      )}
                    </Label>
                    <div className="relative">
                      <Textarea
                        value={offersInput}
                        onChange={(e) => setOffersInput(e.target.value)}
                        className={cn(
                          "font-mono text-xs transition-all",
                          autoFetch
                            ? "h-20 opacity-50"
                            : "h-40 focus:border-neon/50 focus:ring-neon/20",
                        )}
                        placeholder="Data payload will appear here..."
                        disabled={autoFetch}
                      />
                      {autoFetch && (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                            Automated Pipeline Active
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>

      {/* Card Footer - Action Button */}
      <CardFooter className="flex-col gap-3 pt-4">
        <Button
          onClick={onAnalyze}
          disabled={loading}
          size="lg"
          className={cn(
            "group relative h-14 w-full overflow-hidden text-base font-bold transition-all duration-300",
            loading
              ? "bg-muted text-muted-foreground"
              : "bg-neon text-neon-foreground shadow-neon hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(212,255,0,0.4)] active:scale-[0.98]",
          )}
        >
          <div className="relative z-10 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                <span>
                  {fetching ? "Fetching Live Data" : "Optimizing Analysis"}
                </span>
              </>
            ) : (
              <>
                <Activity className="size-5 group-hover:animate-pulse" />
                <span>Execute Analysis Workflow</span>
              </>
            )}
          </div>

          {!loading && (
            <motion.div
              className="absolute inset-x-0 bottom-0 h-0.5 bg-white/30"
              initial={{ scaleX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </Button>
        <p className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
          Secured Enterprise Analysis Pipeline
        </p>
      </CardFooter>
    </WidgetCard>
  );
}
