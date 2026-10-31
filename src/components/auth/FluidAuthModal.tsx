"use client";

/**
 * Fluid Authentication Modal for Guests
 * 
 * Accessible dialog (Radix UI primitive) encouraging unauthenticated guests to sign in or register
 * when attempting to access cloud-persisted features (saved offers, projects, dashboard, BYOK).
 * Provides 1-click Google OAuth, GitHub OAuth, and email navigation while preserving target path.
 */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Sparkles,
  Clock,
  Bookmark,
  Key,
  Mail,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export interface FluidAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetPath?: string;
}

export function FluidAuthModal({
  open,
  onOpenChange,
  targetPath = "/",
}: FluidAuthModalProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [loadingProvider, setLoadingProvider] = useState<"google" | "github" | null>(null);
  const [error, setError] = useState<string>("");

  const handleOAuth = async (provider: "google" | "github") => {
    setError("");
    setLoadingProvider(provider);

    try {
      const res = await signIn.social({
        provider,
        callbackURL: targetPath,
        errorCallbackURL: "/auth/login",
      });

      if (res?.error) {
        setError(res.error.message || t.auth.errInvalidCredentials);
        setLoadingProvider(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.auth.errInvalidCredentials);
      setLoadingProvider(null);
    }
  };

  const handleNavigate = (path: string) => {
    onOpenChange(false);
    const destination = targetPath
      ? `${path}?from=${encodeURIComponent(targetPath)}`
      : path;
    router.push(destination);
  };

  const benefits = [
    {
      icon: Clock,
      title: t.auth.fluidModalBenefitHistoryTitle,
      description: t.auth.fluidModalBenefitHistoryDesc,
    },
    {
      icon: Bookmark,
      title: t.auth.fluidModalBenefitSavedTitle,
      description: t.auth.fluidModalBenefitSavedDesc,
    },
    {
      icon: Key,
      title: t.auth.fluidModalBenefitApiTitle,
      description: t.auth.fluidModalBenefitApiDesc,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="bottom-sheet" className="sm:max-w-md p-4 sm:p-6 gap-4 sm:gap-5">
        <DialogHeader className="text-center sm:text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 border border-primary/20 flex items-center justify-center shadow-inner">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {t.auth.fluidModalTitle}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {t.auth.fluidModalSubtitle}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            {error}
          </div>
        )}

        {/* Benefits list */}
        <div className="space-y-2.5 py-1">
          {benefits.map((benefit, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-2.5 rounded-xl bg-muted/40 border border-border/50 text-left transition-colors hover:bg-muted/60"
            >
              <div className="p-2 rounded-lg bg-background border border-border/80 text-primary shrink-0 mt-0.5">
                <benefit.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground">
                  {benefit.title}
                </p>
                <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          {/* 1-Click Google OAuth */}
          <Button
            type="button"
            className="w-full h-11 font-medium justify-center gap-2 shadow-sm"
            onClick={() => handleOAuth("google")}
            disabled={loadingProvider !== null}
          >
            {loadingProvider === "google" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            <span>{t.auth.fluidModalGoogleBtn}</span>
          </Button>

          {/* GitHub OAuth */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-10 font-medium justify-center gap-2"
            onClick={() => handleOAuth("github")}
            disabled={loadingProvider !== null}
          >
            {loadingProvider === "github" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GithubIcon className="h-4 w-4" />
            )}
            <span>{t.auth.fluidModalGithubBtn}</span>
          </Button>

          {/* Email options row */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              className="h-9 text-xs font-medium"
              onClick={() => handleNavigate("/auth/login")}
              disabled={loadingProvider !== null}
            >
              <span>{t.auth.fluidModalEmailSignIn}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-9 text-xs font-medium justify-between group"
              onClick={() => handleNavigate("/auth/signup")}
              disabled={loadingProvider !== null}
            >
              <span>{t.auth.fluidModalEmailSignUp}</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
        </div>

        {/* Dismiss / Guest Notice footer */}
        <div className="pt-2 text-center border-t border-border/40">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1 px-2 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {t.auth.fluidModalContinueGuest}
          </button>
          <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/70">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Sécurisé avec Better-Auth & chiffrement AES-256</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
