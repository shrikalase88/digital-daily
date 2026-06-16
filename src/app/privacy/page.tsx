import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
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
              Privacy Policy
            </h1>
            <p className="text-xs text-white/25">Effective Date: June 15, 2026</p>
          </div>

          <p className="text-sm leading-relaxed text-white/50">
            Welcome to Digital Daily. We value your privacy and are committed to
            keeping your browsing experience transparent, secure, and clean. This
            Privacy Policy outlines how our platform operates regarding user data.
          </p>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white/80">
              1. No Personal Data Collection
            </h2>
            <p className="text-sm leading-relaxed text-white/50">
              Digital Daily is built as a zero-data, one-stop aggregation platform.
              We do not require account registration, we do not deploy user tracking
              databases, and we do not collect, store, or sell your personal
              information.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white/80">
              2. Cookies and Local Storage
            </h2>
            <p className="text-sm leading-relaxed text-white/50">
              Our application may use minimal local storage or functional browser
              cookies purely to optimize your experience, such as saving your layout
              view choices, dark mode status, or active category filtering
              preferences. This data never leaves your device.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white/80">
              3. Third-Party Links &amp; External Sites
            </h2>
            <p className="text-sm leading-relaxed text-white/50">
              Our website displays news snippets, headlines, and thumbnail images
              sourced via public RSS feeds from external news publishers. When you
              click on any news card link to read a full article, you are redirected
              to that external publisher&apos;s website. We have no control over,
              and assume no responsibility for, the privacy policies, tracking
              mechanisms, or cookie structures of third-party platforms.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white/80">
              4. Contact Information
            </h2>
            <p className="text-sm leading-relaxed text-white/50">
              For any questions regarding this privacy policy, you can reach out
              directly via email to:
            </p>
            <ul className="ml-4 space-y-1 text-sm text-white/50">
              <li>
                <span className="text-white/30">Data Controller:</span>{" "}
                Shrikant Kalase
              </li>
              <li>
                <span className="text-white/30">Email:</span>{" "}
                shrikalase88@gmail.com
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
