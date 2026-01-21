import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { NeonProvider } from "@/components/providers/NeonProvider";
import { Providers } from "@/components/providers/Providers";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Offer Analyst",
  description: "Contextualize your search to see ranked offers here.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {process.env.NODE_ENV === 'development' && (
          <Script id="suppress-css-warnings" strategy="beforeInteractive">
            {`
              (function() {
                const originalWarn = console.warn;
                console.warn = function(...args) {
                  const message = args.join(' ');
                  if (message.includes('optimizing generated CSS') || 
                      message.includes('Unexpected token Semicolon') ||
                      message.includes('[-:|]')) {
                    return;
                  }
                  originalWarn.apply(console, args);
                };
              })();
            `}
          </Script>
        )}
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NeonProvider>
              <div className="aurora-bg" />
              {children}
              <Toaster />
            </NeonProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
