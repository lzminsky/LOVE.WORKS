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
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 pb-safe pt-safe text-text sm:p-6">
        <h1 className="mb-3 text-xl font-semibold sm:mb-4 sm:text-2xl">Invalid share link</h1>
        <p className="mb-6 text-sm text-muted sm:mb-8 sm:text-base">
          This link doesn&apos;t contain valid data.
        </p>
        <Link
          href="/"
          className="min-h-[44px] rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-background transition-colors hover:bg-accent-hover sm:px-5"
        >
          Try lovebomb.works →
        </Link>
        <div className="absolute bottom-0 left-0 right-0 pb-safe">
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 pb-safe pt-safe text-text sm:p-6">
      <div className="mb-4 text-xs uppercase tracking-[0.1em] text-muted-dark sm:mb-6 sm:text-[13px]">
        Shared Result
      </div>

      {/* Card - responsive scaling */}
      <div className="mb-6 w-full max-w-[600px] overflow-hidden sm:mb-8">
        <div
          ref={cardRef}
          className="relative aspect-[1200/628] w-full overflow-hidden rounded-lg border border-white/[0.08] bg-[#0d0d0d] p-4 sm:rounded-xl sm:p-8 md:p-12"
          style={{ transformOrigin: "center" }}
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
              <div className="mb-2 flex flex-wrap items-center gap-1.5 sm:mb-5 sm:gap-2">
                <span className="rounded bg-white/[0.05] px-1.5 py-0.5 font-mono text-[9px] text-muted-dark sm:px-2 sm:py-1 sm:text-[11px]">
                  {data.id}
                </span>
                <span className="text-[9px] font-medium text-accent sm:text-[11px]">
                  {data.confidence}% confidence
                </span>
              </div>

              <h1 className="mb-2 text-lg font-semibold leading-tight tracking-tight text-text sm:mb-4 sm:text-2xl md:text-4xl md:leading-none">
                {line1}
                {line2 && (
                  <>
                    <br />
                    {line2}
                  </>
                )}
              </h1>

              <p className="max-w-[85%] text-xs leading-relaxed text-muted sm:max-w-[400px] sm:text-sm md:text-base">
                {data.description}
              </p>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                <div className="h-1.5 w-1.5 rounded-full bg-accent sm:h-2.5 sm:w-2.5" />
                <span className="font-mono text-xs text-accent sm:text-sm">
                  {data.prediction.probability}%
                </span>
                <span className="text-xs text-muted sm:text-sm">
                  {data.prediction.outcome}
                </span>
              </div>

              <div className="text-xs font-semibold text-muted-dark sm:text-sm">
                lovebomb.works
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons - responsive layout */}
      <div className="flex w-full max-w-[600px] flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3">
        <button
          onClick={handleDownloadPNG}
          disabled={isExporting}
          className="min-h-[44px] flex-1 rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-muted transition-colors hover:bg-white/[0.08] hover:text-text disabled:opacity-50 sm:flex-none sm:px-5"
        >
          {isExporting ? "Exporting..." : "Download PNG"}
        </button>
        <button
          onClick={handleShareTwitter}
          className="min-h-[44px] flex-1 rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-muted transition-colors hover:bg-white/[0.08] hover:text-text sm:flex-none sm:px-5"
        >
          Share to 𝕏
        </button>
        <Link
          href="/"
          className="min-h-[44px] w-full rounded-lg bg-accent px-4 py-3 text-center text-sm font-semibold text-background transition-colors hover:bg-accent-hover sm:w-auto sm:px-5"
        >
          Try lovebomb.works →
        </Link>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 pb-safe">
        <Footer />
      </div>
    </div>
  );
}
