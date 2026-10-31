"use client";

/**
 * Email Verification Page (FR/EN Bilingual)
 * 
 * Handles email verification after signup.
 */

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { PremiumThemeSelector } from "@/components/theme-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, t } = useLanguage();
  const isFr = language === "fr";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    const token = searchParams.get("token");

    const timer = setTimeout(async () => {
      if (!token) {
        if (isMounted) {
          setStatus("error");
          setMessage(isFr ? "Lien de vérification invalide" : "Invalid verification link");
        }
        return;
      }

      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || (isFr ? "Échec de la vérification" : "Verification failed"));
        }

        if (isMounted) {
          setStatus("success");
          setMessage(
            isFr
              ? "Votre adresse email a été vérifiée avec succès !"
              : "Your email has been verified successfully!"
          );
        }

        setTimeout(() => {
          if (isMounted) {
            router.push("/");
          }
        }, 2000);
      } catch (err) {
        if (isMounted) {
          setStatus("error");
          setMessage(
            err instanceof Error
              ? err.message
              : isFr
              ? "Impossible de vérifier l'adresse email"
              : "Failed to verify email"
          );
        }
      }
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchParams, router, isFr]);

  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendEmail, setResendEmail] = useState(searchParams.get("email") || "");
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  useEffect(() => {
    if (resendCooldown > 0) {
      const interval = setInterval(() => {
        setResendCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    if (!resendEmail || resendCooldown > 0) return;
    setResending(true);
    setResendStatus(null);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error ||
            (isFr ? "Échec du renvoi de l'email de vérification" : "Failed to resend verification email")
        );
      }

      setResendStatus(
        isFr
          ? "Email de vérification envoyé ! Vérifiez votre boîte de réception."
          : "Verification email sent! Check your inbox."
      );
      setResendCooldown(60);
    } catch (err) {
      setResendStatus(
        err instanceof Error
          ? err.message
          : isFr
          ? "Erreur lors de l'envoi de l'email"
          : "Error sending email"
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-app flex flex-col bg-gradient-to-br from-background via-background to-muted/40">
      {/* Top Bar */}
      <header className="w-full max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors min-h-11 px-3 rounded-lg hover:bg-muted/60"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t.auth.backToApp}</span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <PremiumThemeSelector />
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-3 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Card className="border-border/60 shadow-xl overflow-hidden py-0">
            <CardHeader className="space-y-1 text-center p-4 sm:p-6 pb-2">
              <div
                className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  status === "loading"
                    ? "bg-primary/15"
                    : status === "success"
                    ? "bg-emerald-500/15"
                    : "bg-destructive/15"
                }`}
              >
                {status === "loading" && <Loader2 className="h-6 w-6 text-primary animate-spin" />}
                {status === "success" && <CheckCircle2 className="h-6 w-6 text-emerald-500" />}
                {status === "error" && <XCircle className="h-6 w-6 text-destructive" />}
              </div>
              <CardTitle className="text-2xl font-bold">
                {status === "loading" &&
                  (isFr ? "Vérification de votre email..." : "Verifying your email...")}
                {status === "success" && (isFr ? "Email vérifié !" : "Email verified!")}
                {status === "error" &&
                  (isFr ? "Échec de la vérification" : "Verification failed")}
              </CardTitle>
              <CardDescription>
                {message ||
                  (isFr
                    ? "Veuillez patienter pendant la vérification de votre adresse email"
                    : "Please wait while we verify your email address")}
              </CardDescription>
            </CardHeader>

            {status === "success" && (
              <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
                <p className="text-sm text-muted-foreground text-center">
                  {isFr
                    ? "Redirection vers le tableau de bord..."
                    : "Redirecting you to the dashboard..."}
                </p>
              </CardContent>
            )}

            {status === "error" && (
              <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
                <p className="text-sm text-muted-foreground text-center">
                  {isFr
                    ? "Le lien de vérification a peut-être expiré ou est invalide."
                    : "The verification link may have expired or is invalid."}
                </p>

                <div className="space-y-2">
                  <Input
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    enterKeyHint="send"
                    placeholder={t.auth.emailPlaceholder}
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="h-11"
                  />
                  <Button
                    onClick={handleResendEmail}
                    variant="outline"
                    disabled={resending || resendCooldown > 0 || !resendEmail}
                    className="w-full h-11"
                  >
                    {resending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : resendCooldown > 0 ? (
                      isFr ? `Renvoyer dans ${resendCooldown}s` : `Resend in ${resendCooldown}s`
                    ) : isFr ? (
                      "Renvoyer l'email de vérification"
                    ) : (
                      "Resend verification email"
                    )}
                  </Button>
                  {resendStatus && (
                    <p className="text-xs text-center text-muted-foreground">{resendStatus}</p>
                  )}
                </div>
              </CardContent>
            )}

            <CardFooter className="flex flex-col gap-2 p-4 sm:p-6 pt-0">
              {status !== "loading" && (
                <Link href="/auth/login" className="w-full">
                  <Button variant="ghost" className="w-full h-11">
                    {isFr ? "Retour à la connexion" : "Back to login"}
                  </Button>
                </Link>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-app flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
