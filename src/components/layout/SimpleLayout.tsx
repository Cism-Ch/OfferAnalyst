'use client';

/**
 * Simple Layout Wrapper for non-dashboard pages
 * 
 * Features:
 * - Uses ModernSidebar and simplified header
 * - No model selector needed
 * - Breadcrumb navigation
 */

import React, { useState } from 'react';
import { ModernSidebar } from './ModernSidebar';
import { PremiumThemeSelector } from '@/components/theme-selector';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { AIModelSelector } from './AIModelSelector';

interface SimpleLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    maxWidth?: 'full' | '7xl' | '6xl' | '5xl';
}

export function SimpleLayout({
    children,
    title,
    description,
    maxWidth = '7xl'
}: SimpleLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Auto-collapse sidebar on tablet (768px - 1023px) to icon rail mode
    React.useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768 && window.innerWidth < 1024) {
                setSidebarCollapsed(true);
            } else if (window.innerWidth >= 1024) {
                setSidebarCollapsed(false);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const pathname = usePathname();
    const { t } = useLanguage();
    const routeInfo = (t.routes as Record<string, { title: string; description: string; breadcrumbs: string[] }>)[pathname] || t.routes['/'];
    const pageTitle = title || routeInfo.title;
    const pageDescription = description || routeInfo.description;

    const maxWidthClasses = {
        'full': 'max-w-full',
        '7xl': 'max-w-7xl',
        '6xl': 'max-w-6xl',
        '5xl': 'max-w-5xl',
    };

    return (
        <div className="flex min-h-app bg-background">
            {/* Sidebar */}
            <ModernSidebar
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Simple Header */}
                <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
                    <div className="px-4 sm:px-6 py-3 sm:py-4 pl-16 md:pl-6">
                        {/* Top Row: Breadcrumbs & Actions (Language Switcher, Model Switcher & Theme Selector) */}
                        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
                            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground min-w-0">
                                {/* Mobile Single Crumb */}
                                <span className="sm:hidden text-xs text-foreground font-semibold truncate max-w-[160px]">
                                    {routeInfo.breadcrumbs[routeInfo.breadcrumbs.length - 1]}
                                </span>
                                {/* Desktop Full Trail */}
                                <div className="hidden sm:flex items-center gap-2">
                                    {routeInfo.breadcrumbs.map((crumb, index) => (
                                        <React.Fragment key={crumb}>
                                            {index > 0 && <ChevronRight className="h-4 w-4 shrink-0 opacity-60" />}
                                            <span className={cn(
                                                index === routeInfo.breadcrumbs.length - 1 && 'text-foreground font-medium'
                                            )}>
                                                {crumb}
                                            </span>
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                                <LanguageToggle />
                                <AIModelSelector compact />
                                <PremiumThemeSelector />
                            </div>
                        </div>

                        {/* Page Title */}
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                                {pageTitle}
                            </h1>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                                {pageDescription}
                            </p>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto">
                    <div className={cn(
                        'mx-auto w-full px-[var(--spacing-page)] py-[var(--spacing-section)]',
                        maxWidthClasses[maxWidth]
                    )}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
