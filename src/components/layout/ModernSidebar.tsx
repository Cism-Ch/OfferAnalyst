'use client';

/**
 * Modern Premium Sidebar & Drawer Component
 * 
 * Features:
 * - Luxury SaaS aesthetic with Linear/Vercel active state indicators
 * - Touch-manipulation and WCAG 44x44px minimum touch targets
 * - Dedicated mobile Drawer header with horizontally aligned brand logo, version badge, and close cross
 * - Vertically centered micro-glassmorphic mobile drawer trigger button
 * - Clean section hierarchy and compact footer widgets
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';
import { useLanguage, type TranslationDictionary } from '@/contexts/LanguageContext';
import { Progress } from "@/components/ui/progress";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetTrigger
} from "@/components/ui/sheet";
import {
    Home,
    Briefcase,
    Clock,
    Bookmark,
    Settings,
    ChevronLeft,
    ChevronRight,
    BarChart3,
    Menu,
    X,
    Search,
    Database,
    LineChart,
    Key,
    Users,
    Coffee,
    Shield,
    HelpCircle,
    FileText,
    LogOut,
    LogIn,
    Zap,
    Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { OffanIcon, OffanLogo } from '@/components/brand/OffanBrand';
import { FluidAuthModal } from '@/components/auth/FluidAuthModal';
import { GuestApiKeyDialog } from '@/components/api-keys/GuestApiKeyDialog';
import { getDailyQuotaAction } from '@/app/actions/shared/quota-limiter';

const PROTECTED_NAV_ROUTES = [
    '/saved',
    '/projects',
    '/compare',
    '/dashboard/analytics',
    '/dashboard/api-keys',
    '/dashboard/workspace',
    '/dashboard/settings',
    '/dashboard/support',
    '/admin',
];

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
}

interface ModernSidebarProps {
    isCollapsed?: boolean;
    onToggle?: () => void;
}

function renderNavItems(
    items: NavItem[],
    section: string | undefined,
    isCollapsed: boolean,
    isActive: (href: string) => boolean,
    setMobileOpen: (open: boolean) => void,
    isGuest: boolean,
    onProtectedClick: (href: string) => void,
    t: TranslationDictionary
) {
    return (
        <div className="space-y-1">
            {section && !isCollapsed && (
                <p className="px-3 pt-2 text-[11px] font-bold text-muted-foreground/80 uppercase tracking-widest mb-1.5 select-none">
                    {section}
                </p>
            )}
            {items.map((item) => {
                const isProtectedItem = PROTECTED_NAV_ROUTES.some(
                    (route) => item.href === route || item.href.startsWith(route + '/')
                );
                const isRestrictedForGuest = isGuest && isProtectedItem;
                const active = isActive(item.href);

                const handleClick = (e: React.MouseEvent) => {
                    if (isRestrictedForGuest) {
                        e.preventDefault();
                        onProtectedClick(item.href);
                    } else {
                        setMobileOpen(false);
                    }
                };

                return (
                    <Link
                        key={item.href}
                        href={isRestrictedForGuest ? '#' : item.href}
                        onClick={handleClick}
                    >
                        <Button
                            variant="ghost"
                            className={cn(
                                'w-full justify-start gap-3 min-h-[44px] transition-all duration-200 rounded-xl relative touch-manipulation',
                                isCollapsed ? 'px-2' : 'px-3',
                                active
                                    ? 'bg-primary/10 text-primary font-semibold hover:bg-primary/15 shadow-2xs before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-full before:bg-primary'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                            )}
                            title={isRestrictedForGuest ? `${item.label} (${t.auth.signInCta})` : item.label}
                        >
                            <item.icon className={cn(
                                'h-5 w-5 shrink-0 transition-colors',
                                isCollapsed && 'mx-auto',
                                active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                            )} />
                            {!isCollapsed && (
                                <>
                                    <span className="flex-1 text-left truncate">{item.label}</span>
                                    {item.badge && (
                                        <span className="text-[10px] font-mono font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full shrink-0">
                                            {item.badge}
                                        </span>
                                    )}
                                </>
                            )}
                        </Button>
                    </Link>
                );
            })}
        </div>
    );
}

function SidebarUserProfile({
    isCollapsed,
    t,
    setMobileOpen
}: {
    isCollapsed: boolean;
    t: TranslationDictionary;
    setMobileOpen?: (open: boolean) => void;
}) {
    const router = useRouter();
    const { data: session } = useSession();
    const [signingOut, setSigningOut] = useState(false);
    const user = session?.user;
    const name = user?.name || (user?.email ? user.email.split('@')[0] : t.auth.guestUser);
    const email = user?.email || (user ? t.nav.activeSession : t.auth.clickToSignIn);
    const image = user?.image || undefined;
    const initials = (user?.name || user?.email || 'GU').slice(0, 2).toUpperCase();
    const href = user ? '/dashboard/settings' : '/auth/login';

    const handleQuickSignOut = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (signingOut) return;
        setMobileOpen?.(false);
        setSigningOut(true);
        try {
            await signOut();
            router.push('/');
            router.refresh();
        } finally {
            setSigningOut(false);
        }
    };

    return (
        <div className="border-t border-border/70 p-3">
            <div className={cn('flex items-center gap-1.5', isCollapsed && 'justify-center')}>
                <Link
                    href={href}
                    onClick={() => setMobileOpen?.(false)}
                    className={cn(
                        'flex items-center gap-3 p-2 min-h-[44px] rounded-xl hover:bg-accent/60 transition-colors group flex-1 min-w-0 touch-manipulation',
                        isCollapsed && 'justify-center p-1.5 flex-initial'
                    )}
                    title={user ? `${name} (${email}) • ${t.nav.settings}` : t.auth.signInCta}
                >
                    <Avatar className={cn(isCollapsed ? 'h-8 w-8' : 'h-9 w-9', 'border border-border/70 shrink-0')}>
                        {image && <AvatarImage src={image} alt={name} />}
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex-1 min-w-0"
                        >
                            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                {name}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                                <span className={cn(
                                    'inline-block w-2 h-2 rounded-full shrink-0',
                                    user ? 'bg-emerald-500' : 'bg-muted-foreground/40'
                                )}></span>
                                <span className="truncate">{user ? t.nav.activeSession : t.nav.guestSession}</span>
                            </p>
                        </motion.div>
                    )}
                </Link>

                {!isCollapsed && user && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleQuickSignOut}
                        disabled={signingOut}
                        className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors touch-manipulation"
                        title={t.nav.signOut}
                        aria-label={t.nav.signOut}
                    >
                        <LogOut className={cn('h-4 w-4', signingOut && 'animate-spin')} />
                    </Button>
                )}

                {!isCollapsed && !user && (
                    <Link
                        href="/auth/login"
                        onClick={() => setMobileOpen?.(false)}
                        className="shrink-0"
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-colors touch-manipulation"
                            title={t.nav.signIn}
                            aria-label={t.nav.signIn}
                        >
                            <LogIn className="h-4 w-4" />
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
}

function SidebarDailyQuotaWidget({
    isCollapsed,
    onOpenKeyDialog,
    isFr,
}: {
    isCollapsed: boolean;
    onOpenKeyDialog: () => void;
    isFr: boolean;
}) {
    const [quota, setQuota] = React.useState<{ remaining: number; total: number; isByok: boolean } | null>(null);

    const loadQuota = React.useCallback(async () => {
        try {
            const res = await getDailyQuotaAction();
            if (res.success && res.data) {
                setQuota(res.data);
            }
        } catch {
            // Ignore in background
        }
    }, []);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            loadQuota();
        }, 0);
        return () => clearTimeout(timer);
    }, [loadQuota]);

    if (!quota) return null;

    if (isCollapsed) {
        return (
            <div className="px-2 py-3 border-t border-border/70 flex justify-center">
                <button
                    onClick={onOpenKeyDialog}
                    className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
                    title={quota.isByok ? (isFr ? "BYOK Actif (Recherches illimitées)" : "BYOK Active (Unlimited searches)") : `Quota: ${quota.remaining}/${quota.total} ${isFr ? 'recherches' : 'searches'}`}
                >
                    <Zap className={cn("h-4 w-4", quota.isByok ? "text-emerald-500 fill-emerald-500/20" : "text-amber-500 fill-amber-500/20")} />
                </button>
            </div>
        );
    }

    const pct = quota.isByok ? 100 : Math.round((quota.remaining / quota.total) * 100);

    return (
        <div className="px-3 py-2.5 border-t border-border/70">
            <div className="p-3 rounded-2xl bg-muted/40 border border-border/70 space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <Zap className={cn("h-3.5 w-3.5", quota.isByok ? "text-emerald-500 fill-emerald-500/20" : "text-amber-500 fill-amber-500/20")} />
                        <span>{quota.isByok ? (isFr ? "BYOK Illimité" : "BYOK Unlimited") : (isFr ? "Quota Quotidien" : "Daily Quota")}</span>
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground">
                        {quota.isByok ? (isFr ? "Actif" : "Active") : `${quota.remaining}/${quota.total}`}
                    </span>
                </div>

                <Progress
                    value={pct}
                    className={cn(
                        "h-1.5",
                        quota.isByok && "[&>[data-slot=progress-indicator]]:bg-emerald-500",
                        !quota.isByok && quota.remaining <= 2 && "[&>[data-slot=progress-indicator]]:bg-destructive"
                    )}
                />

                {!quota.isByok && (
                    <button
                        onClick={onOpenKeyDialog}
                        className="text-[11px] text-primary hover:underline font-semibold block pt-0.5 min-h-[36px] text-left touch-manipulation active:scale-95 transition-transform"
                    >
                        {isFr ? "+ Ajouter clé API (BYOK)" : "+ Add API Key (BYOK)"}
                    </button>
                )}
            </div>
        </div>
    );
}

function SidebarBody({
    isCollapsed,
    onToggle,
    isActive,
    setMobileOpen,
    t,
    isGuest,
    onProtectedClick,
    onOpenKeyDialog,
    isFr,
    isDrawer = false,
}: {
    isCollapsed: boolean;
    onToggle: (() => void) | undefined;
    isActive: (href: string) => boolean;
    setMobileOpen: (open: boolean) => void;
    t: TranslationDictionary;
    isGuest: boolean;
    onProtectedClick: (href: string) => void;
    onOpenKeyDialog: () => void;
    isFr: boolean;
    isDrawer?: boolean;
}) {
    const { data: session } = useSession();
    const isAdmin = (session?.user as { role?: string } | undefined)?.role === 'ADMIN';

    const mainNavItems: NavItem[] = [
        { label: t.nav.dashboard, href: '/', icon: Home },
        { label: t.nav.searchContext, href: '/search-context', icon: Search },
        { label: t.nav.dataSource, href: '/data-source', icon: Database },
        { label: t.nav.analysis, href: '/analysis', icon: LineChart },
    ];

    const secondaryNavItems: NavItem[] = [
        { label: t.nav.projects, href: '/projects', icon: Briefcase },
        { label: t.nav.history, href: '/history', icon: Clock },
        { label: t.nav.saved, href: '/saved', icon: Bookmark },
    ];

    const dashboardNavItems: NavItem[] = [
        { label: t.nav.dashboard, href: '/dashboard/analytics', icon: BarChart3 },
        { label: t.nav.apiKeys, href: '/dashboard/api-keys', icon: Key },
        { label: t.nav.workspace, href: '/dashboard/workspace', icon: Users },
        { label: t.nav.settings, href: '/dashboard/settings', icon: Settings },
        { label: t.nav.saasShowcase, href: '/landing', icon: Sparkles },
        { label: t.nav.support, href: '/dashboard/support', icon: Coffee },
        { label: t.nav.help, href: '/help', icon: HelpCircle },
        { label: t.nav.changelog, href: '/changelog', icon: FileText },
    ];

    const adminNavItems: NavItem[] = [
        { label: t.nav.adminConsole, href: '/admin', icon: Shield, badge: 'Admin' },
    ];

    return (
        <>
            {/* Header: in Drawer mode, unified horizontal row with logo, version badge, and close button */}
            {isDrawer ? (
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/70 bg-muted/20 shrink-0">
                    <Link
                        href="/"
                        onClick={() => setMobileOpen?.(false)}
                        className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
                    >
                        <OffanLogo variant="full" size="sm" glow />
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">
                            v1.2.1
                        </span>
                        <button
                            onClick={() => setMobileOpen?.(false)}
                            className="size-9 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full border border-border/70 bg-background/80 hover:bg-accent active:scale-95 transition-all text-muted-foreground hover:text-foreground touch-manipulation"
                            aria-label={t.nav.closeMenu}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Desktop / Tablet Logo and Brand */}
                    <div className={cn(
                        'flex items-center px-4 py-5 shrink-0',
                        isCollapsed ? 'justify-center px-2' : 'justify-start'
                    )}>
                        <Link
                            href="/"
                            onClick={() => setMobileOpen?.(false)}
                            className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
                        >
                            {isCollapsed ? (
                                <div className="p-1.5 rounded-xl bg-card border border-border shadow-xs hover:border-primary/50 hover:scale-105 transition-all">
                                    <OffanIcon size={24} glow />
                                </div>
                            ) : (
                                <OffanLogo variant="full" size="md" glow />
                            )}
                        </Link>
                    </div>
                    <Separator />
                </>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-2.5 py-3 space-y-4 overflow-y-auto">
                {renderNavItems(mainNavItems, undefined, isCollapsed, isActive, setMobileOpen, isGuest, onProtectedClick, t)}
                <Separator className="my-2 opacity-60" />
                {renderNavItems(secondaryNavItems, !isCollapsed ? t.nav.sectionMore : undefined, isCollapsed, isActive, setMobileOpen, isGuest, onProtectedClick, t)}
                <Separator className="my-2 opacity-60" />
                {renderNavItems(dashboardNavItems, !isCollapsed ? t.nav.sectionDashboard : undefined, isCollapsed, isActive, setMobileOpen, isGuest, onProtectedClick, t)}
                {isAdmin && (
                    <>
                        <Separator className="my-2 opacity-60" />
                        {renderNavItems(adminNavItems, !isCollapsed ? t.nav.sectionAdmin : undefined, isCollapsed, isActive, setMobileOpen, isGuest, onProtectedClick, t)}
                    </>
                )}
            </nav>

            {/* Daily Quota Widget */}
            <SidebarDailyQuotaWidget
                isCollapsed={isCollapsed}
                onOpenKeyDialog={onOpenKeyDialog}
                isFr={isFr}
            />

            {/* User Profile */}
            <SidebarUserProfile isCollapsed={isCollapsed} t={t} setMobileOpen={setMobileOpen} />

            {/* Collapse Toggle - Desktop */}
            {onToggle && (
                <button
                    onClick={onToggle}
                    className="hidden lg:flex absolute -right-3 top-20 h-6 w-6 items-center justify-center rounded-full border border-border/80 bg-background shadow-md hover:bg-accent transition-colors"
                    aria-label={isCollapsed ? t.nav.expandSidebar : t.nav.collapseSidebar}
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-3 w-3" />
                    ) : (
                        <ChevronLeft className="h-3 w-3" />
                    )}
                </button>
            )}
        </>
    );
}

