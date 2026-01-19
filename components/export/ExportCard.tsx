"use client";

import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import { Footer } from "@/components/ui/Footer";
import { Analytics } from "@/lib/analytics";

interface Equilibrium {
  id: string;
  name: string;
  description: string;
  confidence: number;
  predictions: {
    outcome: string;
    probability: number;
    level: "high" | "medium" | "low" | "minimal";
  }[];
}

interface Message {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  phase?: string;
  equilibrium?: Equilibrium;
  formalAnalysis?: {
    parameters: { param: string; value: string; basis: string }[];
    extensions: { id: string; name: string; status: string; detail: string }[];
  };
}

interface ExportCardProps {
  onBack: () => void;
  equilibrium?: Equilibrium;
  tagline?: string;
  messages?: Message[];
}

// Default data for preview
const DEFAULT_EQUILIBRIUM: Equilibrium = {
  id: "EQ-001",
  name: "Situationship Steady State",
  description:
    "He's optimizing correctly. You're the one mispricing the contract.",
  confidence: 70,
  predictions: [
    { outcome: "Status quo continues", probability: 65, level: "high" },
  ],
};

// Helper to extract clean content from message (strip thinking blocks, phase tags, JSON blocks)
function cleanMessageContent(content: string): string {
  return content
    .replace(/<phase>(INTAKE|BUILDING|DIAGNOSIS)<\/phase>\s*/g, "")
    .replace(/<thinking>[\s\S]*?<\/thinking>/g, "")
    .replace(/```equilibrium\n[\s\S]*?\n```/g, "")
    .replace(/```analysis\n[\s\S]*?\n```/g, "")
    .trim();
}

// Helper to extract thinking content from message
function extractThinking(content: string): string | null {
  const match = content.match(/<thinking>([\s\S]*?)<\/thinking>/);
  return match ? match[1].trim() : null;
}

// Generate full conversation markdown
function generateConversationMarkdown(messages: Message[]): string {
  const lines: string[] = [];

  for (const msg of messages) {
    if (msg.role === "system") {
      lines.push(`> *${msg.content}*`);
      lines.push("");
    } else if (msg.role === "user") {
      lines.push(`**You:** ${msg.content}`);
      lines.push("");
    } else if (msg.role === "assistant") {
      const cleanContent = cleanMessageContent(msg.content);
      lines.push(`**Analysis:** ${cleanContent}`);
      lines.push("");

      // Add thinking/formal analysis if present
      const thinking = extractThinking(msg.content);
      if (thinking) {
        lines.push("<details>");
        lines.push("<summary>Formal Analysis</summary>");
        lines.push("");
        lines.push("```");
        lines.push(thinking);
        lines.push("```");
        lines.push("</details>");
        lines.push("");
      }

      // Add structured formal analysis if present
      if (msg.formalAnalysis) {
        if (!thinking) {
          lines.push("<details>");
          lines.push("<summary>Formal Analysis</summary>");
          lines.push("");
        }

        if (msg.formalAnalysis.parameters?.length > 0) {
          lines.push("**Parameters:**");
          for (const p of msg.formalAnalysis.parameters) {
            lines.push(`- ${p.param}: ${p.value} (${p.basis})`);
          }
          lines.push("");
        }

        if (msg.formalAnalysis.extensions?.length > 0) {
          lines.push("**Extensions:**");
          for (const e of msg.formalAnalysis.extensions) {
            lines.push(`- ${e.id} ${e.name} [${e.status}]: ${e.detail}`);
          }
          lines.push("");
        }

        if (!thinking) {
          lines.push("</details>");
          lines.push("");
        }
      }

      // Add equilibrium if present
      if (msg.equilibrium) {
        lines.push("---");
        lines.push("");
        lines.push(`### ${msg.equilibrium.name}`);
        lines.push(`*${msg.equilibrium.description}*`);
        lines.push("");
        lines.push(`**Confidence:** ${msg.equilibrium.confidence}%`);
        lines.push("");
        lines.push("**Predictions:**");
        for (const pred of msg.equilibrium.predictions) {
          lines.push(`- ${pred.probability}% — ${pred.outcome}`);
        }
        lines.push("");
      }
    }
  }

  return lines.join("\n");
}

