import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
