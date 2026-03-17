"use client";

import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import { Footer } from "@/components/ui/Footer";
import { Analytics } from "@/lib/analytics";
import { DISCLAIMER } from "@/lib/constants";
import { useSkin } from "@/lib/skin-context";
import { VerticalCard } from "./VerticalCard";
import type { Equilibrium, Message } from "@/lib/types";

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
  const { skin } = useSkin();
  const exportBg = skin === "soft" ? "#faf8f5" : "#0d0d0d";
  const verticalRef = useRef<HTMLDivElement>(null);
  const [format, setFormat] = useState<"horizontal" | "vertical">("horizontal");
  const [showPredictions, setShowPredictions] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [permalink, setPermalink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  const activeRef = format === "horizontal" ? cardRef : verticalRef;
  const exportWidth = format === "horizontal" ? 1200 : 1080;
  const exportHeight = format === "horizontal" ? 628 : 1920;

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
    if (!activeRef.current) return;

    setIsExporting(true);
    try {
      // Dynamic import to avoid SSR issues
      const { toPng } = await import("html-to-image");

      const dataUrl = await toPng(activeRef.current, {
        width: exportWidth,
        height: exportHeight,
        pixelRatio: 2,
        backgroundColor: exportBg,
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
  }, [equilibrium.id, format, skin]);

  const [twitterImageCopied, setTwitterImageCopied] = useState(false);

  const handleShareTwitter = useCallback(async () => {
    if (!activeRef.current) return;

    try {
      // Generate the PNG
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(activeRef.current, {
        width: exportWidth,
        height: exportHeight,
        pixelRatio: 2,
        backgroundColor: exportBg,
      });

      // Convert to blob and copy to clipboard
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob })
        ]);
        setTwitterImageCopied(true);
        setTimeout(() => setTwitterImageCopied(false), 5000);
      } catch {
        // Clipboard API for images not supported, fall back to just opening X
        console.log("Image clipboard not supported");
      }

      // Compose tweet text - short, punchy, no URL
      const text = `my relationship equilibrium:\n\n${equilibrium.name}\n${topPrediction?.probability || 0}% ${topPrediction?.outcome || "Unknown"}\n\nlovebomb.works`;

      // Open X compose (user will paste the image)
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank", "width=550,height=520");

      Analytics.exportGenerated("twitter");
      Analytics.shareCompleted("twitter");
    } catch (err) {
      console.error("Failed to prepare Twitter share:", err);
      // Fallback: just open with text
      const text = `my relationship equilibrium:\n\n${equilibrium.name}\n${topPrediction?.probability || 0}% ${topPrediction?.outcome || "Unknown"}\n\nlovebomb.works`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank", "width=550,height=520");
    }
  }, [equilibrium, topPrediction, format, skin]);

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
    if (!activeRef.current) return;

    setIsSharing(true);
    try {
      const { toPng } = await import("html-to-image");

      const dataUrl = await toPng(activeRef.current, {
        width: exportWidth,
        height: exportHeight,
        pixelRatio: 2,
        backgroundColor: exportBg,
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

      Analytics.exportGenerated("png");
      Analytics.shareCompleted("download");
    } catch (err) {
      // User cancelled or share failed
      if ((err as Error).name !== "AbortError") {
        console.error("Failed to share:", err);
      }
    } finally {
      setIsSharing(false);
    }
  }, [equilibrium, tagline, shareUrl, format, skin]);

  const handleCopyLink = useCallback(async () => {
    // Generate permalink on first click (lazy)
    if (!permalink) {
      setIsGeneratingLink(true);
      try {
        const res = await fetch("/api/diagnosis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            equilibrium,
            tagline: tagline || equilibrium.description,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setPermalink(data.url);
          await navigator.clipboard.writeText(data.url);
          setLinkCopied(true);
          setTimeout(() => setLinkCopied(false), 2000);
          Analytics.shareCompleted("copy_link");
        }
      } catch (err) {
        console.error("Failed to generate permalink:", err);
      } finally {
        setIsGeneratingLink(false);
      }
      return;
    }

    // Already have permalink, just copy
    await navigator.clipboard.writeText(permalink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }, [permalink, equilibrium, tagline]);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center overflow-y-auto bg-background px-4 py-6 pt-safe text-text sm:justify-center sm:p-6">
      <div className="mb-3 text-[11px] uppercase tracking-[0.1em] text-muted-dark sm:mb-6 sm:text-[13px]">
        Export Preview
      </div>

      {/* Format toggle */}
      <div className="mb-3 flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--overlay)] p-1 sm:mb-4">
        <button
          onClick={() => setFormat("horizontal")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            format === "horizontal"
              ? "bg-accent text-background"
              : "text-muted hover:text-text"
          }`}
        >
          Twitter
        </button>
        <button
          onClick={() => setFormat("vertical")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            format === "vertical"
              ? "bg-accent text-background"
              : "text-muted hover:text-text"
          }`}
        >
          Stories
        </button>
      </div>

      {/* Customization toggle */}
      <div className="mb-4 flex items-center gap-2 sm:mb-5">
        <button
          onClick={() => setShowPredictions(!showPredictions)}
          className="flex items-center gap-1.5 text-xs text-muted-dark transition-colors hover:text-muted"
        >
          <span className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${
            showPredictions ? "border-accent bg-accent" : "border-muted-dark"
          }`}>
            {showPredictions && (
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </span>
          Show predictions
        </button>
      </div>

      {/* Card Preview - responsive scaling */}
      <div className={`mb-5 w-full flex-shrink-0 overflow-hidden sm:mb-8 ${format === "horizontal" ? "max-w-[600px]" : "max-w-[280px]"}`}>
        {format === "horizontal" ? (
          <div
            ref={cardRef}
            className="relative aspect-[1200/628] w-full overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--modal-bg)] p-4 sm:rounded-xl sm:p-8 md:p-12"
            style={{ transformOrigin: "center" }}
          >
            {/* Grid background */}
            <div
              className="pointer-events-none absolute inset-0 opacity-50"
              style={{
                backgroundImage: `
                  linear-gradient(var(--border) 1px, transparent 1px),
                  linear-gradient(90deg, var(--border) 1px, transparent 1px)
                `,
                backgroundSize: "32px 32px",
              }}
            />

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-1.5 sm:mb-5 sm:gap-2">
                  <span className="rounded bg-[var(--overlay-hover)] px-1.5 py-0.5 font-mono text-[9px] text-muted-dark sm:px-2 sm:py-1 sm:text-[11px]">
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
                {topPrediction && showPredictions && (
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

                <div className="flex flex-col items-end gap-0.5">
                  <div className="text-xs font-semibold text-muted-dark sm:text-sm">
                    lovebomb.works
                  </div>
                  <div className="text-[7px] text-muted-darker sm:text-[9px]">
                    {DISCLAIMER}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            ref={verticalRef}
            className="w-full overflow-hidden rounded-lg border border-[var(--border)]"
          >
            <VerticalCard
              equilibrium={equilibrium}
              showPredictions={showPredictions}
            />
          </div>
        )}
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
            onClick={handleShareTwitter}
            className="min-h-[44px] rounded-lg border border-[var(--border)] bg-[var(--overlay-hover)] px-3 py-2.5 text-[13px] text-muted transition-colors hover:bg-[var(--overlay-hover)] hover:text-text sm:px-5 sm:py-3 sm:text-sm"
          >
            {twitterImageCopied ? "Image copied — paste in 𝕏" : "Share to 𝕏"}
          </button>
          <button
            onClick={handleCopyLink}
            disabled={isGeneratingLink}
            className="min-h-[44px] rounded-lg border border-[var(--border)] bg-[var(--overlay-hover)] px-3 py-2.5 text-[13px] text-muted transition-colors hover:bg-[var(--overlay-hover)] hover:text-text sm:px-5 sm:py-3 sm:text-sm"
          >
            {isGeneratingLink ? "Generating..." : linkCopied ? "Link copied!" : "Copy link"}
          </button>
          <button
            onClick={handleDownloadPNG}
            disabled={isExporting}
            className="min-h-[44px] rounded-lg border border-[var(--border)] bg-[var(--overlay-hover)] px-3 py-2.5 text-[13px] text-muted transition-colors hover:bg-[var(--overlay-hover)] hover:text-text sm:px-5 sm:py-3 sm:text-sm"
          >
            {isExporting ? "Exporting..." : "Download PNG"}
          </button>
          <button
            onClick={handleDownloadMarkdown}
            className="min-h-[44px] rounded-lg bg-accent px-3 py-2.5 text-[13px] font-semibold text-background transition-colors hover:bg-accent-hover sm:px-5 sm:py-3 sm:text-sm"
          >
            Save Conversation
          </button>
        </div>

        {/* Back button */}
        <button
          onClick={onBack}
          className="min-h-[44px] rounded-lg border border-[var(--border)] bg-transparent px-5 py-2.5 text-[13px] text-muted transition-colors hover:border-accent/30 hover:text-text sm:py-3 sm:text-sm"
        >
          ← Back
        </button>
      </div>

      {/* Footer */}
      <div className="mt-6 w-full flex-shrink-0 pb-safe sm:mt-8">
        <Footer />
      </div>
    </div>
  );
}
