import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

export async function GET() {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ count: 0 });
  }

  try {
    const count = await redis.get<number>("lovebomb:diagnosed_count");
    return NextResponse.json({ count: count || 0 });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
