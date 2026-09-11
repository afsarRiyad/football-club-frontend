import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_SHORT_NAME } from "@/lib/seo";

/* Default Open Graph / Twitter card image (1200×630). */
export const alt = `${SITE_NAME} — official football club website`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #0B0B0F 0%, #14161F 55%, #0B0B0F 100%)",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 14,
              height: 44,
              borderRadius: 6,
              background: "#3ED598",
            }}
          />
          <div
            style={{
              fontSize: 26,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#3ED598",
              fontWeight: 700,
            }}
          >
            {SITE_SHORT_NAME}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>
            {SITE_NAME}
          </div>
          <div style={{ fontSize: 34, color: "#A7A7B4", lineHeight: 1.35, maxWidth: 920 }}>
            Squad, fixtures, live scores, standings, news and academy — the official club site.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 24,
            color: "#7C7C8A",
          }}
        >
          <div>Bhuiyyarhat Chowrasta · Kabirhat · Noakhali</div>
          <div style={{ color: "#3ED598", fontWeight: 700 }}>Football Club</div>
        </div>
      </div>
    ),
    size,
  );
}
