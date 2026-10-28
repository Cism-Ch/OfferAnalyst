import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/ui/toast";
import { AnalysisProvider } from "@/contexts/AnalysisContext";

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
    <html lang="en" suppressHydrationWarning>
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
              <AnalysisProvider>
                {children}
              </AnalysisProvider>
            </ToastProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
