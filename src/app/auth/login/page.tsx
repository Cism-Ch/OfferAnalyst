"use client";

/**
 * Login Page
 * 
 * Allows users to sign in with:
 * - Email and password (with strict Better-Auth { data, error } verification)
 * - Google OAuth
 * - GitHub OAuth
 * - Or continue directly in Guest Mode
 */

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { useLanguage, type TranslationDictionary } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { PremiumThemeSelector } from "@/components/theme-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Loader2, Mail, Sparkles, UserCheck } from "lucide-react";
import { useToast } from "@/components/ui/toast";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function getLocalizedOAuthError(
  errorCode: string,
  errorDesc: string | null,
  t: TranslationDictionary
): string {
  switch (errorCode) {
    case "access_denied":
      return t.auth.oauthErrorAccessDenied;
    case "account_not_linked":
      return t.auth.oauthErrorAccountNotLinked;
    case "OAuthCallbackError":
      return t.auth.oauthErrorCallback;
    case "configuration":
      return t.auth.oauthErrorConfiguration;
    case "verification":
      return t.auth.oauthErrorVerification;
    default:
      return errorDesc || t.auth.oauthErrorDefault;
  }
}

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const oauthErrorCode = searchParams.get("error");
  const oauthError = oauthErrorCode
    ? getLocalizedOAuthError(oauthErrorCode, searchParams.get("error_description"), t)
    : "";
  const displayError = formError || oauthError;

  // Notify external toast system when OAuth error is present in query parameters
  useEffect(() => {
    if (!oauthErrorCode) return;
    const message = getLocalizedOAuthError(oauthErrorCode, searchParams.get("error_description"), t);
    toast.error(t.auth.oauthErrorDefault, message);
  }, [oauthErrorCode, searchParams, t, toast]);

  const isSafeRelativeUrl = (url: string | null): boolean => {
    if (!url) return false;
    return url.startsWith("/") && !url.startsWith("//") && !url.startsWith("/\\") && !url.includes("://");
  };

  const getCallbackUrl = (): string => {
    const from = searchParams.get("from");
    const callbackUrl = searchParams.get("callbackUrl");
    const redirect = searchParams.get("redirect");
    const cb = from || callbackUrl || redirect;
    return isSafeRelativeUrl(cb) ? (cb as string) : "/";
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setLoading(true);

    try {
      const callbackURL = getCallbackUrl();
      const res = await signIn.email({
        email: email.trim(),
        password,
        callbackURL,
      });

      if (res?.error) {
        setFormError(res.error.message || t.auth.errInvalidCredentials);
        return;
      }

      router.push(callbackURL);
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t.auth.errInvalidCredentials);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "google" | "github") => {
    setFormError("");
    setLoading(true);

    try {
      const callbackURL = getCallbackUrl();
      const res = await signIn.social({
        provider,
        callbackURL,
        errorCallbackURL: "/auth/login",
      });

      if (res?.error) {
        setFormError(res.error.message || t.auth.errInvalidCredentials);
        setLoading(false);
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t.auth.errInvalidCredentials);
      setLoading(false);
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-4"
        >
          <Card className="border-border/60 shadow-xl overflow-hidden py-0">
            <CardHeader className="space-y-2 text-center p-4 sm:p-6 pb-2 sm:pb-4">
              <div className="mx-auto w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md shadow-primary/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">{t.auth.loginTitle}</CardTitle>
              <CardDescription>{t.auth.loginSubtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
              {displayError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  role="alert"
                  className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-start gap-2.5"
                >
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium">{displayError}</p>
                </motion.div>
              )}

              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t.auth.emailLabel}</Label>
                  <Input
                    id="email"
                    type="email"
                    inputMode="email"
                    enterKeyHint="next"
                    placeholder={t.auth.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="email"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">{t.auth.passwordLabel}</Label>
                    <Link
                      href="/auth/reset"
                      className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                      {t.auth.forgotPassword}
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    enterKeyHint="done"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="current-password"
                    className="h-11"
                  />
                </div>

                <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t.auth.signingIn}
                    </>
                  ) : (
                    t.auth.signInBtn
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/60" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    {t.auth.orContinueWith}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuthLogin("google")}
                  disabled={loading}
                  className="h-11"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuthLogin("github")}
                  disabled={loading}
                  className="h-11"
                >
                  <GithubIcon className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3 border-t border-border/40 p-4 sm:p-6 pt-4 sm:pt-4">
              <p className="text-sm text-center text-muted-foreground w-full">
                {t.auth.noAccountYet}{" "}
                <Link
                  href={searchParams.get("from") ? `/auth/signup?from=${encodeURIComponent(searchParams.get("from")!)}` : "/auth/signup"}
                  className="text-primary hover:underline font-semibold"
                >
                  {t.auth.signUpLink}
                </Link>
              </p>
            </CardFooter>
          </Card>

          {/* Guest Mode Callout */}
          <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm p-3.5 flex items-start gap-3 text-xs text-muted-foreground">
            <UserCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="flex-1">
              <p>{t.auth.guestNotice}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-app flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
