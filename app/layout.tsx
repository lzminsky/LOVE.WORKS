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
  title: "lovebomb.works",
  description: "Get your relationship dynamics diagnosed by a formal economic model",
  openGraph: {
    title: "lovebomb.works",
    description: "The same models used for pricing options and predicting markets. Now pointed at your love life.",
    siteName: "lovebomb.works",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "lovebomb.works",
    description: "The same models used for pricing options and predicting markets. Now pointed at your love life.",
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
