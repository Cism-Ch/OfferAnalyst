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

const mainNavItems: NavItem[] = [
    { label: 'Dashboard', href: '/', icon: Home },
    { label: 'Search Context', href: '/search-context', icon: Search },
    { label: 'Data Source', href: '/data-source', icon: Database },
    { label: 'Analysis', href: '/analysis', icon: LineChart },
];

const secondaryNavItems: NavItem[] = [
    { label: 'Projects', href: '/projects', icon: Briefcase },
    { label: 'History', href: '/history', icon: Clock },
    { label: 'Saved Offers', href: '/saved', icon: Bookmark },
];

const dashboardNavItems: NavItem[] = [
    { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { label: 'API Keys', href: '/dashboard/api-keys', icon: Key },
    { label: 'Workspace', href: '/dashboard/workspace', icon: Users },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
    { label: 'Support', href: '/dashboard/support', icon: Coffee },
    { label: 'Help Center', href: '/help', icon: HelpCircle },
    { label: 'Changelog', href: '/changelog', icon: FileText },
];

const adminNavItems: NavItem[] = [
    { label: 'Admin Console', href: '/admin', icon: Shield, badge: 'Admin' },
];

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

// Helper function to render sidebar content
function renderSidebarContent(
    isCollapsed: boolean,
    onToggle: (() => void) | undefined,
    isActive: (href: string) => boolean,
    setMobileOpen: (open: boolean) => void
) {
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
                {renderNavItems(secondaryNavItems, !isCollapsed ? 'More' : undefined, isCollapsed, isActive, setMobileOpen)}
                <Separator className="my-4" />
                {renderNavItems(dashboardNavItems, !isCollapsed ? 'Dashboard' : undefined, isCollapsed, isActive, setMobileOpen)}
                <Separator className="my-4" />
                {renderNavItems(adminNavItems, !isCollapsed ? 'Admin' : undefined, isCollapsed, isActive, setMobileOpen)}
            </nav>

            {/* User Profile */}
            <div className="border-t p-4">
                <div className={cn(
                    'flex items-center gap-3',
                    isCollapsed && 'justify-center'
                )}>
                    <Avatar className={cn(isCollapsed && 'h-8 w-8')}>
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex-1 min-w-0"
                        >
                            <p className="text-sm font-medium truncate">User Profile</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                                Pro Plan
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Collapse Toggle - Desktop */}
            {onToggle && (
                <button
                    onClick={onToggle}
                    className="hidden md:flex absolute -right-3 top-20 h-6 w-6 items-center justify-center rounded-full border bg-background shadow-md hover:bg-accent transition-colors"
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
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
                aria-label="Open menu"
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
                                aria-label="Close menu"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            {renderSidebarContent(false, undefined, isActive, setMobileOpen)}
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
                {renderSidebarContent(isCollapsed, onToggle, isActive, setMobileOpen)}
            </motion.aside>
        </>
    );
}