export function ExportCard({
  onBack,
  equilibrium = DEFAULT_EQUILIBRIUM,
  tagline,
  messages = [],
}: ExportCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  // Check if native sharing is available (iOS/Android)
  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && "share" in navigator);
  }, []);

  // Split name into lines for display
  const nameLines = equilibrium.name.split(" ");
  const midpoint = Math.ceil(nameLines.length / 2);
  const line1 = nameLines.slice(0, midpoint).join(" ");
  const line2 = nameLines.slice(midpoint).join(" ");

  // Get top prediction
  const topPrediction = equilibrium.predictions[0];

  // Generate shareable URL with encoded data
  const shareUrl = useMemo(() => {
    const shareData = {
      id: equilibrium.id,
      name: equilibrium.name,
      description: tagline || equilibrium.description,
      confidence: equilibrium.confidence,
      prediction: topPrediction || { outcome: "Unknown", probability: 0, level: "low" },
    };
    const encoded = btoa(JSON.stringify(shareData));
    // Use window.location.origin for full URL, fallback for SSR
    const origin = typeof window !== "undefined" ? window.location.origin : "https://lovebomb.works";
    return `${origin}/share?d=${encoded}`;
  }, [equilibrium, tagline, topPrediction]);

  const handleDownloadPNG = useCallback(async () => {
    if (!cardRef.current) return;

    setIsExporting(true);
    try {
      // Dynamic import to avoid SSR issues
      const { toPng } = await import("html-to-image");

      const dataUrl = await toPng(cardRef.current, {
        width: 1200,
        height: 628,
        pixelRatio: 2,
        backgroundColor: "#0d0d0d",
      });

      // Download
      const link = document.createElement("a");
      link.download = `lovebomb-works-${equilibrium.id}.png`;
      link.href = dataUrl;
      link.click();

      Analytics.exportGenerated("png");
      Analytics.shareCompleted("download");
    } catch (err) {
      console.error("Failed to export:", err);
    } finally {
      setIsExporting(false);
    }
  }, [equilibrium.id]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);

      Analytics.exportGenerated("link");
      Analytics.shareCompleted("copy_link");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [shareUrl]);

  const handleShareTwitter = useCallback(() => {
    const text = `${equilibrium.name}\n\n"${tagline || equilibrium.description}"\n\n${topPrediction?.probability || 0}% ${topPrediction?.outcome || "Unknown"}\n\nvia`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=550,height=420");

    Analytics.exportGenerated("twitter");
    Analytics.shareCompleted("twitter");
  }, [equilibrium, tagline, topPrediction, shareUrl]);

  const handleDownloadMarkdown = useCallback(() => {
    // Generate full conversation markdown
    const conversationContent = generateConversationMarkdown(messages);
    const timestamp = new Date().toISOString().split("T")[0];

    const markdown = `# Conversation Export — lovebomb.works

**Date:** ${timestamp}

---

## Conversation

${conversationContent}

---

*Exported from lovebomb.works*
`;

    // Create and download file
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `lovebomb-works-conversation-${timestamp}.md`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);

    Analytics.exportGenerated("markdown");
    Analytics.shareCompleted("download");
  }, [messages]);

  const handleNativeShare = useCallback(async () => {
    if (!cardRef.current) return;

    setIsSharing(true);
    try {
      const { toPng } = await import("html-to-image");

      const dataUrl = await toPng(cardRef.current, {
        width: 1200,
        height: 628,
        pixelRatio: 2,
        backgroundColor: "#0d0d0d",
      });

      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `lovebomb-works-${equilibrium.id}.png`, { type: "image/png" });

      const shareData = {
        title: equilibrium.name,
        text: `${equilibrium.name} — "${tagline || equilibrium.description}"`,
        url: shareUrl,
        files: [file],
      };

      // Check if we can share files, otherwise just share URL
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share(shareData);
      } else {
        await navigator.share({
          title: equilibrium.name,
          text: `${equilibrium.name} — "${tagline || equilibrium.description}"`,
          url: shareUrl,
        });
      }

      Analytics.exportGenerated("native_share");
      Analytics.shareCompleted("native_share");
    } catch (err) {
      // User cancelled or share failed
      if ((err as Error).name !== "AbortError") {
        console.error("Failed to share:", err);
      }
    } finally {
      setIsSharing(false);
    }
  }, [equilibrium, tagline, shareUrl]);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center overflow-y-auto bg-background px-4 py-6 pt-safe text-text sm:justify-center sm:p-6">
      <div className="mb-3 text-[11px] uppercase tracking-[0.1em] text-muted-dark sm:mb-6 sm:text-[13px]">
        Export Preview
      </div>

      {/* Card Preview - responsive scaling */}
      <div className="mb-5 w-full max-w-[600px] flex-shrink-0 overflow-hidden sm:mb-8">
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
                  {equilibrium.id}
                </span>
                <span className="text-[9px] font-medium text-accent sm:text-[11px]">
                  {equilibrium.confidence}% confidence
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
                {tagline || equilibrium.description}
              </p>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-2">
              {topPrediction && (
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent sm:h-2.5 sm:w-2.5" />
                  <span className="font-mono text-xs text-accent sm:text-sm">
                    {topPrediction.probability}%
                  </span>
                  <span className="text-xs text-muted sm:text-sm">
                    {topPrediction.outcome}
                  </span>
                </div>
              )}

              <div className="text-xs font-semibold text-muted-dark sm:text-sm">
                lovebomb.works
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons - responsive layout */}
      <div className="flex w-full max-w-[600px] flex-col items-center gap-2 sm:gap-3">
        {/* Native Share button - prominent on mobile when available */}
        {canShare && (
          <button
            onClick={handleNativeShare}
            disabled={isSharing}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-[15px] font-semibold text-background transition-colors hover:bg-accent-hover disabled:opacity-50 sm:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            {isSharing ? "Preparing..." : "Share"}
          </button>
        )}

        {/* Primary actions - stack on mobile */}
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-3">
          <button
            onClick={handleCopyLink}
            className="min-h-[44px] rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2.5 text-[13px] text-muted transition-colors hover:bg-white/[0.08] hover:text-text sm:px-5 sm:py-3 sm:text-sm"
          >
            {linkCopied ? "✓ Copied!" : "Copy Link"}
          </button>
          <button
            onClick={handleShareTwitter}
            className="min-h-[44px] rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2.5 text-[13px] text-muted transition-colors hover:bg-white/[0.08] hover:text-text sm:px-5 sm:py-3 sm:text-sm"
          >
            Share to 𝕏
          </button>
          <button
            onClick={canShare ? handleNativeShare : handleDownloadPNG}
            disabled={isExporting || isSharing}
            className="hidden min-h-[44px] rounded-lg bg-accent px-3 py-2.5 text-[13px] font-semibold text-background transition-colors hover:bg-accent-hover disabled:opacity-50 sm:block sm:px-5 sm:py-3 sm:text-sm"
          >
            {isExporting || isSharing ? "Preparing..." : canShare ? "Share" : "Download PNG"}
          </button>
          <button
            onClick={handleDownloadPNG}
            disabled={isExporting}
            className={`min-h-[44px] rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2.5 text-[13px] text-muted transition-colors hover:bg-white/[0.08] hover:text-text sm:px-5 sm:py-3 sm:text-sm ${canShare ? "col-span-2" : "col-span-2 !bg-accent !text-background hover:!bg-accent-hover font-semibold"}`}
          >
            {isExporting ? "Exporting..." : "Download PNG"}
          </button>
        </div>

        {/* Secondary actions */}
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-3">
          <button
            onClick={onBack}
            className="min-h-[44px] rounded-lg border border-white/10 bg-transparent px-3 py-2.5 text-[13px] text-muted transition-colors hover:border-white/20 hover:text-text sm:px-5 sm:py-3 sm:text-sm"
          >
            ← Back
          </button>
          <button
            onClick={handleDownloadMarkdown}
            className="min-h-[44px] rounded-lg border border-white/10 bg-transparent px-3 py-2.5 text-[13px] text-muted-dark transition-colors hover:border-white/20 hover:text-muted sm:px-5 sm:py-3 sm:text-sm"
          >
            Markdown
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 w-full flex-shrink-0 pb-safe sm:mt-8">
        <Footer />
      </div>
    </div>
  );
}
