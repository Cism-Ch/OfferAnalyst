"use client";

import * as React from "react"
import { Moon, Sun, Sparkles } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

const emptySubscribe = () => () => {};

export function ThemeToggle() {
    const { setTheme, theme, resolvedTheme } = useTheme();
    const mounted = React.useSyncExternalStore(emptySubscribe, () => true, () => false);

    if (!mounted) {
        return (
            <Button variant="outline" size="icon" aria-label="Toggle theme">
                <Sun className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Toggle theme</span>
            </Button>
        );
    }

    const toggleDarkLight = () => {
        if (resolvedTheme === 'dark' || theme === 'neon') {
            setTheme('light');
        } else {
            setTheme('dark');
        }
    };

    const isDark = resolvedTheme === 'dark' || theme === 'neon';
    const isSpecial = theme === 'gold' || theme === 'ocean' || theme === 'forest' || theme === 'silver';

    return (
        <Button variant="outline" size="icon" onClick={toggleDarkLight} aria-label="Toggle theme">
            {isSpecial ? (
                <Sparkles className="h-[1.2rem] w-[1.2rem] text-primary transition-transform duration-200" />
            ) : isDark ? (
                <Moon className="h-[1.2rem] w-[1.2rem] text-primary transition-transform duration-200" />
            ) : (
                <Sun className="h-[1.2rem] w-[1.2rem] text-primary transition-transform duration-200" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
