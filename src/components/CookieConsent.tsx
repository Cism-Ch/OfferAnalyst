'use client';

/**
 * Cookie Consent Banner
 * 
 * GDPR and CCPA compliant cookie consent banner
 */

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PremiumCard } from '@/components/ui/premium-card';

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

const defaultPreferences: CookiePreferences = {
  necessary: true, // Always true
  functional: true,
  analytics: false,
  marketing: false,
};

export function CookieConsent() {
  const [isVisible, setIsVisible] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [preferences, setPreferences] = React.useState<CookiePreferences>(defaultPreferences);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      // Check if user has already consented
      const consent = localStorage.getItem('cookie-consent');
      if (!consent) {
        setIsVisible(true);
      } else {
        try {
          const saved = JSON.parse(consent);
          setPreferences(saved);
        } catch {
          // Invalid JSON, show banner
          setIsVisible(true);
        }
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify(prefs));
    setPreferences(prefs);
    setIsVisible(false);
    setShowSettings(false);

    // Trigger consent event for analytics
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).gtag) {
      const gtag = (window as unknown as Record<string, unknown>).gtag as (
        command: string,
        action: string,
        options: Record<string, string>
      ) => void;
      gtag('consent', 'update', {
        analytics_storage: prefs.analytics ? 'granted' : 'denied',
        ad_storage: prefs.marketing ? 'granted' : 'denied',
        functionality_storage: prefs.functional ? 'granted' : 'denied',
      });
    }
  };

  const acceptAll = () => {
    savePreferences({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    });
  };

  const acceptNecessary = () => {
    savePreferences({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    });
  };

  const saveCustom = () => {
    savePreferences(preferences);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-cookie p-2 sm:p-4 pb-safe sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-md max-h-[75dvh] flex flex-col"
      >
        <PremiumCard className="shadow-2xl max-h-[70dvh] flex flex-col overflow-hidden border-border/80" animation="none">
          <div className="p-3 sm:p-5 overflow-y-auto momentum-scroll">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Cookie className="h-5 w-5 text-primary shrink-0" />
                <h3 className="font-semibold text-sm sm:text-base">Cookie Preferences</h3>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="text-muted-foreground hover:text-foreground p-1 min-h-[44px] min-w-[44px] flex items-center justify-center -mr-1 -mt-1"
                aria-label="Close cookie banner"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            {!showSettings ? (
              <>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  We use cookies to enhance your experience, analyze site traffic, and personalize content. 
                  You can customize your preferences or accept all cookies.
                </p>

                {/* Actions: compact grid on mobile to avoid blocking content */}
                <div className="mt-3 sm:mt-4 grid grid-cols-1 min-[360px]:grid-cols-2 gap-2">
                  <Button onClick={acceptAll} className="w-full min-h-[44px] font-medium text-xs sm:text-sm">
                    Accept All
                  </Button>
                  <Button onClick={acceptNecessary} variant="outline" className="w-full min-h-[44px] text-xs sm:text-sm">
                    Necessary Only
                  </Button>
                  <Button
                    onClick={() => setShowSettings(true)}
                    variant="ghost"
                    className="w-full min-h-[38px] min-[360px]:col-span-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Settings className="mr-1.5 h-3.5 w-3.5" />
                    Customize Preferences
                  </Button>
                </div>

                {/* Privacy Policy Link */}
                <p className="mt-2.5 sm:mt-4 text-center text-[11px] sm:text-xs text-muted-foreground">
                  Read our{' '}
                  <Link
                    href="/privacy"
                    className="underline hover:text-foreground"
                  >
                    Privacy Policy
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/terms"
                    className="underline hover:text-foreground"
                  >
                    Terms of Service
                  </Link>
                </p>
              </>
            ) : (
              <>
                <div className="mt-4 space-y-4">
                  {/* Necessary Cookies */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">Necessary Cookies</h4>
                      <p className="text-xs text-muted-foreground">
                        Required for authentication and core functionality
                      </p>
                    </div>
                    <div className="ml-4">
                      <input
                        type="checkbox"
                        checked={true}
                        disabled
                        className="h-4 w-4 rounded border-gray-300"
                        aria-label="Necessary cookies (always enabled)"
                      />
                    </div>
                  </div>

                  {/* Functional Cookies */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">Functional Cookies</h4>
                      <p className="text-xs text-muted-foreground">
                        Remember your preferences and settings
                      </p>
                    </div>
                    <div className="ml-4">
                      <input
                        type="checkbox"
                        checked={preferences.functional}
                        onChange={(e) =>
                          setPreferences({ ...preferences, functional: e.target.checked })
                        }
                        className="h-4 w-4 rounded border-gray-300"
                        aria-label="Functional cookies"
                      />
                    </div>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">Analytics Cookies</h4>
                      <p className="text-xs text-muted-foreground">
                        Help us understand how you use the site
                      </p>
                    </div>
                    <div className="ml-4">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) =>
                          setPreferences({ ...preferences, analytics: e.target.checked })
                        }
                        className="h-4 w-4 rounded border-gray-300"
                        aria-label="Analytics cookies"
                      />
                    </div>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">Marketing Cookies</h4>
                      <p className="text-xs text-muted-foreground">
                        Used to show relevant advertisements
                      </p>
                    </div>
                    <div className="ml-4">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) =>
                          setPreferences({ ...preferences, marketing: e.target.checked })
                        }
                        className="h-4 w-4 rounded border-gray-300"
                        aria-label="Marketing cookies"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <Button onClick={saveCustom} className="flex-1 min-h-[44px]">
                    Save Preferences
                  </Button>
                  <Button
                    onClick={() => setShowSettings(false)}
                    variant="outline"
                    className="flex-1 min-h-[44px]"
                  >
                    Back
                  </Button>
                </div>
              </>
            )}
          </div>
        </PremiumCard>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Hook to check if user has consented to specific cookie types
 */
export function useCookieConsent() {
  const [preferences, setPreferences] = React.useState<CookiePreferences | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const consent = localStorage.getItem('cookie-consent');
      if (consent) {
        try {
          setPreferences(JSON.parse(consent));
        } catch {
          setPreferences(null);
        }
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return {
    hasConsented: preferences !== null,
    preferences,
    canUseAnalytics: preferences?.analytics ?? false,
    canUseMarketing: preferences?.marketing ?? false,
    canUseFunctional: preferences?.functional ?? true,
  };
}
