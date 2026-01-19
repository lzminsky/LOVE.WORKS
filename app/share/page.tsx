import { Metadata } from "next";
import { ShareCardClient } from "./ShareCardClient";

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

function decodeShareData(encoded: string | undefined): ShareData | null {
  if (!encoded) return null;

  try {
    const json = Buffer.from(encoded, "base64").toString("utf-8");
    return JSON.parse(json) as ShareData;
  } catch {
    return null;
  }
}

// Generate dynamic metadata for OpenGraph/Twitter cards
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const data = decodeShareData(params.d);

  if (!data) {
    return {
      title: "lovebomb.works",
      description: "Formal economics for your love life.",
    };
  }

  const title = data.name;
  const description = `${data.description} — ${data.prediction.probability}% ${data.prediction.outcome}`;

  return {
    title: `${title} | lovebomb.works`,
    description,
    openGraph: {
      title,
      description,
      siteName: "lovebomb.works",
      type: "website",
      images: [
        {
          url: `/api/og?d=${params.d}`,
          width: 1200,
          height: 628,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og?d=${params.d}`],
    },
  };
}

export default async function SharePage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const params = await searchParams;
  const data = decodeShareData(params.d);

  return <ShareCardClient data={data} />;
}
