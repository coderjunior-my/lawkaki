import { ImageResponse } from "next/og";
import { siteName } from "@/lib/seo";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Functional placeholder — swap for a professionally designed OG image
// when one exists. Reuses the existing brand mark/colours so link
// previews aren't blank in the meantime.
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
          background: "#FAF7F2",
        }}
      >
        <svg width="120" height="150" viewBox="0 0 80 100" fill="none">
          <path
            d="M40 4 C60.4 4 76 19.6 76 40 C76 53.6 67.5 66 56 76 L40 96 L24 76 C12.5 66 4 53.6 4 40 C4 19.6 19.6 4 40 4 Z"
            fill="#0F1F33"
          />
        </svg>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 700, color: "#0F1F33", marginTop: 24 }}>
          {siteName}
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#6B7280", marginTop: 12 }}>
          Your best legal kaki on the ground.
        </div>
      </div>
    ),
    size
  );
}
