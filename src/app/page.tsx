/**
 * OfferAnalyst - Root Landing & Dynamic View Controller
 * 
 * - New visitors / marketing viewers: SaaSPresentationView (High-converting showcase & 1-click live demo)
 * - Returning / active app users: HomeDashboardView (Workflow pipeline & tools)
 * - Anti-Bounce Cookie System: Page refresh (F5) or returning never kicks active users back to vitrine
 */

import { cookies } from 'next/headers';
import { HomeDashboardView } from '@/components/home/HomeDashboardView';
import { SaaSPresentationView } from '@/components/landing/SaaSPresentationView';
import { COOKIE_APP_MODE, APP_MODE_APP, APP_MODE_VITRINE } from '@/lib/cookie-nav';

interface RootPageProps {
    searchParams: Promise<{ view?: string }>;
}

export default async function RootPage(props: RootPageProps) {
    const searchParams = await props.searchParams;
    const cookieStore = await cookies();
    const appModeCookie = cookieStore.get(COOKIE_APP_MODE)?.value;

    // Explicit override via ?view=app or ?view=vitrine
    if (searchParams.view === APP_MODE_VITRINE) {
        return <SaaSPresentationView />;
    }
    if (searchParams.view === APP_MODE_APP) {
        return <HomeDashboardView />;
    }

    // If the user has already entered the app, render the dashboard
    if (appModeCookie === APP_MODE_APP) {
        return <HomeDashboardView />;
    }

    // Default to the SaaS presentation showcase for visitors
    return <SaaSPresentationView />;
}
