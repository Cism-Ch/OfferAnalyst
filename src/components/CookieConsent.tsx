'use client';

/**
 * Cookie Consent Banner
 * 
 * GDPR and CCPA compliant cookie consent banner
 */

import React from 'react';
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
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify(prefs));
    setPreferences(prefs);
    setIsVisible(false);
    setShowSettings(false);

    // Trigger consent event for analytics
    if (typeof window !== 'undefined' && (window as Record<string, unknown>).gtag) {
      const gtag = (window as Record<string, unknown>).gtag as (
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
        className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-md"
      >
        <PremiumCard className="shadow-2xl" animation="none">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Cookie className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Cookie Preferences</h3>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close cookie banner"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            {!showSettings ? (
              <>
                <p className="mt-2 text-sm text-muted-foreground">
                  We use cookies to enhance your experience, analyze site traffic, and personalize content. 
                  You can customize your preferences or accept all cookies.
                </p>

                {/* Actions */}
                <div className="mt-4 flex flex-col gap-2">
                  <Button onClick={acceptAll} className="w-full">
                    Accept All
                  </Button>
                  <Button onClick={acceptNecessary} variant="outline" className="w-full">
                    Necessary Only
                  </Button>
                  <Button
                    onClick={() => setShowSettings(true)}
                    variant="ghost"
                    className="w-full"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Customize
                  </Button>
                </div>

                {/* Privacy Policy Link */}
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Read our{' '}
                  <a
                    href="/docs/privacy-policy"
                    className="underline hover:text-foreground"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </a>{' '}
                  and{' '}
                  <a
                    href="/docs/terms"
                    className="underline hover:text-foreground"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Terms of Service
                  </a>
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
                  <Button onClick={saveCustom} className="flex-1">
                    Save Preferences
                  </Button>
                  <Button
                    onClick={() => setShowSettings(false)}
                    variant="outline"
                    className="flex-1"
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
    const consent = localStorage.getItem('cookie-consent');
    if (consent) {
      try {
        setPreferences(JSON.parse(consent));
      } catch {
        setPreferences(null);
      }
    }
  }, []);

  return {
    hasConsented: preferences !== null,
    preferences,
    canUseAnalytics: preferences?.analytics ?? false,
    canUseMarketing: preferences?.marketing ?? false,
    canUseFunctional: preferences?.functional ?? true,
  };
}
