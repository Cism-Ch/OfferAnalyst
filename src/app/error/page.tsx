"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { AlertCircle, Home, LogIn } from "lucide-react";

/**
 * Inner component to parse query parameters from Better-Auth or OAuth callbacks.
 * Encapsulated within Suspense to satisfy Next.js CSR/SSR requirements.
 */
function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const { title, message } = useMemo(() => {
    switch (error) {
      case "access_denied":
        return {
          title: "Connexion annulée",
          message: "L'autorisation d'accès a été annulée ou refusée auprès du fournisseur tiers.",
        };
      case "account_not_linked":
        return {
          title: "Compte non lié",
          message: "Un compte avec cette adresse e-mail existe déjà. Veuillez vous connecter avec votre mot de passe habituel pour lier vos comptes.",
        };
      case "configuration":
      case "Configuration":
        return {
          title: "Erreur de configuration",
          message: "La configuration du service d'authentification a rencontré un problème technique.",
        };
      case "OAuthCallbackError":
      case "oauth_callback_error":
        return {
          title: "Échec de connexion OAuth",
          message: "Impossible de finaliser l'échange d'authentification avec le fournisseur tiers. Veuillez réessayer.",
        };
      case "verification":
      case "Verification":
        return {
          title: "Lien expiré",
          message: "Le jeton ou lien de vérification est expiré ou invalide.",
        };
      default:
        return {
          title: "Erreur d'authentification",
          message: errorDescription || error || "Une erreur inattendue est survenue lors de l'authentification.",
        };
    }
  }, [error, errorDescription]);

  const loginRedirectUrl = error 
    ? `/auth/login?error=${encodeURIComponent(error)}`
    : "/auth/login";

  return (
    <Card className="w-full max-w-md shadow-2xl border-border/40 backdrop-blur-md bg-card/80">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shadow-inner">
          <AlertCircle className="h-7 w-7" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground leading-relaxed">
          {message}
        </CardDescription>
      </CardHeader>

      {error && (
        <CardContent className="pt-0 pb-4">
          <div className="rounded-lg bg-muted/50 p-3 text-xs font-mono text-muted-foreground break-all border border-border/50 text-center">
            Code: {error}
          </div>
        </CardContent>
      )}

      <CardFooter className="flex flex-col gap-3 pt-2">
        <Button asChild className="w-full h-11 text-sm font-medium shadow-md" variant="default">
          <Link href={loginRedirectUrl}>
            <LogIn className="mr-2 h-4 w-4" />
            Retourner à la page de connexion
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full h-11 text-sm font-medium">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Retour à l&apos;accueil
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * Defensive fallback error page for Better-Auth (/error?error=...)
 * Ensures users are never confronted with a 404 Not Found error.
 */
export default function ErrorPage() {
  return (
    <main className="min-h-app flex items-center justify-center p-4 bg-gradient-to-b from-background via-background/95 to-muted/30">
      <Suspense
        fallback={
          <Card className="w-full max-w-md p-8 text-center text-muted-foreground">
            <p>Chargement des détails de l&apos;erreur...</p>
          </Card>
        }
      >
        <AuthErrorContent />
      </Suspense>
    </main>
  );
}
