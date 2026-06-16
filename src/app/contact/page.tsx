import Link from "next/link";
import { Mail, ShieldCheck, Globe } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white/70"
        >
          <span>←</span>
          <span>Back to Home</span>
        </Link>

        <div className="ios-glass rounded-3xl p-8 sm:p-10 space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Get in Touch
            </h1>
            <p className="text-sm text-white/40 max-w-md">
              Have questions about our aggregation platform, feature suggestions,
              or need an RSS endpoint updated? Drop a line below.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="mailto:shrikalase88@gmail.com"
              className="flex items-center gap-4 p-4 border border-white/5 rounded-2xl bg-white/[0.02] hover:border-pink-500/30 hover:bg-white/[0.04] transition-all group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400">
                <Mail className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-white/30 font-medium uppercase tracking-wider">
                  Primary Email
                </p>
                <p className="text-sm text-white/70 font-semibold group-hover:text-pink-400 transition-colors truncate">
                  shrikalase88@gmail.com
                </p>
              </div>
            </a>

            <div className="flex items-center gap-4 p-4 border border-white/5 rounded-2xl bg-white/[0.02]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-white/30 font-medium uppercase tracking-wider">
                  Platform Owner
                </p>
                <p className="text-sm text-white/70 font-bold">
                  Shrikant Kalase
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 items-start rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4">
            <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5 text-indigo-400" />
            <div className="text-xs text-indigo-200/70 leading-relaxed">
              <span className="mb-0.5 block font-semibold text-indigo-300">
                RSS Aggregator Transparency
              </span>
              Digital Daily acts solely as an indexing platform. We do not modify
              stories, host full-text payloads, or interrupt original telemetry
              monetization streams. All attribution credits map cleanly to source
              publishers automatically.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
