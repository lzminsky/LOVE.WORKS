import { getRedis } from "@/lib/redis";

export interface DiagnosisData {
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

export async function getDiagnosis(id: string): Promise<DiagnosisData | null> {
  const redis = getRedis();
  if (!redis) return null;

  try {
    const data = await redis.get<string>(`diagnosis:${id}`);
    if (!data) return null;

    // data may already be parsed by Upstash client
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    return parsed as DiagnosisData;
  } catch {
    return null;
  }
}
