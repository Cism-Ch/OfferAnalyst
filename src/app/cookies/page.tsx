'use client';

/**
 * Cookie Preferences & Policy Page
 * Interactive privacy controls for OfferAnalyst users
 */

import React, { useState, useEffect } from 'react';
import { SimpleLayout } from '@/components/layout/SimpleLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cookie, Check, Shield, BarChart3, Settings, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

const defaultPreferences: CookiePreferences = {
  necessary: true,
  functional: true,
  analytics: false,
  marketing: false,
};

export default function CookiesPage() {
  const { success, error } = useToast();
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [, setHasSaved] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cookie-consent');
      if (saved) {
        /* eslint-disable react-hooks/set-state-in-effect */
        setPreferences(JSON.parse(saved));
        /* eslint-enable react-hooks/set-state-in-effect */
      }
    } catch {
      // Fallback to defaults
    }
  }, []);

  const handleSave = (newPrefs: CookiePreferences) => {
    try {
      localStorage.setItem('cookie-consent', JSON.stringify(newPrefs));
      setPreferences(newPrefs);
      setHasSaved(true);
      success('Cookie preferences successfully saved!');
    } catch {
      error('Failed to save preferences');
    }
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Cannot disable necessary cookies
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
  };

  const handleAcceptAll = () => {
    const all = { necessary: true, functional: true, analytics: true, marketing: true };
    handleSave(all);
  };

  const handleRejectOptional = () => {
    const min = { necessary: true, functional: false, analytics: false, marketing: false };
    handleSave(min);
  };

  return (
    <SimpleLayout
      title="Cookie Preferences"
      description="Manage your privacy and telemetry settings. We prioritize your privacy and respect Do-Not-Track."
      maxWidth="5xl"
    >
      <div className="space-y-6">
        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Cookie className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Granular Privacy Control</h3>
              <p className="text-xs text-muted-foreground">Adjust each category according to your preference</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={handleRejectOptional} className="flex-1 sm:flex-initial">
              Reject Optional
            </Button>
            <Button size="sm" onClick={handleAcceptAll} className="flex-1 sm:flex-initial">
              Accept All
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 gap-4">
          {/* Strictly Necessary */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Shield className="h-5 w-5 text-emerald-500" />
                  <div>
                    <CardTitle className="text-base">Strictly Necessary Cookies</CardTitle>
                    <CardDescription className="text-xs mt-0.5">Required for core system security and session management</CardDescription>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Always Active
                </span>
              </div>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground leading-relaxed">
              These cookies enable essential authentication via Better-Auth, CSRF protection, and local storage routing state. They cannot be disabled as the platform cannot function securely without them.
            </CardContent>
          </Card>

          {/* Functional */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Settings className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-base">Functional & Preference Cookies</CardTitle>
                    <CardDescription className="text-xs mt-0.5">Remembers your active theme, model selection, and layout state</CardDescription>
                  </div>
                </div>
                <Button
                  variant={preferences.functional ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => togglePreference('functional')}
                  className="min-w-[90px]"
                >
                  {preferences.functional ? (
                    <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Enabled</span>
                  ) : (
                    'Disabled'
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground leading-relaxed">
              Stores your chosen UI theme (e.g. Dark, Gold, Neon), sidebar collapse state, and recent search filters locally in your browser to maintain your personal preference across visits.
            </CardContent>
          </Card>

          {/* Analytics / Core Web Vitals */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="h-5 w-5 text-sky-500" />
                  <div>
                    <CardTitle className="text-base">Performance & Web Vitals</CardTitle>
                    <CardDescription className="text-xs mt-0.5">Anonymized performance telemetry (CLS, FCP, LCP, INP)</CardDescription>
                  </div>
                </div>
                <Button
                  variant={preferences.analytics ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => togglePreference('analytics')}
                  className="min-w-[90px]"
                >
                  {preferences.analytics ? (
                    <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Enabled</span>
                  ) : (
                    'Disabled'
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground leading-relaxed">
              Provides aggregated, completely anonymized page speed diagnostics without personal identifiers to help our engineering team optimize render times and resolve browser latency.
            </CardContent>
          </Card>

          {/* Marketing */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  <div>
                    <CardTitle className="text-base">Marketing & Personalization</CardTitle>
                    <CardDescription className="text-xs mt-0.5">Used for personalized campaign updates (Disabled by default)</CardDescription>
                  </div>
                </div>
                <Button
                  variant={preferences.marketing ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => togglePreference('marketing')}
                  className="min-w-[90px]"
                >
                  {preferences.marketing ? (
                    <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Enabled</span>
                  ) : (
                    'Disabled'
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground leading-relaxed">
              OfferAnalyst contains zero third-party advertising tracking. If enabled, this simply permits tailored onboarding suggestions based on your search domain topics.
            </CardContent>
          </Card>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <Button onClick={() => handleSave(preferences)} className="px-6">
            Save Preferences
          </Button>
        </div>
      </div>
    </SimpleLayout>
  );
}
