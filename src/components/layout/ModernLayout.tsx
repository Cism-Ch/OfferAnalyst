'use client';

/**
 * Modern Premium Layout Wrapper
 * 
 * Features:
 * - Collapsible sidebar
 * - Modern header with breadcrumbs
 * - Content container with max-width
 * - Better spacing and responsive design
 * - Smooth animations
 */

import React, { useState } from 'react';
import { ModernSidebar } from './ModernSidebar';
import { ModernHeader } from './ModernHeader';
import { cn } from '@/lib/utils';

interface ModernLayoutProps {
    children: React.ReactNode;
    selectedModel?: string;
    onModelChange?: (modelId: string) => void;
    title?: string;
    description?: string;
    maxWidth?: 'full' | '7xl' | '6xl' | '5xl';
}

export function ModernLayout({
    children,
    selectedModel,
    onModelChange,
    title,
    description,
    maxWidth = '7xl'
}: ModernLayoutProps) {
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
                {/* Header */}
                <ModernHeader
                    selectedModel={selectedModel}
                    onModelChange={onModelChange}
                    title={title}
                    description={description}
                />

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
