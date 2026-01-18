import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

interface ShareData {
  id: string;
  name: string;
  description: string;
  confidence: number;
  prediction: {
    outcome: string;
    probability: number;
    level: string;
  };
}

function decodeShareData(encoded: string | null): ShareData | null {
  if (!encoded) return null;

  try {
    const json = atob(encoded);
    return JSON.parse(json) as ShareData;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const data = decodeShareData(searchParams.get("d"));

  // Default fallback
  if (!data) {
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
            backgroundColor: "#0d0d0d",
            color: "#ffffff",
            fontFamily: "system-ui",
          }}
        >
          <div style={{ fontSize: 64, fontWeight: 600 }}>love.works</div>
          <div style={{ fontSize: 24, color: "#888", marginTop: 16 }}>
            Formal economics for your love life.
          </div>
        </div>
      ),
      { width: 1200, height: 628 }
    );
  }

  // Split name into lines
  const nameLines = data.name.split(" ");
  const midpoint = Math.ceil(nameLines.length / 2);
  const line1 = nameLines.slice(0, midpoint).join(" ");
  const line2 = nameLines.slice(midpoint).join(" ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0d0d0d",
          padding: 48,
          fontFamily: "system-ui",
        }}
      >
        {/* Top section */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* ID and confidence */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                padding: "6px 12px",
                borderRadius: 4,
                fontSize: 14,
                color: "#666",
                fontFamily: "monospace",
              }}
            >
              {data.id}
            </div>
            <div style={{ fontSize: 14, color: "#d4a574" }}>
              {data.confidence}% confidence
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 56,
              fontWeight: 600,
              color: "#ffffff",
              lineHeight: 1.1,
              marginBottom: 20,
            }}
          >
            <span>{line1}</span>
            {line2 && <span>{line2}</span>}
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: 22,
              color: "#888",
              maxWidth: 500,
              lineHeight: 1.5,
            }}
          >
            {data.description}
          </div>
        </div>

        {/* Bottom section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          {/* Prediction */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: "#d4a574",
              }}
            />
            <div style={{ fontSize: 18, color: "#d4a574", fontFamily: "monospace" }}>
              {data.prediction.probability}%
            </div>
            <div style={{ fontSize: 18, color: "#888" }}>
              {data.prediction.outcome}
            </div>
          </div>

          {/* Branding */}
          <div style={{ fontSize: 18, fontWeight: 600, color: "#444" }}>
            love.works
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 628 }
  );
}
