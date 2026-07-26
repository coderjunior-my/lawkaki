"use client";

/* ============================================================
   CircularLoader — an amber destination pin dropping onto its
   shadow, with a radar-style ping ring. Shared loading state for
   full-screen and panel-level waits.
   ============================================================ */

const PIN_PATH = "M40 4 C60.4 4 76 19.6 76 40 C76 53.6 67.5 66 56 76 L40 96 L24 76 C12.5 66 4 53.6 4 40 C4 19.6 19.6 4 40 4 Z";

export default function CircularLoader({
  size = 140,
  label,
}: {
  size?: number;
  label?: string;
}) {
  const pinWidth  = size * 0.26;
  const pinHeight = pinWidth * 1.25;
  const groundW   = pinWidth * 0.85;
  const groundH   = groundW * 0.32;
  const pingSize  = groundW * 1.7;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        {/* Ground point sits at the vertical centre; every layer below is
            offset from it with plain px so `transform` stays free for animation. */}
        <div style={{ position: "absolute", left: "50%", top: "56%" }}>
          <div
            className="lk-loader-ping"
            style={{
              position: "absolute", left: -pingSize / 2, top: -pingSize / 2,
              width: pingSize, height: pingSize, borderRadius: 999,
              border: "2px solid var(--amber)",
            }}
          />
          <div
            className="lk-loader-shadow"
            style={{
              position: "absolute", left: -groundW / 2, top: -groundH / 2,
              width: groundW, height: groundH, borderRadius: "50%",
              background: "var(--black)",
            }}
          />
          <svg
            width={pinWidth}
            height={pinHeight}
            viewBox="0 0 80 100"
            fill="none"
            className="lk-loader-pin"
            style={{ position: "absolute", left: -pinWidth / 2, top: -pinHeight * 0.96 }}
            aria-hidden
          >
            <path d={PIN_PATH} fill="var(--amber)" />
          </svg>
        </div>
      </div>
      {label && (
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--warm-grey)" }}>{label}</div>
      )}
    </div>
  );
}
