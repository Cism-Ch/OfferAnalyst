"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * AuthGuard Component
 *
 * Protects client-side routes by checking authentication status.
 * Redirects to /auth/login if not authenticated.
 * Shows loading spinner while checking session.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-neon" />
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Verifying Session...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
