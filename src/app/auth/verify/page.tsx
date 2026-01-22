"use client";

/**
 * Email Verification Page
 * 
 * Handles email verification after signup.
 * Users land here after clicking the verification link in their email.
 */

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link");
      return;
    }

    const verifyEmail = async (token: string) => {
      try {
        // TODO: Implement email verification API call
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Verification failed");
        }

        setStatus("success");
        setMessage("Your email has been verified successfully!");
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } catch (err) {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Failed to verify email");
      }
    };

    verifyEmail(token);
  }, [searchParams, router]);

  const handleResendEmail = async () => {
    // TODO: Implement resend verification email
    console.log("Resending verification email...");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="space-y-1 text-center">
            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
              status === "loading"
                ? "bg-blue-100 dark:bg-blue-900/20"
                : status === "success"
                ? "bg-green-100 dark:bg-green-900/20"
                : "bg-red-100 dark:bg-red-900/20"
            }`}>
              {status === "loading" && (
                <Loader2 className="h-6 w-6 text-blue-600 dark:text-blue-500 animate-spin" />
              )}
              {status === "success" && (
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-500" />
              )}
              {status === "error" && (
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-500" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold">
              {status === "loading" && "Verifying your email..."}
              {status === "success" && "Email verified!"}
              {status === "error" && "Verification failed"}
            </CardTitle>
            <CardDescription>
              {message || "Please wait while we verify your email address"}
            </CardDescription>
          </CardHeader>
          
          {status === "success" && (
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Redirecting you to the dashboard...
              </p>
            </CardContent>
          )}

          {status === "error" && (
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                The verification link may have expired or is invalid.
              </p>
              <Button onClick={handleResendEmail} variant="outline" className="w-full">
                Resend verification email
              </Button>
            </CardContent>
          )}

          <CardFooter className="flex flex-col gap-2">
            {status !== "loading" && (
              <Link href="/auth/login" className="w-full">
                <Button variant="ghost" className="w-full">
                  Back to login
                </Button>
              </Link>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