export function ModernSidebar({ isCollapsed = false, onToggle }: ModernSidebarProps) {
    const pathname = usePathname();
    const { t, language } = useLanguage();
    const isFr = language === 'fr';
    const { data: session } = useSession();
    const isGuest = !session?.user;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [guestKeyDialogOpen, setGuestKeyDialogOpen] = useState(false);
    const [targetProtectedPath, setTargetProtectedPath] = useState<string>('/saved');

    // Auto-close mobile drawer on route change
    const [prevPathname, setPrevPathname] = useState(pathname);
    if (prevPathname !== pathname) {
        setPrevPathname(pathname);
        setMobileOpen(false);
    }

    const handleProtectedClick = (href: string) => {
        setTargetProtectedPath(href);
        setAuthModalOpen(true);
        setMobileOpen(false);
    };

    const isActive = (href: string) => {
        return pathname === href;
    };

    return (
        <>
            {/* Mobile Sidebar via Accessible Radix Sheet (Focus trapping, Esc key, backdrop-blur) */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                    <button
                        className="md:hidden fixed top-1.5 left-2 sm:top-2 sm:left-2.5 z-sidebar size-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-background/90 hover:bg-accent/80 active:scale-95 border border-border/80 shadow-xs hover:shadow-md hover:border-primary/40 backdrop-blur-xl focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-all duration-150 touch-manipulation text-foreground/90 hover:text-foreground"
                        aria-label={t.nav.openMenu}
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                </SheetTrigger>
                <SheetContent
                    side="left"
                    className="p-0 flex flex-col w-72 sm:w-80 max-w-[85vw] h-full overflow-hidden pl-safe pb-safe bg-background/95 backdrop-blur-2xl border-r border-border/80 shadow-2xl"
                    showCloseButton={false}
                >
                    <SheetHeader className="sr-only">
                        <SheetTitle>{t.nav.openMenu}</SheetTitle>
                        <SheetDescription>Menu de navigation principal</SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                        <SidebarBody
                            isCollapsed={false}
                            onToggle={undefined}
                            isActive={isActive}
                            setMobileOpen={setMobileOpen}
                            t={t}
                            isGuest={isGuest}
                            onProtectedClick={handleProtectedClick}
                            onOpenKeyDialog={() => {
                                setMobileOpen(false);
                                setTimeout(() => setGuestKeyDialogOpen(true), 120);
                            }}
                            isFr={isFr}
                            isDrawer={true}
                        />
                    </div>
                </SheetContent>
            </Sheet>

            {/* Desktop / Tablet Sidebar with dynamic icon rail */}
            <motion.aside
                initial={false}
                animate={{ width: isCollapsed ? 80 : 256 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className={cn(
                    "hidden md:flex flex-col relative border-r bg-background h-app sticky top-0 shrink-0 z-sidebar",
                    isCollapsed ? "w-20" : "w-64"
                )}
            >
                <SidebarBody
                    isCollapsed={isCollapsed}
                    onToggle={onToggle}
                    isActive={isActive}
                    setMobileOpen={setMobileOpen}
                    t={t}
                    isGuest={isGuest}
                    onProtectedClick={handleProtectedClick}
                    onOpenKeyDialog={() => setGuestKeyDialogOpen(true)}
                    isFr={isFr}
                    isDrawer={false}
                />
            </motion.aside>

            {/* Fluid Authentication Modal for Guests */}
            <FluidAuthModal
                open={authModalOpen}
                onOpenChange={setAuthModalOpen}
                targetPath={targetProtectedPath}
            />

            {/* Guest API Key Dialog */}
            <GuestApiKeyDialog
                open={guestKeyDialogOpen}
                onOpenChange={setGuestKeyDialogOpen}
            />
        </>
    );
}
