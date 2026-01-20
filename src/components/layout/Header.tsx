"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Sparkles, Activity } from "lucide-react";
import { AI_MODEL_OPTIONS, getModelOption } from "@/lib/ai-models";
import { cn } from "@/lib/utils";
import { NeonSwitcher } from "@/components/premium/NeonSwitcher";
import { useRouter } from "next/navigation";

interface HeaderProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

/**
 * Header Component
 *
 * Top navigation bar that includes:
 * - Page title
 * - Search functionality
 * - Theme toggle
 * - Settings access
 *
 * This component provides consistent navigation and controls
 * across the application interface.
 *
 * @returns {JSX.Element} The header
 */
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings as SettingsIcon, Shield } from "lucide-react";

export function Header({ selectedModel, onModelChange }: HeaderProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const activeModel = getModelOption(selectedModel);
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const [search, setSearch] = useState("");

  return (
    <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b bg-white/80 px-8 backdrop-blur-xl dark:bg-zinc-950/80">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-neon" />
          <h1 className="to-foreground/70 bg-gradient-to-r from-foreground bg-clip-text text-xl font-bold tracking-tight">
            Dashboard
          </h1>
        </div>
        <div className="h-6 w-px bg-border" />
        <NeonSwitcher />
      </div>

      <div className="flex items-center gap-5">
        <div className="group relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-neon" />
          <Input
            type="search"
            placeholder="Neural Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="focus:ring-neon/20 h-10 w-72 rounded-xl border-none bg-zinc-100 pl-10 transition-all focus:bg-white focus:ring-2 dark:bg-zinc-900 dark:focus:bg-zinc-800"
          />
        </div>

        <div className="h-6 w-px bg-border" />
        <ThemeToggle />

        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 overflow-hidden rounded-xl border border-zinc-200 p-0 dark:border-zinc-800"
              >
                <Avatar className="h-full w-full rounded-none">
                  <AvatarImage
                    src={
                      session.user.image ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.name}`
                    }
                  />
                  <AvatarFallback className="bg-zinc-800 text-white">
                    {session.user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 rounded-2xl border-zinc-200 p-2 dark:border-zinc-800"
              align="end"
              forceMount
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold leading-none">
                    {session.user.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session.user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
              <DropdownMenuItem className="gap-3 rounded-2xl py-2.5">
                <User className="h-4 w-4" />
                <span className="font-medium">Profile Protocol</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-3 rounded-2xl py-2.5">
                <Shield className="h-4 w-4" />
                <span className="font-medium">Security Matrix</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-3 rounded-2xl py-2.5">
                <SettingsIcon className="h-4 w-4" />
                <span className="font-medium">Interface Config</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
              <DropdownMenuItem
                className="focus:bg-destructive/10 gap-3 rounded-2xl py-2.5 text-destructive focus:text-destructive"
                onClick={async () => {
                  await authClient.signOut();
                  router.push("/auth/login");
                  router.refresh();
                }}
              >
                <LogOut className="h-4 w-4" />
                <span className="font-bold">Terminate Session</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/auth/login" className="hidden sm:block">
            <Button className="h-10 rounded-2xl bg-neon text-[10px] font-bold uppercase tracking-widest text-neon-foreground shadow-neon">
              Authenticate
            </Button>
          </Link>
        )}

        {/* Model Switcher */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="hover:bg-neon/5 group h-10 rounded-2xl border-dashed transition-all hover:border-neon"
            >
              <Sparkles className="mr-2 h-4 w-4 text-neon group-hover:animate-pulse" />
              <div className="flex flex-col items-start text-left leading-tight">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                  Engine
                </span>
                <span className="max-w-[120px] truncate text-xs font-bold">
                  {activeModel.label}
                </span>
              </div>
            </Button>
          </DialogTrigger>
          {/* ... rest of dialog ... */}
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Choisir le modèle IA</DialogTitle>
              <DialogDescription>
                Sélectionnez un modèle OpenRouter en fonction de votre budget et
                du niveau de raisonnement souhaité.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
              {AI_MODEL_OPTIONS.map((option) => {
                const isActive = option.id === selectedModel;
                return (
                  <button
                    type="button"
                    key={option.id}
                    onClick={() => {
                      onModelChange(option.id);
                      setDialogOpen(false);
                    }}
                    className={cn(
                      "w-full rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                      isActive
                        ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10 dark:bg-blue-950/20"
                        : "border-slate-200 hover:border-blue-400/80 hover:bg-slate-50 dark:border-zinc-700 dark:hover:bg-zinc-800",
                    )}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-base font-semibold">
                          {option.label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            option.tier === "free" ? "secondary" : "outline"
                          }
                        >
                          {option.tier === "free" ? "Gratuit" : "Pro"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {option.contextWindow}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{option.provider}</span>
                      <span>
                        {option.latency === "reasoning"
                          ? "Reasoning"
                          : option.latency === "fast"
                            ? "Rapide"
                            : "Équilibré"}
                      </span>
                      <span className="font-semibold text-primary">
                        {option.price}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {option.highlights.map((highlight) => (
                        <span
                          key={highlight}
                          className="rounded-full bg-white/50 px-2 py-1 text-xs text-slate-600 dark:bg-zinc-900/50 dark:text-zinc-100"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
