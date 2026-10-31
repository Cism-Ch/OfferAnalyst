'use client';

/**
 * AppShell — Shell Applicatif Unifié & Navigation Responsive
 * 
 * Features:
 * - Central architecture shell federating ModernSidebar, ModernHeader (AppHeader), and fluid <main>
 * - Responsive tablet icon rail mode (auto-collapse to 80px on 768px-1023px, full 256px on 1024px+)
 * - Full backward compatibility wrapper for ModernLayout and SimpleLayout
 * - Zero horizontal overflow at 320px
 * - Dynamic spacing via CSS tokens --spacing-page and --spacing-section
 */

import React, { useState, useEffect } from 'react';
import { ModernSidebar } from './ModernSidebar';
import { ModernHeader } from './ModernHeader';
import { cn } from '@/lib/utils';

export interface AppShellProps {
    children: React.ReactNode;
    selectedModel?: string;
    onModelChange?: (modelId: string) => void;
    title?: string;
    description?: string;
    maxWidth?: 'full' | '7xl' | '6xl' | '5xl';
    showModelSelector?: boolean;
    className?: string;
}

const maxWidthClasses = {
    'full': 'max-w-full',
    '7xl': 'max-w-7xl',
    '6xl': 'max-w-6xl',
    '5xl': 'max-w-5xl',
};

export function AppShell({
    children,
    selectedModel,
    onModelChange,
    title,
    description,
    maxWidth = '7xl',
    showModelSelector = true,
    className
}: AppShellProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Auto-collapse sidebar on tablet (768px - 1023px) to icon rail mode
    useEffect(() => {
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

    return (
        <div className="flex min-h-app bg-background">
            {/* Sidebar */}
            <ModernSidebar
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <ModernHeader
                    selectedModel={selectedModel}
                    onModelChange={onModelChange}
                    title={title}
                    description={description}
                    showModelSelector={showModelSelector}
                />

                {/* Page Content */}
                <main className="flex-1 overflow-auto">
                    <div className={cn(
                        'mx-auto w-full px-[var(--spacing-page)] py-[var(--spacing-section)]',
                        maxWidthClasses[maxWidth],
                        className
                    )}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
