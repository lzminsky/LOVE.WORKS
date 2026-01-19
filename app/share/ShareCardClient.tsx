"use client";

import { useRef, useState } from "react";
import { Footer } from "@/components/ui/Footer";
import Link from "next/link";

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

interface ShareCardClientProps {
  data: ShareData | null;
}

export function ShareCardClient({ data }: ShareCardClientProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Handle missing data
  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-text">
        <h1 className="mb-4 text-2xl font-semibold">Invalid share link</h1>
        <p className="mb-8 text-muted">
          This link doesn&apos;t contain valid data.
        </p>
        <Link
          href="/"
          className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-background transition-colors hover:bg-accent-hover"
        >
          Try lovebomb.works →
        </Link>
        <div className="absolute bottom-0 left-0 right-0">
          <Footer />
        </div>
      </div>
    );
  }

  // Split name into lines for display
  const nameLines = data.name.split(" ");
  const midpoint = Math.ceil(nameLines.length / 2);
  const line1 = nameLines.slice(0, midpoint).join(" ");
  const line2 = nameLines.slice(midpoint).join(" ");

  const handleDownloadPNG = async () => {
    if (!cardRef.current) return;

    setIsExporting(true);
    try {
      const { toPng } = await import("html-to-image");

      const dataUrl = await toPng(cardRef.current, {
        width: 1200,
        height: 628,
        pixelRatio: 2,
        backgroundColor: "#0d0d0d",
      });

      const link = document.createElement("a");
      link.download = `lovebomb-works-${data.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareTwitter = () => {
    const text = `${data.name}\n\n"${data.description}"\n\n${data.prediction.probability}% ${data.prediction.outcome}\n\nvia lovebomb.works`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "width=550,height=420");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-text">
      <div className="mb-6 text-[13px] uppercase tracking-[0.1em] text-muted-dark">
        Shared Result
      </div>

      {/* Card */}
      <div
        ref={cardRef}
        className="relative mb-8 h-[314px] w-[600px] overflow-hidden rounded-xl border border-white/[0.08] bg-[#0d0d0d] p-12"
      >
        {/* Grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
            `,
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 flex h-full flex-col justify-between">
          <div>
            <div className="mb-5 flex items-center gap-2">
              <span className="rounded bg-white/[0.05] px-2 py-1 font-mono text-[11px] text-muted-dark">
                {data.id}
              </span>
              <span className="text-[11px] font-medium text-accent">
                {data.confidence}% confidence
              </span>
            </div>

            <h1 className="mb-4 text-4xl font-semibold leading-none tracking-tight text-text">
              {line1}
              {line2 && (
                <>
                  <br />
                  {line2}
                </>
              )}
            </h1>

            <p className="max-w-[400px] text-base leading-relaxed text-muted">
              {data.description}
            </p>
          </div>

          <div className="flex items-end justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-accent" />
              <span className="font-mono text-sm text-accent">
                {data.prediction.probability}%
              </span>
              <span className="text-sm text-muted">
                {data.prediction.outcome}
              </span>
            </div>

            <div className="text-sm font-semibold text-muted-dark">
              lovebomb.works
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleDownloadPNG}
          disabled={isExporting}
          className="rounded-lg border border-white/10 bg-white/[0.05] px-5 py-3 text-sm text-muted transition-colors hover:bg-white/[0.08] hover:text-text disabled:opacity-50"
        >
          {isExporting ? "Exporting..." : "Download PNG"}
        </button>
        <button
          onClick={handleShareTwitter}
          className="rounded-lg border border-white/10 bg-white/[0.05] px-5 py-3 text-sm text-muted transition-colors hover:bg-white/[0.08] hover:text-text"
        >
          Share to Twitter
        </button>
        <Link
          href="/"
          className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-background transition-colors hover:bg-accent-hover"
        >
          Try lovebomb.works →
        </Link>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0">
        <Footer />
      </div>
    </div>
  );
}
