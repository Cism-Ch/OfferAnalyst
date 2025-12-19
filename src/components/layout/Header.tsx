'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { Search, Settings } from 'lucide-react';

/**
 * Header Component
 * 
 * Top navigation bar that includes:
 * - Page title
 * - Search functionality
 * - Theme toggle
 * - Settings access
 * 
 * This component provides consistent navigation and controls
 * across the application interface.
 * 
 * @returns {JSX.Element} The header
 */
export function Header() {
    return (
        <header className="h-16 border-b bg-white dark:bg-zinc-900 flex items-center px-6 justify-between">
            {/* Page Title */}
            <h1 className="text-lg font-semibold">Dashboard</h1>
            
            {/* Right Side Controls */}
            <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search analysis..."
                        className="w-64 pl-9 rounded-full bg-slate-100 dark:bg-zinc-800 border-none"
                    />
                </div>
                
                {/* Theme Toggle */}
                <ThemeToggle />
                
                {/* Settings Button */}
                <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                </Button>
            </div>
        </header>
    );
}
