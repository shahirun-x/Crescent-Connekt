import { ImageResponse } from "next/og";

export const alt = "Crescent Connekt — One Crescent. One Community. One Global Network.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #1a3a6b 0%, #0f2140 100%)",
          color: "#ffffff",
          padding: 80,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#1a3a6b",
              fontSize: 40,
              fontWeight: 800,
            }}
          >
            ☾
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 1 }}>
            Crescent Connekt
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 68,
            fontWeight: 800,
            lineHeight: 1.15,
          }}
        >
          <span>One Crescent. One Community.</span>
          <span>One Global Network.</span>
        </div>
        <div style={{ fontSize: 28, color: "#adc4ea" }}>
          A unified portal for the Crescent ecosystem of institutions
        </div>
      </div>
    ),
    size
  );
}
