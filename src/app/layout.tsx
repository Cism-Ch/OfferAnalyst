import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { MotionProvider } from "@/components/motion-provider";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/ui/toast";
import { AnalysisProvider } from "@/contexts/AnalysisContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CookieConsent } from "@/components/CookieConsent";
import { WebVitalsTracker } from "@/components/WebVitalsTracker";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

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
    <html lang="fr" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="antialiased">
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            themes={['light', 'dark', 'gold', 'ocean', 'forest', 'neon', 'silver', 'system']}
          >
            <MotionProvider>
              <ToastProvider>
                <LanguageProvider>
                  <AnalysisProvider>
                    <WebVitalsTracker />
                    {children}
                    <CookieConsent />
                  </AnalysisProvider>
                </LanguageProvider>
              </ToastProvider>
            </MotionProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
