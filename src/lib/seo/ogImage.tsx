import { ImageResponse } from "next/og";
import { SITE_NAME } from "./site";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";
export const ogAlt =
  "PhyCalcPro – Professional Engineering Calculators & Design Software";

export function renderOgImage(
  subtitle = "Professional Engineering Calculators & Design Software"
) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 34,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: "#94a3b8",
            }}
          >
            {SITE_NAME}
          </div>
          <div
            style={{
              marginTop: 32,
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.1,
              color: "#f8fafc",
              maxWidth: 960,
            }}
          >
            {subtitle}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          {[
            "Beam analysis",
            "Shaft design",
            "Bearings",
            "Gears",
            "Power transmission",
            "Structural analysis",
          ].map((tag) => (
            <div
              key={tag}
              style={{
                display: "flex",
                fontSize: 26,
                color: "#e2e8f0",
                border: "2px solid #334155",
                borderRadius: 12,
                padding: "10px 20px",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...ogSize }
  );
}
