import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://digital-daily.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Digital Daily — Live News Aggregator",
    template: "%s | Digital Daily",
  },
  description:
    "Curated live news from 26+ trusted sources worldwide. Politics & World, Technology, Finance & Corporate, Sports. Updated every 5 minutes.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Digital Daily",
    title: "Digital Daily — Live News Aggregator",
    description:
      "Curated live news from 26+ trusted sources worldwide. Politics & World, Technology, Finance & Corporate, Sports.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Digital Daily — Live News Aggregator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Digital Daily — Live News Aggregator",
    description:
      "Curated live news from 26+ trusted sources worldwide.",
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="relative min-h-full bg-black font-sans text-white">
        {/* Liquid gradient ambient orbs */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="orb-1 absolute -left-48 -top-48 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-fuchsia-500/15 via-purple-500/10 to-transparent blur-3xl" />
          <div className="orb-2 absolute -bottom-48 -right-48 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-cyan-400/15 via-blue-500/10 to-transparent blur-3xl" />
          <div className="orb-3 absolute left-1/3 top-1/2 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-pink-500/10 via-rose-500/8 to-transparent blur-3xl" />
        </div>
        <div className="relative z-10">{children}</div>
        <Analytics />
      </body>
    </html>
  );
}
