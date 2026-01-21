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
    Sparkles,
    BarChart3,
    Menu,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
}

const mainNavItems: NavItem[] = [
    { label: 'Dashboard', href: '/', icon: Home },
    { label: 'Projects', href: '/projects', icon: Briefcase },
    { label: 'History', href: '/history', icon: Clock },
    { label: 'Saved Offers', href: '/saved', icon: Bookmark },
];

const secondaryNavItems: NavItem[] = [
    { label: 'Analytics', href: '/analytics', icon: BarChart3, badge: 'Soon' },
    { label: 'Settings', href: '/settings', icon: Settings },
];

interface ModernSidebarProps {
    isCollapsed?: boolean;
    onToggle?: () => void;
}

export function ModernSidebar({ isCollapsed = false, onToggle }: ModernSidebarProps) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (href: string) => {
        return pathname === href;
    };

    const NavItems = ({ items, section }: { items: NavItem[]; section?: string }) => (
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

    const SidebarContent = () => (
        <>
            {/* Logo and Brand */}
            <div className={cn(
                'flex items-center gap-3 px-4 py-5',
                isCollapsed && 'justify-center px-2'
            )}>
                <motion.div
                    className="bg-gradient-gold text-white p-2 rounded-xl shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Sparkles className="h-5 w-5" />
                </motion.div>
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex flex-col"
                    >
                        <span className="font-bold text-lg leading-none">OfferAnalyst</span>
                        <span className="text-xs text-muted-foreground">Premium AI</span>
                    </motion.div>
                )}
            </div>

            <Separator />

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-6 overflow-y-auto">
                <NavItems items={mainNavItems} />
                <Separator className="my-4" />
                <NavItems items={secondaryNavItems} section={!isCollapsed ? 'More' : undefined} />
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

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-background border shadow-sm"
                aria-label="Open menu"
            >
                <Menu className="h-5 w-5" />
            </button>

            {/* Mobile Overlay */}
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
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -300 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="md:hidden fixed left-0 top-0 bottom-0 w-72 bg-background border-r z-50 flex flex-col"
                        >
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-accent"
                                aria-label="Close menu"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <motion.aside
                animate={{ width: isCollapsed ? 80 : 256 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="hidden md:flex flex-col relative border-r bg-background h-screen sticky top-0"
            >
                <SidebarContent />
            </motion.aside>
        </>
    );
}
