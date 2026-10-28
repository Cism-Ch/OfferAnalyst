import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/ui/toast";
import { AnalysisProvider } from "@/contexts/AnalysisContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CookieConsent } from "@/components/CookieConsent";
import { WebVitalsTracker } from "@/components/WebVitalsTracker";

export const metadata: Metadata = {
  title: "Offer Analyst - AI-Powered Contextual Recommendations",
  description: "Premium SaaS platform for AI-powered offer analysis and contextual recommendations. Powered by OpenRouter multi-model AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased">
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            themes={['light', 'dark', 'gold', 'ocean', 'forest', 'neon', 'silver', 'system']}
          >
            <ToastProvider>
              <LanguageProvider>
                <AnalysisProvider>
                  <WebVitalsTracker />
                  {children}
                  <CookieConsent />
                </AnalysisProvider>
              </LanguageProvider>
            </ToastProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
