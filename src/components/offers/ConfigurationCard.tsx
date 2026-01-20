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
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
      className="rounded-3xl border-zinc-200/50 shadow-xl dark:border-zinc-800/50"
      neonHover
      delay={0.1}
    >
      {/* Card Header */}
      <CardHeader className="px-8 pb-6 pt-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold tracking-tight">
            <div className="bg-neon/10 rounded-lg p-2 text-neon">
              <Sparkles size={24} />
            </div>
            Configuration
          </CardTitle>
          <Badge
            variant="outline"
            className="border-neon/30 bg-neon/5 gap-2 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neon"
          >
            <Bot size={14} /> AI Context Engine
          </Badge>
        </div>
        <CardDescription className="text-muted-foreground/80 text-base">
          Define your parameters. Enable Auto-Fetch for autonomous research.
        </CardDescription>
      </CardHeader>

      {/* Card Content - Form Fields */}
      <CardContent className="space-y-8 px-8">
        {/* Domain and Limit Row */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Domain Input */}
          <div className="space-y-3">
            <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Domain
            </Label>
            <Input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. Real Estate"
              className="focus:ring-neon/20 h-14 rounded-2xl border-zinc-200 bg-zinc-100/50 px-5 text-base transition-all focus:border-neon dark:border-zinc-800 dark:bg-zinc-900/50"
            />
          </div>

          {/* Limit Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Limit
            </Label>
            <ClientOnlySelect>
              <Select value={limit} onValueChange={setLimit}>
                <SelectTrigger className="focus:ring-neon/20 h-14 rounded-2xl border-zinc-200 bg-zinc-100/50 px-5 transition-all focus:border-neon dark:border-zinc-800 dark:bg-zinc-900/50">
                  <SelectValue placeholder="Select limit" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-zinc-200 dark:border-zinc-800">
                  <SelectItem value="3">Top 3 Results</SelectItem>
                  <SelectItem value="5">Top 5 Results</SelectItem>
                  <SelectItem value="10">Top 10 Results</SelectItem>
                </SelectContent>
              </Select>
            </ClientOnlySelect>
          </div>
        </div>

        {/* Criteria Row */}
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-3">
            <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Explicit Criteria
            </Label>
            <Input
              value={explicitCriteria}
              onChange={(e) => setExplicitCriteria(e.target.value)}
              placeholder="Budget range, essential technical requirements..."
              className="focus:ring-neon/20 h-14 rounded-2xl border-zinc-200 bg-zinc-100/50 px-5 text-base transition-all focus:border-neon dark:border-zinc-800 dark:bg-zinc-900/50"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Implicit Context
            </Label>
            <Textarea
              value={implicitContext}
              onChange={(e) => setImplicitContext(e.target.value)}
              placeholder="What are your hidden preferences? (e.g., safety, aesthetic, reputation)"
              className="focus:ring-neon/20 min-h-[120px] resize-none rounded-2xl border-zinc-200 bg-zinc-100/50 p-5 text-base transition-all focus:border-neon dark:border-zinc-800 dark:bg-zinc-900/50"
            />
          </div>
        </div>

        {/* Advanced Settings Toggle */}
        <div className="border-t border-zinc-200 pt-2 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex w-full items-center gap-2 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            <Settings2 size={14} />
            Advanced Configuration
            {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <motion.div
            initial={false}
            animate={{
              height: showAdvanced ? "auto" : 0,
              opacity: showAdvanced ? 1 : 0,
            }}
            className="overflow-hidden"
          >
            <div className="space-y-6 pb-2 pt-4">
              {/* Auto-Fetch Toggle Widget */}
              <div className="hover:border-neon/30 group flex items-center justify-between rounded-2xl border border-zinc-200/50 bg-zinc-100/30 p-5 backdrop-blur-sm transition-all dark:border-zinc-800/50 dark:bg-zinc-900/30">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2 text-lg font-bold">
                    Autonomous Fetching
                    {autoFetch && (
                      <motion.div
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="h-2 w-2 rounded-full bg-neon shadow-neon"
                      />
                    )}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Let AI engines crawl and extraction live data automatically.
                  </p>
                </div>
                <ClientOnlySwitch>
                  <Switch
                    checked={autoFetch}
                    onCheckedChange={setAutoFetch}
                    className="transition-colors data-[state=checked]:bg-neon"
                  />
                </ClientOnlySwitch>
              </div>

              {/* JSON Input with dynamic height */}
              <div className="space-y-3">
                <Label className="flex items-center justify-between text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  Raw Source Data (JSON)
                  {autoFetch && (
                    <Badge
                      variant="secondary"
                      className="bg-zinc-200 text-[10px] dark:bg-zinc-800"
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
                      "rounded-xl border-zinc-200 font-mono text-xs transition-all dark:border-zinc-800",
                      autoFetch
                        ? "h-20 bg-zinc-200/20 opacity-50 dark:bg-zinc-900/20"
                        : "focus:ring-neon/20 h-40 bg-zinc-100/50 dark:bg-zinc-900/50",
                    )}
                    placeholder="Data payload will appear here..."
                    disabled={autoFetch}
                  />
                  {autoFetch && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <span className="text-muted-foreground/50 text-[10px] font-bold uppercase tracking-[0.2em]">
                        Automated Pipeline Active
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </CardContent>

      {/* Card Footer - Action Button */}
      <CardFooter className="flex-col gap-4 px-8 pb-8 pt-4">
        <Button
          onClick={onAnalyze}
          disabled={loading}
          className={cn(
            "group relative h-16 w-full overflow-hidden rounded-2xl text-lg font-bold transition-all duration-500",
            loading
              ? "bg-zinc-100 text-zinc-400"
              : "bg-neon text-neon-foreground shadow-neon hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(212,255,0,0.5)] active:scale-[0.98]",
          )}
        >
          <div className="relative z-10 flex items-center justify-center gap-3">
            {loading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>
                  {fetching ? "FETCHING LIVE DATA" : "OPTIMIZING ANALYSIS"}
                </span>
              </>
            ) : (
              <>
                <Activity className="h-5 w-5 group-hover:animate-pulse" />
                <span>EXECUTE ANALYSIS WORKFLOW</span>
              </>
            )}
          </div>

          {!loading && (
            <div className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transform bg-white/20 transition-transform duration-500 group-hover:scale-x-100" />
          )}
        </Button>
        <p className="text-muted-foreground/50 text-center text-[10px] font-bold uppercase tracking-widest">
          Secured Enterprise Analysis Pipeline
        </p>
      </CardFooter>
    </WidgetCard>
  );
}
