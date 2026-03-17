import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import { nanoid } from "nanoid";

const TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

interface DiagnosisPayload {
  equilibrium: {
    id: string;
    name: string;
    description: string;
    confidence: number;
    predictions: Array<{
      outcome: string;
      probability: number;
      level: string;
    }>;
  };
  tagline?: string;
  analysis?: {
    parameters: Array<{ param: string; value: string; basis: string }>;
    extensions: Array<{ id: string; name: string; status: string; detail: string }>;
  };
}

export async function POST(req: NextRequest) {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      { error: "Storage not configured" },
      { status: 503 }
    );
  }

  try {
    const payload: DiagnosisPayload = await req.json();

    // Validate required fields
    if (!payload.equilibrium?.id || !payload.equilibrium?.name) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    const shortId = nanoid(8);
    const key = `diagnosis:${shortId}`;

    await redis.set(key, JSON.stringify(payload), { ex: TTL_SECONDS });

    const origin = req.headers.get("origin") || "https://lovebomb.works";
    const url = `${origin}/d/${shortId}`;

    return NextResponse.json({ id: shortId, url });
  } catch {
    return NextResponse.json(
      { error: "Failed to store diagnosis" },
      { status: 500 }
    );
  }
}
