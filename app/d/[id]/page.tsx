import { Metadata } from "next";
import { ShareCardClient } from "@/app/share/ShareCardClient";
import { getDiagnosis } from "@/lib/diagnosis";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await getDiagnosis(id);

  if (!data) {
    return {
      title: "lovebomb.works",
      description: "Diagnosis expired or not found.",
    };
  }

  const eq = data.equilibrium;
  const topPred = eq.predictions[0];
  const description = `${eq.description}${topPred ? ` — ${topPred.probability}% ${topPred.outcome}` : ""}`;

  const ogData = btoa(JSON.stringify({
    id: eq.id,
    name: eq.name,
    description: data.tagline || eq.description,
    confidence: eq.confidence,
    prediction: topPred || { outcome: "Unknown", probability: 0, level: "low" },
  }));

  return {
    title: `${eq.name} | lovebomb.works`,
    description,
    openGraph: {
      title: eq.name,
      description,
      siteName: "lovebomb.works",
      type: "website",
      images: [{ url: `/api/og?d=${ogData}`, width: 1200, height: 628, alt: eq.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: eq.name,
      description,
      images: [`/api/og?d=${ogData}`],
    },
  };
}

export default async function DiagnosisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getDiagnosis(id);

  if (!data) {
    return <ShareCardClient data={null} />;
  }

  const topPred = data.equilibrium.predictions[0];
  const shareData = {
    id: data.equilibrium.id,
    name: data.equilibrium.name,
    description: data.tagline || data.equilibrium.description,
    confidence: data.equilibrium.confidence,
    prediction: topPred || { outcome: "Unknown", probability: 0, level: "low" },
  };

  return <ShareCardClient data={shareData} />;
}
