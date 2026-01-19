import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import { AnalyticsProvider } from "@/components/providers/AnalyticsProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://lovebomb.works"),
  title: {
    default: "lovebomb.works — Relationship Dynamics Analysis",
    template: "%s | lovebomb.works",
  },
  description: "Get your relationship dynamics diagnosed by a formal economic model. The same frameworks used for pricing options and predicting markets — now pointed at your love life.",
  keywords: ["relationships", "dating", "game theory", "economics", "analysis", "love", "dynamics"],
  authors: [{ name: "bounded.works" }],
  creator: "bounded.works",
  openGraph: {
    title: "lovebomb.works — Relationship Dynamics Analysis",
    description: "The same models used for pricing options and predicting markets. Now pointed at your love life.",
    siteName: "lovebomb.works",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "lovebomb.works",
    description: "The same models used for pricing options and predicting markets. Now pointed at your love life.",
    creator: "@lzminsky",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <Suspense fallback={null}>
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </Suspense>
      </body>
    </html>
  );
}
