import { ImageResponse } from "next/og";

export const alt = "Digital Daily — Live News Aggregator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0f 0%, #1a1025 50%, #0a0a0f 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              background: "linear-gradient(135deg, rgba(255,56,128,0.4), rgba(0,200,255,0.4))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <rect x="3" y="8" width="18" height="13" rx="2" />
              <path d="M3 8l2-2M21 8l-2-2M8 12h8M8 16h8" />
            </svg>
          </div>
          <span style={{ color: "white", fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Digital Daily
          </span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 18, margin: 0, textAlign: "center", maxWidth: 600 }}>
          Curated live news from 26+ trusted sources worldwide
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          {["Politics", "Technology", "Finance", "Sports"].map((cat) => (
            <span
              key={cat}
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 13,
                padding: "6px 16px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)",
              }}
            >
              {cat}
            </span>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
