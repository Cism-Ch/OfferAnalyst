'use client';

/**
 * Privacy Policy Page
 * GDPR and CCPA compliant privacy disclosure
 */

import React from 'react';
import { SimpleLayout } from '@/components/layout/SimpleLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, Lock, Eye, Server, RefreshCw, Mail, CheckCircle2 } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <SimpleLayout
      title="Privacy Policy"
      description="Last updated: January 22, 2026 • Our commitment to transparency and data security"
      maxWidth="5xl"
    >
      <div className="space-y-6">
        {/* Key Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <Shield className="h-6 w-6 text-primary mb-1" />
              <CardTitle className="text-base">Privacy-First Architecture</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Zero external analytics trackers. All telemetry is internal, privacy-preserving, and GDPR-compliant.
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <Lock className="h-6 w-6 text-primary mb-1" />
              <CardTitle className="text-base">Encrypted at Rest & In Transit</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              BYOK API keys are hashed and encrypted. All communications use TLS 1.3 encryption.
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <Eye className="h-6 w-6 text-primary mb-1" />
              <CardTitle className="text-base">Your Data, Your Control</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Export or delete your searches, saved offers, and account data anytime with one click.
            </CardContent>
          </Card>
        </div>

        {/* Section 1: Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              1. Introduction
            </CardTitle>
            <CardDescription>How we approach user privacy at OfferAnalyst</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              Welcome to <strong>OfferAnalyst</strong>. We believe you shouldn&apos;t have to compromise privacy to benefit from AI-powered decision making. This Privacy Policy details the types of information we collect, how it is used, and the strict controls you have over your personal data.
            </p>
            <p>
              By using OfferAnalyst, you agree to the collection and use of information in accordance with this policy. If you have questions, contact us at <a href="mailto:privacy@offeranalyst.com" className="text-primary hover:underline">privacy@offeranalyst.com</a>.
            </p>
          </CardContent>
        </Card>

        {/* Section 2: Information Collected */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              2. Information We Collect
            </CardTitle>
            <CardDescription>What data is processed to deliver recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-1">A. Information You Provide Directly</h4>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Account Information:</strong> Email address, name, and hashed credentials when you register via Better-Auth.</li>
                <li><strong>Analysis Configurations:</strong> Target domains, implicit criteria, weights, and pasted offer texts/JSON.</li>
                <li><strong>BYOK API Keys:</strong> Third-party provider keys (e.g. OpenRouter) stored securely for custom model routing.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">B. Automatically Collected Technical Data</h4>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Local Storage:</strong> Selected UI theme, recent search drafts, and saved offer IDs stored client-side.</li>
                <li><strong>Performance & Web Vitals:</strong> Anonymized Core Web Vitals (CLS, FCP, LCP, TTFB, INP) for platform speed optimization.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Data Security */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              3. Data Storage & Security Safeguards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              Security is foundational to our architecture:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/40 border">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-foreground block">Zero Secret Leaks</span>
                  <span>Strict RSC and server-side secret isolation ensures API tokens are never sent to the browser.</span>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/40 border">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-foreground block">Encrypted Database</span>
                  <span>Managed MongoDB cluster with AES-256 encryption at rest and automated backups.</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Your Rights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              4. Your Privacy Rights (GDPR & CCPA)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              Regardless of your geographic location, OfferAnalyst provides all users with equal control over their data:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Right to Access:</strong> View all saved searches, analyses, and profile settings in your dashboard.</li>
              <li><strong>Right to Rectification:</strong> Edit or correct any configuration directly in your account settings.</li>
              <li><strong>Right to Erasure:</strong> Delete any individual offer or request complete account deletion at any time.</li>
              <li><strong>Right to Portability:</strong> Export your analyses and comparison tables in structured JSON format.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact Support Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Data Protection Officer
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Have questions regarding our privacy practices or wish to exercise your data rights?
              </p>
            </div>
            <a
              href="mailto:privacy@offeranalyst.com"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
            >
              Contact Privacy Team
            </a>
          </CardContent>
        </Card>
      </div>
    </SimpleLayout>
  );
}
