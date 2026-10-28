'use client';

/**
 * Terms of Service Page
 * Clear rules and service agreements for OfferAnalyst users
 */

import React from 'react';
import { SimpleLayout } from '@/components/layout/SimpleLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, CheckCircle2, AlertTriangle, ShieldCheck, Scale, HelpCircle } from 'lucide-react';

export default function TermsPage() {
  return (
    <SimpleLayout
      title="Terms of Service"
      description="Last updated: January 22, 2026 • Legal terms governing your use of OfferAnalyst"
      maxWidth="5xl"
    >
      <div className="space-y-6">
        {/* Summary Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Terms at a Glance</CardTitle>
            </div>
            <CardDescription>
              OfferAnalyst is designed to be free, open, and respectful of your autonomy. Here is what you need to know.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <span><strong>Free Forever Core:</strong> Free-tier AI analysis is available without requiring a credit card.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <span><strong>Your Data Ownership:</strong> You retain complete ownership of all prompts, offers, and analysis outputs.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <span><strong>BYOK Flexibility:</strong> Use your own API keys for OpenRouter or Google with zero surcharge.</span>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <span><strong>AI Recommendations:</strong> AI scores and insights are guidance tools, not certified financial or legal counsel.</span>
            </div>
          </CardContent>
        </Card>

        {/* Section 1: Agreement */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              1. Acceptance of Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              By accessing or using the OfferAnalyst platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree, please do not access or use the service.
            </p>
          </CardContent>
        </Card>

        {/* Section 2: Service Description & Tiers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              2. Service Description & Usage Tiers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <div>
              <h4 className="font-semibold text-foreground mb-1">A. Free Core Service</h4>
              <p>
                Users can evaluate offers using default pooled model endpoints subject to dynamic rate-limiting (up to 100 requests per hour).
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">B. Bring Your Own Key (BYOK)</h4>
              <p>
                Users configuring personal API credentials enjoy elevated throughput limits (up to 500 requests per hour) directly interfacing with provider networks. You are solely responsible for usage costs incurred on third-party provider accounts.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Acceptable Use */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              3. Acceptable Use Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>You agree not to engage in any of the following prohibited activities:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Attempting to probe, scan, or breach system vulnerabilities or bypass rate limits.</li>
              <li>Deploying automated scrapers or bots that degrade platform performance for other users.</li>
              <li>Submitting fraudulent, unlawful, defamatory, or harmful content for automated AI processing.</li>
              <li>Reverse engineering or redistributing the hosted platform service without authorization.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 4: AI Disclaimer */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              4. Disclaimer of Warranties & AI Limitations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              OfferAnalyst delivers algorithmic scoring and analytical synthesis based on large language models. AI models can occasionally produce inaccurate, incomplete, or biased information. Analysis scores should be used as supporting research and not as the sole basis for critical commercial, investment, or hiring decisions.
            </p>
            <p>
              The service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, whether express or implied.
            </p>
          </CardContent>
        </Card>
      </div>
    </SimpleLayout>
  );
}
