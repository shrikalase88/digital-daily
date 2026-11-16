import Link from "next/link";
import { CATEGORIES } from "@/lib/types";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.08] border border-white/15 text-white">
                <svg
                  className="h-3.5 w-3.5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <rect x="3" y="8" width="18" height="13" rx="2" />
                  <path d="M3 8l2-2M21 8l-2-2M8 12h8M8 16h8" />
                </svg>
              </div>
              <span className="text-base font-semibold tracking-tight text-white">
                Digital Daily
              </span>
            </div>
            <p className="text-xs leading-relaxed text-zinc-400">
              Trusted live news aggregation across 26+ global wire services. Curated
              coverage across Politics & World, Technology, Finance & Corporate, and Sports.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400 font-mono">
              Categories
            </h4>
            <ul className="space-y-2">
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/?category=${encodeURIComponent(cat)}`}
                    className="text-xs text-zinc-400 transition-colors hover:text-white"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400 font-mono">
              Sources
            </h4>
            <ul className="grid grid-cols-2 gap-1.5 text-xs text-zinc-400">
              {[
                "NY Times",
                "BBC",
                "NPR",
                "CBC News",
                "The Guardian",
                "ABC News",
                "NDTV",
                "Times of India",
                "The Hindu",
                "The Verge",
                "TechCrunch",
                "Ars Technica",
                "Wired",
                "Bloomberg",
                "Yahoo Finance",
                "IMF",
                "Federal Reserve",
                "Economic Times",
                "LiveMint",
                "BBC Sport",
                "Sky Sports",
                "CBS Sports",
              ].map((s) => (
                <li key={s} className="truncate">{s}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400 font-mono">
              Info & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Contact", href: "/contact" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-zinc-400 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/[0.04] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px] text-zinc-500 font-mono">
          <p>Digital Daily &copy; 2026. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span>Weather via Open-Meteo</span>
            <span>·</span>
            <span>Markets via BSE / NSE</span>
            <span>·</span>
            <a
              href="https://sportscore.com/"
              rel="dofollow"
              title="Sports data by SportScore"
              className="text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Sports via SportScore
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
