import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://digital-daily.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#09090b",
};

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
    <html lang="en" className="h-full antialiased dark">
      <body className="relative min-h-full bg-[#09090b] font-sans text-zinc-100 selection:bg-zinc-800 selection:text-white">
        {/* Subtle, refined editorial ambient depth */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(120,119,198,0.06),transparent_70%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(9,9,11,0.8)_60%,#09090b)]" />
        </div>
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
