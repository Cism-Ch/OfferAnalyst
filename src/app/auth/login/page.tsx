"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WidgetCard } from "@/components/premium/WidgetCard";
import { Sparkles, Bot, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

/**
 * Premium Authentication Page.
 * Handles Login and Signup with a high-end neon aesthetic.
 */
export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailAuth = async (
    e: React.FormEvent<HTMLFormElement>,
    type: "login" | "signup",
  ) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    try {
      // Validate input
      if (type === "signup") {
        signupSchema.parse({ name, email, password });
      } else {
        loginSchema.parse({ email, password });
      }

      // Perform auth
      if (type === "signup") {
        const { data, error: signupError } = await authClient.signUp.email({
          email,
          password,
          name,
        });
        if (signupError) throw signupError;

        toast.success("Account created successfully", {
          description: `Welcome to the protocol, ${data?.user?.name || "Agent"}. Redirecting...`,
        });
      } else {
        const { data, error: signinError } = await authClient.signIn.email({
          email,
          password,
        });
        if (signinError) throw signinError;

        toast.success("Authentication successful", {
          description: `Welcome back, ${data?.user?.name || "Commander"}.`,
        });
      }
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        // Validation error
        toast.error("Validation failed", {
          description: err.issues[0].message,
        });
      } else {
        // Auth error
        const message =
          err instanceof Error
            ? err.message
            : "Please check your credentials and try again.";
        toast.error("Authentication failed", {
          description: message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="z-10 w-full max-w-md"
      >
        {/* Logo Section */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neon shadow-neon">
            <Sparkles className="text-neon-foreground" size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-foreground">
            OFFER ANALYST
          </h1>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Intelligence Protocol v2.0
          </p>
        </div>

        <WidgetCard className="bg-card/80 rounded-3xl border-zinc-200/50 p-1 backdrop-blur-xl dark:border-zinc-800/50">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid h-14 grid-cols-2 gap-1 rounded-2xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-950/50">
              <TabsTrigger
                value="login"
                className="rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all data-[state=active]:bg-neon data-[state=active]:text-neon-foreground"
              >
                Access Portal
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all data-[state=active]:bg-neon data-[state=active]:text-neon-foreground"
              >
                Initialize Account
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <AnimatePresence mode="wait">
                <TabsContent value="login" key="login">
                  <form
                    onSubmit={(e) => handleEmailAuth(e, "login")}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <Label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Secure Email
                      </Label>
                      <Input
                        name="email"
                        type="email"
                        required
                        placeholder="analysis@neural.link"
                        className="focus:ring-neon/20 h-14 rounded-2xl border-zinc-200 bg-zinc-100 px-5 transition-all focus:border-neon dark:border-zinc-800 dark:bg-zinc-950"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Access Token (Password)
                      </Label>
                      <Input
                        name="password"
                        type="password"
                        required
                        placeholder="••••••••"
                        className="focus:ring-neon/20 h-14 rounded-2xl border-zinc-200 bg-zinc-100 px-5 transition-all focus:border-neon dark:border-zinc-800 dark:bg-zinc-950"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="h-14 w-full rounded-2xl bg-neon text-xs font-black uppercase tracking-widest text-neon-foreground shadow-neon transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        "Authorize Link"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" key="signup">
                  <form
                    onSubmit={(e) => handleEmailAuth(e, "signup")}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <Label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Full Identity
                      </Label>
                      <Input
                        name="name"
                        type="text"
                        required
                        placeholder="Agent Name"
                        className="focus:ring-neon/20 h-14 rounded-2xl border-zinc-200 bg-zinc-100 px-5 transition-all focus:border-neon dark:border-zinc-800 dark:bg-zinc-950"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Secure Email
                      </Label>
                      <Input
                        name="email"
                        type="email"
                        required
                        placeholder="analysis@neural.link"
                        className="focus:ring-neon/20 h-14 rounded-2xl border-zinc-200 bg-zinc-100 px-5 transition-all focus:border-neon dark:border-zinc-800 dark:bg-zinc-950"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Set Access Token
                      </Label>
                      <Input
                        name="password"
                        type="password"
                        required
                        placeholder="••••••••"
                        className="focus:ring-neon/20 h-14 rounded-2xl border-zinc-200 bg-zinc-100 px-5 transition-all focus:border-neon dark:border-zinc-800 dark:bg-zinc-950"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="h-14 w-full rounded-2xl bg-neon text-xs font-black uppercase tracking-widest text-neon-foreground shadow-neon transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        "Deploy Identity"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </AnimatePresence>
            </div>
          </Tabs>
        </WidgetCard>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center rounded-2xl border border-zinc-200/50 bg-zinc-100/50 p-4 dark:border-zinc-800/50 dark:bg-zinc-900/30">
            <ShieldCheck className="mb-2 text-neon" size={20} />
            <span className="text-[8px] font-bold uppercase tracking-tighter text-muted-foreground">
              Encrypted Protocol
            </span>
          </div>
          <div className="flex flex-col items-center rounded-2xl border border-zinc-200/50 bg-zinc-100/50 p-4 dark:border-zinc-800/50 dark:bg-zinc-900/30">
            <Bot className="mb-2 text-neon" size={20} />
            <span className="text-[8px] font-bold uppercase tracking-tighter text-muted-foreground">
              AI Integration Ready
            </span>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            Return to Research Terminal <ArrowRight className="ml-2 h-3 w-3" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
