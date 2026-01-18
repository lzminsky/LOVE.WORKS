import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://love.works"),
  title: "love.works",
  description: "Get your relationship dynamics diagnosed by a formal economic model",
  openGraph: {
    title: "love.works",
    description: "The same models used for pricing options and predicting markets. Now pointed at your love life.",
    siteName: "love.works",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "love.works",
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
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
