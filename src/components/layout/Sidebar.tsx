'use client';

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from 'next/link';
import {
    Briefcase,
    Home,
    TrendingUp,
    User,
    Wallet,
    Clock
} from 'lucide-react';

/**
 * Sidebar Component
 * 
 * Navigation sidebar for the application that provides quick access to
 * different sections. Includes user profile information
 * and application branding.
 * 
 * Features:
 * - Navigation menu with icons
 * - Active state highlighting
 * - User profile display
 * - Responsive design (hidden on mobile)
 * 
 * @returns {JSX.Element} The sidebar
 */
export function Sidebar() {
    return (
        <aside className="w-64 border-r bg-white dark:bg-zinc-900 hidden md:flex flex-col">
            {/* Logo and Brand */}
            <div className="p-6 flex items-center gap-2 font-bold text-xl text-primary">
                <div className="bg-primary text-primary-foreground p-1 rounded-md">
                    <TrendingUp size={20} />
                </div>
                OfferAnalyst
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-4 py-4 space-y-2">
                <Link href="/">
                    <Button variant="ghost" className="w-full justify-start gap-2 bg-slate-100 dark:bg-zinc-800 text-primary">
                        <Home size={18} /> Dashboard
                    </Button>
                </Link>
                <Link href="/projects">
                    <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-primary">
                        <Briefcase size={18} /> Projects
                    </Button>
                </Link>
                <Link href="/history">
                    <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-primary">
                        <Clock size={18} /> History
                    </Button>
                </Link>
                <Link href="/saved">
                    <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-primary">
                        <Wallet size={18} /> Saved Offers
                    </Button>
                </Link>
                <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-primary">
                    <User size={18} /> Profile
                </Button>
            </nav>

            {/* User Profile Section */}
            <div className="p-4 border-t">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                        <p className="font-medium">User Profile</p>
                        <p className="text-xs text-muted-foreground">Pro Plan</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
