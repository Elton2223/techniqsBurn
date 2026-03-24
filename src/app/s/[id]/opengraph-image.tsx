import { ImageResponse } from "next/og";

export const alt = "Someone sent you a secret — Techniqs Burn";
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
          alignItems: "center",
          justifyContent: "center",
          background: "#09090b",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "80px",
              height: "80px",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "20px",
              background: "rgba(249, 115, 22, 0.1)",
            }}
          >
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f97316"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                fontWeight: 700,
                color: "#fafafa",
                letterSpacing: "-0.02em",
              }}
            >
              Someone sent you a secret
            </div>
            <div
              style={{
                fontSize: "22px",
                color: "#a1a1aa",
              }}
            >
              Tap to reveal. Once viewed, it self-destructs forever.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginTop: "16px",
            }}
          >
            <div
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: "#71717a",
              }}
            >
              Techniqs
            </div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: "#f97316",
              }}
            >
              Burn
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "#52525b",
                marginLeft: "8px",
              }}
            >
              AES-256-GCM encrypted
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
