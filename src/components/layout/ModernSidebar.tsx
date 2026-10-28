'use client';

/**
 * Modern Premium Sidebar Component
 * 
 * Features:
 * - Collapsible design for more space
 * - Organized navigation with sections
 * - Smooth animations
 * - Better visual hierarchy
 * - Mobile-responsive with overlay
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useLanguage, type TranslationDictionary } from '@/contexts/LanguageContext';
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
    FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { OffanIcon, OffanLogo } from '@/components/brand/OffanBrand';

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

// Helper function to render nav items
function renderNavItems(
    items: NavItem[],
    section: string | undefined,
    isCollapsed: boolean,
    isActive: (href: string) => boolean,
    setMobileOpen: (open: boolean) => void
) {
    return (
        <div className="space-y-1">
            {section && !isCollapsed && (
                <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {section}
                </p>
            )}
            {items.map((item) => (
                <Link key={item.href} href={item.href}>
                    <Button
                        variant="ghost"
                        className={cn(
                            'w-full justify-start gap-3 transition-all duration-200',
                            isCollapsed ? 'px-2' : 'px-3',
                            isActive(item.href)
                                ? 'bg-primary/10 text-primary hover:bg-primary/15'
                                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        )}
                        title={item.label}
                        onClick={() => setMobileOpen(false)}
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
            ))}
        </div>
    );
}

function SidebarUserProfile({ isCollapsed, t }: { isCollapsed: boolean; t: TranslationDictionary }) {
    const { data: session } = useSession();
    const user = session?.user;
    const name = user?.name || (user?.email ? user.email.split('@')[0] : 'Guest User');
    const email = user?.email || (user ? 'Authenticated' : 'Click to Sign In');
    const image = user?.image || undefined;
    const initials = (user?.name || user?.email || 'GU').slice(0, 2).toUpperCase();
    const href = user ? '/dashboard/settings' : '/auth/login';

    return (
        <div className="border-t p-3">
            <Link
                href={href}
                className={cn(
                    'flex items-center gap-3 p-2 rounded-xl hover:bg-accent/60 transition-colors group',
                    isCollapsed && 'justify-center p-1.5'
                )}
                title={user ? `${name} (${email}) • ${t.nav.settings}` : 'Sign in to OfferAnalyst'}
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
        </div>
    );
}

// Helper function to render sidebar content
function renderSidebarContent(
    isCollapsed: boolean,
    onToggle: (() => void) | undefined,
    isActive: (href: string) => boolean,
    setMobileOpen: (open: boolean) => void,
    t: TranslationDictionary
) {
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
                <Link href="/" className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
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
                {renderNavItems(mainNavItems, undefined, isCollapsed, isActive, setMobileOpen)}
                <Separator className="my-4" />
                {renderNavItems(secondaryNavItems, !isCollapsed ? t.nav.sectionMore : undefined, isCollapsed, isActive, setMobileOpen)}
                <Separator className="my-4" />
                {renderNavItems(dashboardNavItems, !isCollapsed ? t.nav.sectionDashboard : undefined, isCollapsed, isActive, setMobileOpen)}
                <Separator className="my-4" />
                {renderNavItems(adminNavItems, !isCollapsed ? t.nav.sectionAdmin : undefined, isCollapsed, isActive, setMobileOpen)}
            </nav>

            {/* User Profile */}
            <SidebarUserProfile isCollapsed={isCollapsed} t={t} />

            {/* Collapse Toggle - Desktop */}
            {onToggle && (
                <button
                    onClick={onToggle}
                    className="hidden md:flex absolute -right-3 top-20 h-6 w-6 items-center justify-center rounded-full border bg-background shadow-md hover:bg-accent transition-colors"
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
    const { t } = useLanguage();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (href: string) => {
        return pathname === href;
    };

    return (
        <>
            {/* Mobile Menu Button - Accessible 44x44px Touch Target */}
            <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden fixed top-3 left-3 z-40 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-background/95 backdrop-blur border shadow-md hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-colors"
                aria-label={t.nav.openMenu}
            >
                <Menu className="h-5 w-5" />
            </button>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
                        />
                        <motion.aside
                            initial={{ x: -256 }}
                            animate={{ x: 0 }}
                            exit={{ x: -256 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="md:hidden fixed left-0 top-0 bottom-0 w-64 bg-background border-r z-50 flex flex-col"
                        >
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-accent"
                                aria-label={t.nav.closeMenu}
                            >
                                <X className="h-5 w-5" />
                            </button>
                            {renderSidebarContent(false, undefined, isActive, setMobileOpen, t)}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <motion.aside
                animate={{ width: isCollapsed ? 80 : 256 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="hidden md:flex flex-col relative border-r bg-background min-h-screen sticky top-0"
            >
                {renderSidebarContent(isCollapsed, onToggle, isActive, setMobileOpen, t)}
            </motion.aside>
        </>
    );
}
