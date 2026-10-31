"use client";

/**
 * Reset Password Page
 * 
 * Two-step process (FR/EN Bilingual):
 * 1. Request reset (enter email)
 * 2. Enter new password (after clicking email link with token)
 */

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { PremiumThemeSelector } from "@/components/theme-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft, KeyRound } from "lucide-react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, t } = useLanguage();
  const isFr = language === "fr";
  const token = searchParams.get("token");

  // Step 1 state (request link)
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Step 2 state (set new password)
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.error ||
            (isFr ? "Échec de l'envoi de l'email de réinitialisation" : "Failed to send reset email")
        );
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isFr
          ? "Échec de l'envoi de l'email de réinitialisation"
          : "Failed to send reset email"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError(t.auth.errPasswordMismatch);
      return;
    }

    if (newPassword.length < 8) {
      setError(t.auth.errPasswordLength);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error ||
            (isFr ? "Impossible de réinitialiser le mot de passe" : "Failed to reset password")
        );
      }

      setPasswordResetSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 2500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isFr
          ? "Impossible de mettre à jour le mot de passe"
          : "Failed to update password"
      );
    } finally {
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
        {passwordResetSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <Card className="border-border/60 shadow-xl overflow-hidden py-0">
              <CardHeader className="space-y-1 text-center p-4 sm:p-6 pb-2">
                <div className="mx-auto w-12 h-12 bg-emerald-500/15 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
                <CardTitle className="text-2xl font-bold">
                  {isFr ? "Mot de passe réinitialisé !" : "Password reset successful!"}
                </CardTitle>
                <CardDescription>
                  {isFr
                    ? "Votre mot de passe a été mis à jour en toute sécurité. Redirection vers la connexion..."
                    : "Your password has been securely updated. Redirecting to login..."}
                </CardDescription>
              </CardHeader>
              <CardFooter className="p-4 sm:p-6 pt-2">
                <Link href="/auth/login" className="w-full">
                  <Button className="w-full h-11">
                    {isFr ? "Aller à la connexion" : "Go to Login"}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        ) : token ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <Card className="border-border/60 shadow-xl overflow-hidden py-0">
              <CardHeader className="space-y-1 text-center p-4 sm:p-6 pb-2">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <KeyRound className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">
                  {isFr ? "Nouveau mot de passe" : "Set new password"}
                </CardTitle>
                <CardDescription>
                  {isFr
                    ? "Choisissez un mot de passe robuste (au moins 8 caractères)"
                    : "Choose a strong password for your account (minimum 8 characters)"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSetNewPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">
                      {isFr ? "Nouveau mot de passe" : "New Password"}
                    </Label>
                    <Input
                      id="new-password"
                      type="password"
                      autoComplete="new-password"
                      enterKeyHint="next"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={loading}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">{t.auth.confirmPasswordLabel}</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      enterKeyHint="done"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={loading}
                      className="h-11"
                    />
                  </div>

                  <Button type="submit" className="w-full h-11" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isFr ? "Mise à jour..." : "Updating password..."}
                      </>
                    ) : isFr ? (
                      "Réinitialiser le mot de passe"
                    ) : (
                      "Reset password"
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="p-4 sm:p-6 pt-0">
                <Link href="/auth/login" className="w-full">
                  <Button variant="ghost" className="w-full h-11">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {isFr ? "Retour à la connexion" : "Back to login"}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        ) : success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <Card className="border-border/60 shadow-xl overflow-hidden py-0">
              <CardHeader className="space-y-1 text-center p-4 sm:p-6 pb-2">
                <div className="mx-auto w-12 h-12 bg-emerald-500/15 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
                <CardTitle className="text-2xl font-bold">
                  {isFr ? "Vérifiez votre boîte mail" : "Check your email"}
                </CardTitle>
                <CardDescription>
                  {isFr ? (
                    <>
                      Nous avons envoyé un lien de réinitialisation à <strong>{email}</strong>
                    </>
                  ) : (
                    <>
                      We&apos;ve sent a password reset link to <strong>{email}</strong>
                    </>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
                <p className="text-sm text-muted-foreground text-center">
                  {isFr
                    ? "Cliquez sur le lien dans l'email pour choisir un nouveau mot de passe. Ce lien expire dans 1 heure."
                    : "Click the link in the email to reset your password. The link will expire in 1 hour."}
                </p>
                <p className="text-sm text-muted-foreground text-center">
                  {isFr ? "Vous n'avez rien reçu ? Vérifiez vos spams ou " : "Didn't receive the email? Check your spam folder or "}
                  <button
                    type="button"
                    onClick={() => setSuccess(false)}
                    className="text-primary hover:underline font-medium"
                  >
                    {isFr ? "réessayez" : "try again"}
                  </button>
                </p>
              </CardContent>
              <CardFooter className="p-4 sm:p-6 pt-0">
                <Link href="/auth/login" className="w-full">
                  <Button variant="outline" className="w-full h-11">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {isFr ? "Retour à la connexion" : "Back to login"}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <Card className="border-border/60 shadow-xl overflow-hidden py-0">
              <CardHeader className="space-y-1 p-4 sm:p-6 pb-2">
                <CardTitle className="text-2xl font-bold text-center">
                  {isFr ? "Mot de passe oublié" : "Reset password"}
                </CardTitle>
                <CardDescription className="text-center">
                  {isFr
                    ? "Saisissez votre adresse email pour recevoir un lien de réinitialisation"
                    : "Enter your email address and we'll send you a reset link"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-start gap-2"
                  >
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </motion.div>
                )}

                <form onSubmit={handleResetRequest} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t.auth.emailLabel}</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      enterKeyHint="send"
                      placeholder={t.auth.emailPlaceholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="h-11"
                    />
                  </div>

                  <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isFr ? "Envoi en cours..." : "Sending reset link..."}
                      </>
                    ) : isFr ? (
                      "Envoyer le lien de réinitialisation"
                    ) : (
                      "Send reset link"
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="p-4 sm:p-6 pt-0">
                <Link href="/auth/login" className="w-full">
                  <Button variant="ghost" className="w-full h-11">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {isFr ? "Retour à la connexion" : "Back to login"}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-app flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
