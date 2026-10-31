'use client';

/**
 * Modern Premium Sidebar Component
 * 
 * Features:
 * - Collapsible design for more space
 * - Organized navigation with sections
 * - Smooth animations
 * - Bilingual FR/EN Guest User CTA & Authenticated Sign Out button
 * - Mobile-responsive with overlay
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
                <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {section}
                </p>
            )}
            {items.map((item) => {
                const isProtectedItem = PROTECTED_NAV_ROUTES.some(
                    (route) => item.href === route || item.href.startsWith(route + '/')
                );
                const isRestrictedForGuest = isGuest && isProtectedItem;

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
                                'w-full justify-start gap-3 transition-all duration-200',
                                isCollapsed ? 'px-2' : 'px-3',
                                isActive(item.href)
                                    ? 'bg-primary/10 text-primary hover:bg-primary/15'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                            )}
                            title={isRestrictedForGuest ? `${item.label} (${t.auth.signInCta})` : item.label}
                        >
                            <item.icon className={cn('h-5 w-5 flex-shrink-0', isCollapsed && 'mx-auto')} />
                            {!isCollapsed && (
                                <>
                                    <span className="flex-1 text-left">{item.label}</span>
                                    {item.badge && (
                                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
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
        <div className="border-t p-3">
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

                {!isCollapsed && (
                    user ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleQuickSignOut}
                            disabled={signingOut}
                            title={t.auth.signOut}
                            aria-label={t.auth.signOut}
                            className="size-11 md:size-9 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl touch-manipulation"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            title={t.auth.signInCta}
                            aria-label={t.auth.signInCta}
                            className="size-11 md:size-9 shrink-0 text-primary hover:bg-primary/10 rounded-xl touch-manipulation"
                        >
                            <Link href="/auth/login" onClick={() => setMobileOpen?.(false)}>
                                <LogIn className="h-4 w-4" />
                            </Link>
                        </Button>
                    )
                )}
            </div>
        </div>
    );
}

function SidebarDailyQuotaWidget({
    isCollapsed,
    onOpenKeyDialog,
    isFr
}: {
    isCollapsed: boolean;
    onOpenKeyDialog: () => void;
    isFr: boolean;
}) {
    const [quota, setQuota] = useState<{ used: number; total: number; remaining: number; isByok: boolean } | null>(null);

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
            <div className="px-2 py-3 border-t flex justify-center">
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
        <div className="px-3 py-3 border-t">
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-2">
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
                        className="text-[11px] text-primary hover:underline font-medium block pt-1 pb-1 min-h-[32px] text-left touch-manipulation"
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
            {/* Logo and Brand */}
            <div className={cn(
                'flex items-center px-4 py-5',
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

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-6 overflow-y-auto">
                {renderNavItems(mainNavItems, undefined, isCollapsed, isActive, setMobileOpen, isGuest, onProtectedClick, t)}
                <Separator className="my-4" />
                {renderNavItems(secondaryNavItems, !isCollapsed ? t.nav.sectionMore : undefined, isCollapsed, isActive, setMobileOpen, isGuest, onProtectedClick, t)}
                <Separator className="my-4" />
                {renderNavItems(dashboardNavItems, !isCollapsed ? t.nav.sectionDashboard : undefined, isCollapsed, isActive, setMobileOpen, isGuest, onProtectedClick, t)}
                {isAdmin && (
                    <>
                        <Separator className="my-4" />
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
                    className="hidden lg:flex absolute -right-3 top-20 h-6 w-6 items-center justify-center rounded-full border bg-background shadow-md hover:bg-accent transition-colors"
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
                        className="md:hidden fixed top-2 left-2.5 z-sidebar size-10 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-background/80 hover:bg-accent/80 active:scale-95 border border-border/70 shadow-sm backdrop-blur-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-all duration-150 touch-manipulation text-foreground/85 hover:text-foreground"
                        aria-label={t.nav.openMenu}
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                </SheetTrigger>
                <SheetContent
                    side="left"
                    className="p-0 flex flex-col w-72 max-w-[85vw] h-full overflow-hidden pl-safe pb-safe"
                    showCloseButton={false}
                >
                    <SheetHeader className="sr-only">
                        <SheetTitle>{t.nav.openMenu}</SheetTitle>
                        <SheetDescription>Menu de navigation principal</SheetDescription>
                    </SheetHeader>
                    {/* Accessible Close Button with explicit aria-label for E2E tests */}
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="absolute top-3.5 right-3.5 z-drawer size-10 min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-full border border-border/50 bg-background/70 hover:bg-accent active:scale-95 transition-all touch-manipulation text-muted-foreground hover:text-foreground"
                        aria-label={t.nav.closeMenu}
                    >
                        <X className="h-4 w-4" />
                    </button>
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
