/**
 * Cookie Navigation Helper
 * 
 * Manages the user's view mode preference:
 * - 'vitrine' : First-time visitors and marketing showcase viewers
 * - 'app'     : Active users using the OfferAnalyst workflow
 * 
 * Ensures refreshing (F5) or returning to the app NEVER bounces the user back to the vitrine,
 * while allowing seamless bidirectional navigation between the showcase and the app.
 */

export const COOKIE_APP_MODE = 'offeranalyst_app_mode';
export const APP_MODE_APP = 'app';
export const APP_MODE_VITRINE = 'vitrine';

export type AppViewMode = 'app' | 'vitrine';

/**
 * Read the current view mode from document.cookie (client-side)
 */
export function getAppModeCookie(): AppViewMode | null {
    if (typeof document === 'undefined') return null;

    const name = `${COOKIE_APP_MODE}=`;
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');

    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            const val = c.substring(name.length, c.length).trim();
            if (val === APP_MODE_APP || val === APP_MODE_VITRINE) {
                return val as AppViewMode;
            }
        }
    }
    return null;
}

/**
 * Persist the view mode to document.cookie with 30-day lifetime
 */
export function setAppModeCookie(mode: AppViewMode, days: number = 30): void {
    if (typeof document === 'undefined') return;

    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${d.toUTCString()}`;
    const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${COOKIE_APP_MODE}=${mode}; ${expires}; path=/; SameSite=Lax${secure}`;
}

/**
 * Clear the cookie
 */
export function clearAppModeCookie(): void {
    if (typeof document === 'undefined') return;
    document.cookie = `${COOKIE_APP_MODE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

