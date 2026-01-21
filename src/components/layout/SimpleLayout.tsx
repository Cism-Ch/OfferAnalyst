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
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface SimpleLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    maxWidth?: 'full' | '7xl' | '6xl' | '5xl';
}

const getPageInfo = (pathname: string) => {
    const routes: Record<string, { title: string; description: string; breadcrumbs: string[] }> = {
        '/': {
            title: 'Dashboard',
            description: 'AI-powered offer analysis and insights',
            breadcrumbs: ['Home', 'Dashboard']
        },
        '/projects': {
            title: 'Projects',
            description: 'Manage your analysis projects',
            breadcrumbs: ['Home', 'Projects']
        },
        '/history': {
            title: 'History',
            description: 'View your search history',
            breadcrumbs: ['Home', 'History']
        },
        '/saved': {
            title: 'Saved Offers',
            description: 'Your bookmarked offers',
            breadcrumbs: ['Home', 'Saved Offers']
        },
        '/compare': {
            title: 'Compare',
            description: 'Side-by-side comparison',
            breadcrumbs: ['Home', 'Compare']
        },
    };

    return routes[pathname] || routes['/'];
};

export function SimpleLayout({
    children,
    title,
    description,
    maxWidth = '7xl'
}: SimpleLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const pathname = usePathname();
    const pageInfo = getPageInfo(pathname);

    const maxWidthClasses = {
        'full': 'max-w-full',
        '7xl': 'max-w-7xl',
        '6xl': 'max-w-6xl',
        '5xl': 'max-w-5xl',
    };

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <ModernSidebar
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Simple Header */}
                <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
                    <div className="px-6 py-4">
                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            {pageInfo.breadcrumbs.map((crumb, index) => (
                                <React.Fragment key={crumb}>
                                    {index > 0 && <ChevronRight className="h-4 w-4" />}
                                    <span className={cn(
                                        index === pageInfo.breadcrumbs.length - 1 && 'text-foreground font-medium'
                                    )}>
                                        {crumb}
                                    </span>
                                </React.Fragment>
                            ))}
                        </div>

                        {/* Page Title */}
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {title || pageInfo.title}
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                {description || pageInfo.description}
                            </p>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto">
                    <div className={cn(
                        'mx-auto w-full px-6 py-6',
                        maxWidthClasses[maxWidth]
                    )}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
