"use client";

/**
 * Signup Page
 * 
 * Registration form with strict Better-Auth { data, error } verification,
 * OAuth support, FR/EN bilingualism, and Guest Mode navigation.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp, signIn } from "@/lib/auth-client";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { PremiumThemeSelector } from "@/components/theme-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Loader2, Mail, Sparkles } from "lucide-react";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t.auth.errPasswordMismatch);
      return;
    }

    if (password.length < 8) {
      setError(t.auth.errPasswordLength);
      return;
    }

    if (!agreeToTerms) {
      setError(
        language === "fr"
          ? "Vous devez accepter les Conditions d'Utilisation et la Politique de Confidentialité."
          : "You must agree to the Terms of Service and Privacy Policy."
      );
      return;
    }

    setLoading(true);

    try {
      const res = await signUp.email({
        email: email.trim(),
        password,
        name: name.trim(),
        callbackURL: "/onboarding",
      });

      if (res?.error) {
        setError(res.error.message || t.auth.errSignupFailed);
        return;
      }

      router.push("/onboarding");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.auth.errSignupFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignup = async (provider: "google" | "github") => {
    setError("");

    if (!agreeToTerms) {
      setError(
        language === "fr"
          ? "Vous devez accepter les Conditions d'Utilisation et la Politique de Confidentialité."
          : "You must agree to the Terms of Service and Privacy Policy."
      );
      return;
    }

    setLoading(true);

    try {
      const res = await signIn.social({
        provider,
        callbackURL: "/onboarding",
        errorCallbackURL: "/auth/login",
      });

      if (res?.error) {
        setError(res.error.message || t.auth.errSignupFailed);
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.auth.errSignupFailed);
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
          className="w-full max-w-md"
        >
          <Card className="border-border/60 shadow-xl overflow-hidden py-0">
            <CardHeader className="space-y-2 text-center p-4 sm:p-6 pb-2 sm:pb-4">
              <div className="mx-auto w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md shadow-primary/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">{t.auth.signupTitle}</CardTitle>
              <CardDescription>{t.auth.signupSubtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  role="alert"
                  className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-start gap-2.5"
                >
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleEmailSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t.auth.nameLabel}</Label>
                  <Input
                    id="name"
                    type="text"
                    enterKeyHint="next"
                    placeholder={t.auth.namePlaceholder}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="name"
                    className="h-11"
                  />
                </div>

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
                  <Label htmlFor="password">{t.auth.passwordLabel}</Label>
                  <Input
                    id="password"
                    type="password"
                    enterKeyHint="next"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={8}
                    autoComplete="new-password"
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t.auth.passwordMinHint}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t.auth.confirmPasswordLabel}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    enterKeyHint="done"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="new-password"
                    className="h-11"
                  />
                </div>

                <div className="flex items-start space-x-2.5 pt-1">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                    disabled={loading}
                    className="mt-0.5"
                  />
                  <label
                    htmlFor="terms"
                    className="text-xs text-muted-foreground leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t.auth.termsAgreement}{" "}
                    <Link href="/terms" className="text-primary hover:underline font-medium">
                      ({language === "fr" ? "CGU" : "Terms"})
                    </Link>{" "}
                    &{" "}
                    <Link href="/privacy" className="text-primary hover:underline font-medium">
                      ({language === "fr" ? "Confidentialité" : "Privacy"})
                    </Link>
                  </label>
                </div>

                <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t.auth.creatingAccount}
                    </>
                  ) : (
                    t.auth.signUpBtn
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
                  onClick={() => handleOAuthSignup("google")}
                  disabled={loading}
                  className="h-11"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuthSignup("github")}
                  disabled={loading}
                  className="h-11"
                >
                  <GithubIcon className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/40 p-4 sm:p-6 pt-4 sm:pt-4">
              <p className="text-sm text-center text-muted-foreground w-full">
                {t.auth.alreadyHaveAccount}{" "}
                <Link href="/auth/login" className="text-primary hover:underline font-semibold">
                  {t.auth.signInLink}
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
