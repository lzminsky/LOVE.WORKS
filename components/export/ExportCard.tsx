"use client";

import { useRef, useState, useCallback, useMemo } from "react";
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
  const [linkCopied, setLinkCopied] = useState(false);

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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-text">
      <div className="mb-6 text-[13px] uppercase tracking-[0.1em] text-muted-dark">
        Export Preview — 1200×628
      </div>

      {/* Card Preview (scaled down from 1200x628 to 600x314) */}
      <div
        ref={cardRef}
        className="relative mb-8 h-[314px] w-[600px] overflow-hidden rounded-xl border border-white/[0.08] bg-[#0d0d0d] p-12"
        style={{ transform: "scale(1)", transformOrigin: "center" }}
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
                {equilibrium.id}
              </span>
              <span className="text-[11px] font-medium text-accent">
                {equilibrium.confidence}% confidence
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
              {tagline || equilibrium.description}
            </p>
          </div>

          <div className="flex items-end justify-between">
            {topPrediction && (
              <div className="flex items-center gap-2.5">
                <div className="h-2.5 w-2.5 rounded-full bg-accent" />
                <span className="font-mono text-sm text-accent">
                  {topPrediction.probability}%
                </span>
                <span className="text-sm text-muted">
                  {topPrediction.outcome}
                </span>
              </div>
            )}

            <div className="text-sm font-semibold text-muted-dark">
              lovebomb.works
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons - two rows */}
      <div className="flex flex-col items-center gap-3">
        {/* Primary actions */}
        <div className="flex gap-3">
          <button
            onClick={handleCopyLink}
            className="rounded-lg border border-white/10 bg-white/[0.05] px-5 py-3 text-sm text-muted transition-colors hover:bg-white/[0.08] hover:text-text"
          >
            {linkCopied ? "✓ Copied!" : "Copy Link"}
          </button>
          <button
            onClick={handleShareTwitter}
            className="rounded-lg border border-white/10 bg-white/[0.05] px-5 py-3 text-sm text-muted transition-colors hover:bg-white/[0.08] hover:text-text"
          >
            Share to 𝕏
          </button>
          <button
            onClick={handleDownloadPNG}
            disabled={isExporting}
            className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-background transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {isExporting ? "Exporting..." : "Download PNG"}
          </button>
        </div>

        {/* Secondary actions */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="rounded-lg border border-white/10 bg-transparent px-5 py-3 text-sm text-muted transition-colors hover:border-white/20 hover:text-text"
          >
            ← Back
          </button>
          <button
            onClick={handleDownloadMarkdown}
            className="rounded-lg border border-white/10 bg-transparent px-5 py-3 text-sm text-muted-dark transition-colors hover:border-white/20 hover:text-muted"
          >
            Download Markdown
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0">
        <Footer />
      </div>
    </div>
  );
}
