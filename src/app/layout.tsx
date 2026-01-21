import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { NeonProvider } from "@/components/providers/NeonProvider";
import { Providers } from "@/components/providers/Providers";
import { Toaster } from "@/components/ui/sonner";

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
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NeonProvider>
              <div className="fixed inset-0 -z-10 animate-aurora bg-gradient-to-br from-[hsla(var(--neon-hsl),0.1)] via-transparent to-[hsla(var(--neon-hsl),0.05)] bg-[size:200%_200%] opacity-40" />
              {children}
              <Toaster />
            </NeonProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
