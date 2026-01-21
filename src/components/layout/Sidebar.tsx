"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Layers,
  History as HistoryIcon,
  Bookmark,
  User,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Projects", icon: Layers, href: "/projects" },
  { label: "History", icon: HistoryIcon, href: "/history" },
  { label: "Saved Offers", icon: Bookmark, href: "/saved" },
];

/**
 * Premium Sidebar Component.
 * Features glassmorphism, neon active states, and fluid animations.
 */
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r bg-background md:flex">
      {/* Logo and Brand */}
      <div className="flex items-center gap-3 p-8">
        <div className="flex size-10 items-center justify-center rounded-lg bg-neon shadow-neon">
          <Sparkles className="text-neon-foreground" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold">OfferAnalyst</h2>
          <p className="text-[10px] font-semibold uppercase leading-none tracking-wide text-muted-foreground">
            Intelligence Engine
          </p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "group relative h-12 w-full justify-start gap-3 overflow-hidden transition-all",
                  isActive
                    ? "bg-neon/10 text-neon dark:bg-neon/5"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon
                  size={18}
                  className={cn(
                    "transition-colors",
                    isActive ? "text-neon" : "group-hover:text-foreground",
                  )}
                />
                <span className="text-sm font-semibold">
                  {item.label}
                </span>

                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 h-6 w-1 rounded-r-full bg-neon"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section - Settings and Profile */}
      <div className="space-y-4 p-4">
        <Button
          variant="ghost"
          className="h-12 w-full justify-start gap-4 rounded-2xl text-muted-foreground hover:text-foreground"
        >
          <Settings size={20} />
          <span className="text-sm font-semibold">Settings</span>
        </Button>
        <Link href="/profile">
          <Button
            variant="ghost"
            className="h-12 w-full justify-start gap-4 rounded-2xl text-muted-foreground hover:text-foreground"
          >
            <User size={20} />
            <span className="text-sm font-semibold">Profile</span>
          </Button>
        </Link>

        {isPending ? (
          <div className="animate-pulse rounded-2xl border border-zinc-200/50 bg-zinc-100/50 p-4 dark:border-zinc-800/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-2 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            </div>
          </div>
        ) : session ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-zinc-200 bg-zinc-100 p-4 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="border-neon/20 h-10 w-10 border-2">
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
                <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-zinc-100 bg-neon dark:border-zinc-900">
                  <div className="h-1.5 w-1.5 rounded-full bg-neon-foreground" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">
                  {session.user.name}
                </p>
                <p className="truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {session.user.email}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleLogout}
                className="h-8 w-8 rounded-lg text-muted-foreground transition-colors hover:bg-zinc-200 hover:text-destructive dark:hover:bg-zinc-800"
              >
                <LogOut size={16} />
              </Button>
            </div>
          </motion.div>
        ) : (
          <Link href="/auth/login" className="block">
            <Button className="h-12 w-full rounded-xl bg-neon text-[10px] font-bold uppercase tracking-widest text-neon-foreground shadow-neon">
              Authenticate Identity
            </Button>
          </Link>
        )}
      </div>
    </aside>
  );
}
