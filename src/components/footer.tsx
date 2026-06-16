import { CATEGORIES } from "@/lib/types";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/[0.03]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500/30 to-cyan-500/30 backdrop-blur-xl">
                <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="8" width="18" height="13" rx="2" />
                  <path d="M3 8l2-2M21 8l-2-2M8 12h8M8 16h8" />
                </svg>
              </div>
              <span className="text-base font-bold tracking-tight text-white/80">
                Digital Daily
              </span>
            </div>
            <p className="text-sm leading-relaxed text-white/30">
              Curated news from 19 trusted sources worldwide. Live across Politics & World,
              Technology, Finance & Corporate, and Sports.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40">
              Categories
            </h4>
            <ul className="space-y-2">
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <a
                    href={`/?category=${encodeURIComponent(cat)}`}
                    className="text-sm text-white/40 transition-colors hover:text-white/70"
                  >
                    {cat}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40">
              Sources
            </h4>
            <ul className="grid grid-cols-2 gap-1.5 text-sm text-white/40">
              {[
                "NY Times", "BBC", "NPR", "CBC News",
                "The Guardian", "ABC News",
                "The Verge", "TechCrunch", "Ars Technica", "Wired",
                "Bloomberg", "Yahoo Finance", "IMF", "Federal Reserve", "Economic Times",
                "Yahoo Sports", "BBC Sport", "Sky Sports", "CBS Sports",
              ].map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40">
              Info
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Contact", href: "/contact" },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-white/40 transition-colors hover:text-white/70"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/[0.03] pt-6 text-center">
          <p className="text-[11px] text-white/20">
            <span className="tracking-wider">
              Digital Daily &copy; {new Date().getFullYear()}
            </span>
            <span className="mx-2">·</span>
            <span>Weather via Open-Meteo</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
